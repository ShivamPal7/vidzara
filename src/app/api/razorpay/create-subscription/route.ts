import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma, Plan, BillingCycle, SubscriptionStatus } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getPlanConfigsInternal } from "@/actions/admin/plan-config";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planType, isIndia, couponCode } = await req.json();

    if (!planType) {
      return NextResponse.json({ error: "Missing planType" }, { status: 400 });
    }

    // 1. Determine plan type, billing cycle, and currency
    let dbPlan: Plan = Plan.FREE;
    let dbCycle: BillingCycle = BillingCycle.MONTHLY;

    if (planType.includes("creator")) {
      dbPlan = Plan.LIMITED_PRO;
    } else if (planType.includes("studio")) {
      dbPlan = Plan.UNLIMITED_PRO;
    } else {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    if (planType.includes("yearly")) {
      dbCycle = BillingCycle.YEARLY;
    } else {
      dbCycle = BillingCycle.MONTHLY;
    }

    const currency = isIndia ? "INR" : "USD";
    const planNamePrefix = dbPlan === Plan.LIMITED_PRO ? "Creator Pro" : "Studio Unlimited";
    const isTrial = planType.includes("trial");

    // Check if trial restrictions apply
    if (isTrial) {
      const userSub = await prisma.subscription.findUnique({
        where: { userId: session.user.id },
      });

      if (userSub) {
        // Cannot downgrade to trial if they currently have an active paid plan
        if (userSub.plan !== Plan.FREE && userSub.status === SubscriptionStatus.ACTIVE) {
          return NextResponse.json(
            { error: "You already have an active plan and cannot downgrade to a trial." },
            { status: 400 }
          );
        }

        // Trial is one-time access only (prevent if they have gatewaySubscriptionId or had a non-FREE plan)
        if (userSub.gatewaySubscriptionId || userSub.plan !== Plan.FREE) {
          return NextResponse.json(
            { error: "The trial plan is only for one-time access, which you have already used." },
            { status: 400 }
          );
        }
      }
    }

    // 2. Fetch configurations from the database (seeds if empty)
    await getPlanConfigsInternal();
    const config = await prisma.planConfig.findUnique({
      where: { plan: dbPlan },
    });

    if (!config) {
      return NextResponse.json({ error: "Plan configuration not found" }, { status: 500 });
    }

    // 3. Get base price
    let basePrice = 0;
    if (currency === "INR") {
      basePrice = dbCycle === BillingCycle.YEARLY ? config.yearlyPriceINR : config.monthlyPriceINR;
    } else {
      basePrice = dbCycle === BillingCycle.YEARLY ? config.yearlyPriceUSD : config.monthlyPriceUSD;
    }

    let targetPrice = basePrice;
    let validatedCoupon = null;

    // 4. Validate coupon code if provided
    if (couponCode && !isTrial) {
      const cleanCode = couponCode.trim().toUpperCase();
      const coupon = await prisma.coupon.findUnique({
        where: { code: cleanCode },
      });

      if (coupon && coupon.active) {
        const isNotExpired = !coupon.expiresAt || new Date() <= new Date(coupon.expiresAt);
        const hasUsesLeft = coupon.maxUses === null || coupon.usedCount < coupon.maxUses;
        
        let countryMatches = true;
        if (coupon.country) {
          const couponCountry = coupon.country.toUpperCase();
          if ((couponCountry === "IN" && !isIndia) || (couponCountry !== "IN" && isIndia)) {
            countryMatches = false;
          }
        }

        const userUsageCount = await prisma.couponUsage.count({
          where: { couponId: coupon.id, userId: session.user.id },
        });
        const withinUserLimit = coupon.perUserLimit === null || userUsageCount < coupon.perUserLimit;

        if (isNotExpired && hasUsesLeft && countryMatches && withinUserLimit) {
          validatedCoupon = coupon;
          const discountAmount = Math.round((basePrice * coupon.discountPercent) / 100);
          targetPrice = basePrice - discountAmount;
        }
      }
    }

    let planId = "";

    // 5. Select or create Razorpay Plan ID (always use base plan ID)
    if (currency === "INR") {
      planId = dbCycle === BillingCycle.YEARLY ? config.razorpayPlanYearlyINR || "" : config.razorpayPlanMonthlyINR || "";
    } else {
      planId = dbCycle === BillingCycle.YEARLY ? config.razorpayPlanYearlyUSD || "" : config.razorpayPlanMonthlyUSD || "";
    }

    // If not configured, create it dynamically
    if (!planId) {
      const targetAmountSubunit = Math.round(basePrice * 100);
      try {
        const rpPlan = await razorpay.plans.create({
          period: dbCycle === BillingCycle.YEARLY ? "yearly" : "monthly",
          interval: 1,
          item: {
            name: `${planNamePrefix} - ${dbCycle} (${currency})`,
            amount: targetAmountSubunit,
            currency: currency,
            description: `${planNamePrefix} base plan`,
          },
        });

        planId = rpPlan.id;

        const updateData: any = {};
        if (currency === "INR") {
          if (dbCycle === BillingCycle.YEARLY) updateData.razorpayPlanYearlyINR = planId;
          else updateData.razorpayPlanMonthlyINR = planId;
        } else {
          if (dbCycle === BillingCycle.YEARLY) updateData.razorpayPlanYearlyUSD = planId;
          else updateData.razorpayPlanMonthlyUSD = planId;
        }

        await prisma.planConfig.update({
          where: { plan: dbPlan },
          data: updateData,
        });
      } catch (error: any) {
        console.error("Base Razorpay Plan Creation Failed:", error);
        return NextResponse.json({ 
          error: "Failed to initialize base plan on payment gateway. Please contact support.",
          details: error.message 
        }, { status: 500 });
      }
    }

    // 6. Create Razorpay Subscription with self-healing fallback for invalid plan IDs
    let subscription;
    try {
      if (isTrial) {
        const trialDays = isIndia ? 7 : 3;
        const startAt = Math.floor(Date.now() / 1000) + trialDays * 24 * 60 * 60; // 7 or 3 days from now
        const trialAmount = currency === "INR" ? 9900 : 100; // ₹99 or $1

        subscription = await razorpay.subscriptions.create({
          plan_id: planId,
          customer_notify: 1,
          total_count: 12,
          start_at: startAt,
          addons: [
            {
              item: {
                name: `${planNamePrefix} ${trialDays}-Day Trial`,
                amount: trialAmount,
                currency: currency,
                description: `Initial ${trialDays}-day trial charge with 100 credits`
              }
            }
          ],
          notes: {
            is_trial: "true",
            credits_to_grant: "100"
          }
        });
      } else if (validatedCoupon && targetPrice < basePrice) {
        // First month/year discount applied via addon upfront payment
        const cycleDays = dbCycle === BillingCycle.YEARLY ? 365 : 30;
        const startAt = Math.floor(Date.now() / 1000) + cycleDays * 24 * 60 * 60;
        const discountAmountSubunit = Math.round(targetPrice * 100);

        subscription = await razorpay.subscriptions.create({
          plan_id: planId,
          customer_notify: 1,
          total_count: 12,
          start_at: startAt,
          addons: [
            {
              item: {
                name: `${planNamePrefix} - First ${dbCycle === BillingCycle.YEARLY ? "Year" : "Month"} Discounted`,
                amount: discountAmountSubunit,
                currency: currency,
                description: `First cycle with ${validatedCoupon.discountPercent}% discount via coupon ${validatedCoupon.code}`
              }
            }
          ],
          notes: {
            is_discounted: "true",
            coupon_code: validatedCoupon.code
          }
        });
      } else {
        subscription = await razorpay.subscriptions.create({
          plan_id: planId,
          customer_notify: 1,
          total_count: 12,
        });
      }
    } catch (error: any) {
      console.warn("[Razorpay] Initial subscription creation failed, checking if plan ID is invalid:", error);
      
      const isInvalidPlanError = error.statusCode === 400 && 
        error.error?.code === "BAD_REQUEST_ERROR" && 
        (error.error?.description?.includes("ID provided is invalid") || error.error?.description?.includes("could not be found"));

      if (isInvalidPlanError) {
        console.warn(`[Razorpay] Plan ID ${planId} was invalid. Regenerating plan dynamically...`);
        
        const targetAmountSubunit = Math.round(basePrice * 100);
        const rpPlan = await razorpay.plans.create({
          period: dbCycle === BillingCycle.YEARLY ? "yearly" : "monthly",
          interval: 1,
          item: {
            name: `${planNamePrefix} - ${dbCycle} (${currency})`,
            amount: targetAmountSubunit,
            currency: currency,
            description: `${planNamePrefix} base plan`,
          },
        });

        planId = rpPlan.id;

        // Update database config
        const updateData: any = {};
        if (currency === "INR") {
          if (dbCycle === BillingCycle.YEARLY) updateData.razorpayPlanYearlyINR = planId;
          else updateData.razorpayPlanMonthlyINR = planId;
        } else {
          if (dbCycle === BillingCycle.YEARLY) updateData.razorpayPlanYearlyUSD = planId;
          else updateData.razorpayPlanMonthlyUSD = planId;
        }

        await prisma.planConfig.update({
          where: { plan: dbPlan },
          data: updateData,
        });

        console.log(`[Razorpay] Dynamically created new plan ${planId} and updated database config.`);

        // Retry subscription creation
        if (isTrial) {
          const trialDays = isIndia ? 7 : 3;
          const startAt = Math.floor(Date.now() / 1000) + trialDays * 24 * 60 * 60;
          const trialAmount = currency === "INR" ? 9900 : 100;

          subscription = await razorpay.subscriptions.create({
            plan_id: planId,
            customer_notify: 1,
            total_count: 12,
            start_at: startAt,
            addons: [
              {
                item: {
                  name: `${planNamePrefix} ${trialDays}-Day Trial`,
                  amount: trialAmount,
                  currency: currency,
                  description: `Initial ${trialDays}-day trial charge with 100 credits`
                }
              }
            ],
            notes: {
              is_trial: "true",
              credits_to_grant: "100"
            }
          });
        } else if (validatedCoupon && targetPrice < basePrice) {
          const cycleDays = dbCycle === BillingCycle.YEARLY ? 365 : 30;
          const startAt = Math.floor(Date.now() / 1000) + cycleDays * 24 * 60 * 60;
          const discountAmountSubunit = Math.round(targetPrice * 100);

          subscription = await razorpay.subscriptions.create({
            plan_id: planId,
            customer_notify: 1,
            total_count: 12,
            start_at: startAt,
            addons: [
              {
                item: {
                  name: `${planNamePrefix} - First ${dbCycle === BillingCycle.YEARLY ? "Year" : "Month"} Discounted`,
                  amount: discountAmountSubunit,
                  currency: currency,
                  description: `First cycle with ${validatedCoupon.discountPercent}% discount via coupon ${validatedCoupon.code}`
                }
              }
            ],
            notes: {
              is_discounted: "true",
              coupon_code: validatedCoupon.code
            }
          });
        } else {
          subscription = await razorpay.subscriptions.create({
            plan_id: planId,
            customer_notify: 1,
            total_count: 12,
          });
        }
      } else {
        // Not an invalid plan error, rethrow
        throw error;
      }
    }

    return NextResponse.json(subscription, { status: 200 });
  } catch (error: any) {
    console.error("Razorpay Subscription Creation Error:", error);
    return NextResponse.json(
      { error: "Failed to create Razorpay subscription", details: error.message },
      { status: 500 }
    );
  }
}

