import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma, Plan, BillingCycle } from "@/lib/prisma";
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
    if (couponCode) {
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

    // 5. Select or create Razorpay Plan ID
    if (validatedCoupon && targetPrice < basePrice) {
      // Coupon applied - handle dynamic plan creation
      const targetAmountSubunit = Math.round(targetPrice * 100); // in paise/cents
      
      let dynamicPlan = await prisma.dynamicPlan.findFirst({
        where: {
          plan: dbPlan,
          billingCycle: dbCycle,
          currency: currency,
          amount: targetAmountSubunit,
        },
      });

      if (!dynamicPlan) {
        // Create new plan dynamically on Razorpay
        try {
          const rpPlan = await razorpay.plans.create({
            period: dbCycle === BillingCycle.YEARLY ? "yearly" : "monthly",
            interval: 1,
            item: {
              name: `${planNamePrefix} - ${dbCycle} - ${currency} ${targetPrice} (Discounted)`,
              amount: targetAmountSubunit,
              currency: currency,
              description: `Subscription with ${validatedCoupon.discountPercent}% discount via coupon ${validatedCoupon.code}`,
            },
          });

          dynamicPlan = await prisma.dynamicPlan.create({
            data: {
              razorpayId: rpPlan.id,
              plan: dbPlan,
              billingCycle: dbCycle,
              currency: currency,
              amount: targetAmountSubunit,
            },
          });
        } catch (error: any) {
          console.error("Dynamic Razorpay Plan Creation Failed:", error);
          return NextResponse.json({ 
            error: "Failed to initialize payment gateway for discounted subscription. Please contact support.",
            details: error.message 
          }, { status: 500 });
        }
      }

      planId = dynamicPlan.razorpayId;
    } else {
      // No discount - get base plan ID
      if (currency === "INR") {
        planId = dbCycle === BillingCycle.YEARLY ? config.razorpayPlanYearlyINR || "" : config.razorpayPlanMonthlyINR || "";
      } else {
        planId = dbCycle === BillingCycle.YEARLY ? config.razorpayPlanYearlyUSD || "" : config.razorpayPlanMonthlyUSD || "";
      }

      // If not configured, create it dynamically
      if (!planId) {
        const targetAmountSubunit = Math.round(targetPrice * 100);
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
    }

    // 6. Create Razorpay Subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12, // Defaulting to 12 cycles
    });

    return NextResponse.json(subscription, { status: 200 });
  } catch (error: any) {
    console.error("Razorpay Subscription Creation Error:", error);
    return NextResponse.json(
      { error: "Failed to create Razorpay subscription", details: error.message },
      { status: 500 }
    );
  }
}
