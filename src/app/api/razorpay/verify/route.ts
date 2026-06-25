import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { prisma, Plan, BillingCycle, SubscriptionStatus, Gateway } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sendEmail } from "@/lib/email";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;

    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_subscription_id, 
      razorpay_signature,
      couponCode
    } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    if (!razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required signature fields." }, { status: 400 });
    }

    let generatedSignature = "";

    if (razorpay_order_id) {
      const hmac = crypto.createHmac("sha256", secret);
      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
      generatedSignature = hmac.digest("hex");
    } else if (razorpay_subscription_id) {
      const hmac = crypto.createHmac("sha256", secret);
      hmac.update(razorpay_payment_id + "|" + razorpay_subscription_id);
      generatedSignature = hmac.digest("hex");
    } else {
      return NextResponse.json({ error: "Missing order_id or subscription_id." }, { status: 400 });
    }

    const isSignatureValid = generatedSignature === razorpay_signature;

    if (!isSignatureValid) {
      return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });
    }

    // Signature is valid. Process the grant securely.
    if (razorpay_order_id) {
      // One-time Top Up
      const order = await razorpay.orders.fetch(razorpay_order_id);
      let creditsToAdd = 0;
      
      const amount = Number(order.amount);
      if (amount === 29900) creditsToAdd = 250;
      else if (amount === 99900) creditsToAdd = 1000;
      else if (amount === 249900) creditsToAdd = 3000;
      else creditsToAdd = Math.floor(amount / 100); // fallback

      await prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: creditsToAdd } },
      });

      return NextResponse.json({ success: true, message: "Top-up successful.", creditsAdded: creditsToAdd }, { status: 200 });

    } else if (razorpay_subscription_id) {
      // Recurring Subscription
      const subscription = await razorpay.subscriptions.fetch(razorpay_subscription_id);
      const planId = subscription.plan_id;
      
      let dbPlan: Plan = Plan.FREE;
      let dbCycle: BillingCycle = BillingCycle.MONTHLY;
      let creditsToAdd = 0;

      // 1. Look up plan in PlanConfig
      const planConfig = await prisma.planConfig.findFirst({
        where: {
          OR: [
            { razorpayPlanMonthlyINR: planId },
            { razorpayPlanYearlyINR: planId },
            { razorpayPlanMonthlyUSD: planId },
            { razorpayPlanYearlyUSD: planId },
          ]
        }
      });

      if (planConfig) {
        dbPlan = planConfig.plan;
        const isYearly = planConfig.razorpayPlanYearlyINR === planId || planConfig.razorpayPlanYearlyUSD === planId;
        dbCycle = isYearly ? BillingCycle.YEARLY : BillingCycle.MONTHLY;
        creditsToAdd = isYearly ? planConfig.yearlyCredits : planConfig.monthlyCredits;
      } else {
        // 2. Look up in DynamicPlan
        const dynamicPlan = await prisma.dynamicPlan.findUnique({
          where: { razorpayId: planId }
        });
        if (dynamicPlan) {
          dbPlan = dynamicPlan.plan;
          dbCycle = dynamicPlan.billingCycle;
          
          const baseConfig = await prisma.planConfig.findUnique({
            where: { plan: dbPlan }
          });
          if (baseConfig) {
            creditsToAdd = dbCycle === BillingCycle.YEARLY ? baseConfig.yearlyCredits : baseConfig.monthlyCredits;
          } else {
            creditsToAdd = dbPlan === Plan.UNLIMITED_PRO ? 6000 : 800;
          }
        } else {
          // 3. Fallback to existing environment variables
          if (planId === process.env.RAZORPAY_PLAN_CREATOR_MONTHLY_INR) {
            dbPlan = Plan.LIMITED_PRO;
            dbCycle = BillingCycle.MONTHLY;
            creditsToAdd = 800;
          } else if (planId === process.env.RAZORPAY_PLAN_CREATOR_YEARLY_INR) {
            dbPlan = Plan.LIMITED_PRO;
            dbCycle = BillingCycle.YEARLY;
            creditsToAdd = 9600; // 800 * 12
          } else if (planId === process.env.RAZORPAY_PLAN_STUDIO_MONTHLY_INR) {
            dbPlan = Plan.UNLIMITED_PRO;
            dbCycle = BillingCycle.MONTHLY;
            creditsToAdd = 6000;
          } else if (planId === process.env.RAZORPAY_PLAN_STUDIO_YEARLY_INR) {
            dbPlan = Plan.UNLIMITED_PRO;
            dbCycle = BillingCycle.YEARLY;
            creditsToAdd = 72000; // 6000 * 12
          }
        }
      }

      // 4. Update Database inside a transaction
      await prisma.$transaction(async (tx) => {
        const isTrial = subscription.notes && (subscription.notes as any).is_trial === "true";
        const isDiscounted = subscription.notes && (subscription.notes as any).is_discounted === "true";
        
        const actualCreditsToAdd = isTrial ? 100 : creditsToAdd;
        const subStatus = isTrial ? SubscriptionStatus.TRIALING : SubscriptionStatus.ACTIVE;
        
        let trialEnds: Date | null = null;
        if (isTrial) {
          if ((subscription as any).start_at) {
            trialEnds = new Date(Number((subscription as any).start_at) * 1000);
          } else if (subscription.current_end) {
            trialEnds = new Date(Number(subscription.current_end) * 1000);
          }
        }

        let periodEnd: Date;
        if (isTrial || isDiscounted) {
          if ((subscription as any).start_at) {
            periodEnd = new Date(Number((subscription as any).start_at) * 1000);
          } else {
            // Fallback
            const days = dbCycle === BillingCycle.YEARLY ? 365 : (isTrial ? 7 : 30);
            periodEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
          }
        } else {
          if (subscription.current_end) {
            periodEnd = new Date(Number(subscription.current_end) * 1000);
          } else {
            // Fallback
            const days = dbCycle === BillingCycle.YEARLY ? 365 : 30;
            periodEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
          }
        }

        // Increment user credits
        await tx.user.update({
          where: { id: userId },
          data: { credits: { increment: actualCreditsToAdd } }
        });

        // Set or update subscription
        await tx.subscription.upsert({
          where: { userId },
          update: {
            plan: dbPlan,
            billingCycle: dbCycle,
            status: subStatus,
            gateway: Gateway.RAZORPAY,
            gatewaySubscriptionId: razorpay_subscription_id,
            currentPeriodEnd: periodEnd,
            trialEndsAt: trialEnds,
          },
          create: {
            userId,
            plan: dbPlan,
            billingCycle: dbCycle,
            status: subStatus,
            gateway: Gateway.RAZORPAY,
            gatewaySubscriptionId: razorpay_subscription_id,
            currentPeriodEnd: periodEnd,
            trialEndsAt: trialEnds,
          }
        });

        // Record coupon code usage if present
        if (couponCode) {
          const cleanCode = couponCode.trim().toUpperCase();
          const coupon = await tx.coupon.findUnique({
            where: { code: cleanCode }
          });
          if (coupon && coupon.active) {
            const existingUsage = await tx.couponUsage.findFirst({
              where: { couponId: coupon.id, userId }
            });
            if (!existingUsage) {
              await tx.coupon.update({
                where: { id: coupon.id },
                data: { usedCount: { increment: 1 } }
              });
              await tx.couponUsage.create({
                data: {
                  couponId: coupon.id,
                  userId
                }
              });
            }
          }
        }
      });

      // Welcome Email for Pro Subscription
      try {
        await sendEmail({
          to: session.user.email,
          subject: "🎉 Welcome to Vidzara Pro",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #6366f1; text-align: center; margin-bottom: 20px;">Welcome to Vidzara Pro, ${session.user.name || "Creator"}!</h2>
              <p>Thank you for choosing Vidzara Pro! Your subscription has been successfully activated.</p>
              <p>As a Pro member, you now have access to:</p>
              <ul style="line-height: 1.6;">
                <li>Unlimited or high-limit Video SEO Generations</li>
                <li>Script Writer for Long-form and Shorts</li>
                <li>Script Shortener and Hook Failure Detector</li>
                <li>Thumbnail Concept Generator</li>
                <li>Creator Growth Dashboard and Analytics</li>
              </ul>
              <p>Your subscription is active and your credits have been updated. Log in to your dashboard to start creating!</p>
              <div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
                <a href="${process.env.BETTER_AUTH_URL || 'https://vidzara.com'}/dashboard" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
              </div>
              <p style="margin-top: 30px; font-size: 12px; color: #888888; text-align: center;">If you have any questions, feel free to reply to this email.</p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error("Welcome email send failed:", emailErr);
      }

      // 2. Handle Referral Commission Credit
      try {
        const referral = await prisma.referral.findUnique({
          where: { referredUserId: userId },
          include: { affiliate: true }
        });

        if (referral && referral.status !== "PAID") {
          let amountPaid = 0;
          let currency = "INR";

          try {
            const planDetails = (await razorpay.plans.fetch(subscription.plan_id)) as any;
            if (planDetails) {
              currency = planDetails.currency === "USD" ? "USD" : "INR";
              if (typeof planDetails.amount === "number") {
                amountPaid = planDetails.amount / 100;
              } else if (planDetails.amount) {
                amountPaid = Number(planDetails.amount) / 100;
              }
            }

            if (isNaN(amountPaid) || amountPaid <= 0) {
              throw new Error("Plan amount could not be parsed as a valid number");
            }
          } catch (fetchErr) {
            console.error("Razorpay plan fetch failed, falling back to local pricing:", fetchErr);
            
            // Detect currency from plan ID or default to INR
            const planIdLower = (subscription.plan_id || "").toLowerCase();
            if (planIdLower.includes("usd") || planIdLower.includes("global")) {
              currency = "USD";
            } else {
              currency = "INR";
            }

            if (currency === "USD") {
              if (dbPlan === Plan.LIMITED_PRO) {
                amountPaid = dbCycle === BillingCycle.MONTHLY ? 19 : 190;
              } else if (dbPlan === Plan.UNLIMITED_PRO) {
                amountPaid = dbCycle === BillingCycle.MONTHLY ? 59 : 590;
              }
            } else {
              if (dbPlan === Plan.LIMITED_PRO) {
                amountPaid = dbCycle === BillingCycle.MONTHLY ? 1199 : 11999;
              } else if (dbPlan === Plan.UNLIMITED_PRO) {
                amountPaid = dbCycle === BillingCycle.MONTHLY ? 3499 : 34999;
              }
            }
          }

          if (amountPaid > 0) {
            const commissionRate = Number(referral.affiliate.commissionRate);
            const commissionAmount = amountPaid * commissionRate;

            // Convert commission amount into credits
            // INR: 20 credits per ₹1.00 (5 credits = ₹0.25)
            // USD: 1000 credits per $1.00 (1 credit = $0.001)
            const commissionCredits = currency === "USD" 
              ? Math.round(commissionAmount * 1000) 
              : Math.round(commissionAmount * 20);

            let signupCredits = 0;
            if (referral.status === "PENDING") {
              signupCredits = 5; // signup reward
            }

            // Update referral status to PAID
            await prisma.referral.update({
              where: { id: referral.id },
              data: {
                status: "PAID",
                convertedAt: new Date(),
                commissionAmount: commissionAmount,
              }
            });

            // Update affiliate's balance
            await prisma.affiliate.update({
              where: { id: referral.affiliateId },
              data: {
                affiliateCredits: { increment: signupCredits + commissionCredits },
                totalEarningsDecimal: { increment: commissionAmount },
              }
            });
          }
        }
      } catch (refError) {
        console.error("Referral Commission Processing Error:", refError);
      }

      return NextResponse.json({ success: true, message: "Subscription activated." }, { status: 200 });
    }

  } catch (error: any) {
    console.error("Razorpay Verification Error:", error);
    return NextResponse.json(
      { error: "Verification failed", details: error.message },
      { status: 500 }
    );
  }
}
