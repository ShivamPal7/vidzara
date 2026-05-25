import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Plan, BillingCycle, SubscriptionStatus, Gateway } from "../../../../../prisma/generated/prisma/enums";

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
      razorpay_signature 
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

      if (planId === process.env.RAZORPAY_PLAN_CREATOR_MONTHLY_INR) {
        dbPlan = Plan.LIMITED_PRO;
        dbCycle = BillingCycle.MONTHLY;
        creditsToAdd = 1200;
      } else if (planId === process.env.RAZORPAY_PLAN_CREATOR_YEARLY_INR) {
        dbPlan = Plan.LIMITED_PRO;
        dbCycle = BillingCycle.YEARLY;
        creditsToAdd = 14400; // 1200 * 12
      } else if (planId === process.env.RAZORPAY_PLAN_STUDIO_MONTHLY_INR) {
        dbPlan = Plan.UNLIMITED_PRO;
        dbCycle = BillingCycle.MONTHLY;
        creditsToAdd = 6000;
      } else if (planId === process.env.RAZORPAY_PLAN_STUDIO_YEARLY_INR) {
        dbPlan = Plan.UNLIMITED_PRO;
        dbCycle = BillingCycle.YEARLY;
        creditsToAdd = 72000; // 6000 * 12
      }

      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { credits: { increment: creditsToAdd } }
        }),
        prisma.subscription.upsert({
          where: { userId },
          update: {
            plan: dbPlan,
            billingCycle: dbCycle,
            status: SubscriptionStatus.ACTIVE,
            gateway: Gateway.RAZORPAY,
            gatewaySubscriptionId: razorpay_subscription_id,
            currentPeriodEnd: new Date(Number(subscription.current_end) * 1000),
          },
          create: {
            userId,
            plan: dbPlan,
            billingCycle: dbCycle,
            status: SubscriptionStatus.ACTIVE,
            gateway: Gateway.RAZORPAY,
            gatewaySubscriptionId: razorpay_subscription_id,
            currentPeriodEnd: new Date(Number(subscription.current_end) * 1000),
          }
        })
      ]);

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
