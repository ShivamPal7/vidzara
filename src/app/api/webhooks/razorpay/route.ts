import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma, Plan, BillingCycle, SubscriptionStatus } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "vidzara_webhook_secret_default";

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("[Razorpay Webhook] Signature verification failed.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    console.log(`[Razorpay Webhook] Received event: ${event.event}`);

    // Handle webhook events
    // Reference: https://razorpay.com/docs/api/subscriptions/#subscription-events
    if (event.event === "subscription.charged") {
      const subscriptionPayload = event.payload.subscription.entity;
      const gatewaySubscriptionId = subscriptionPayload.id;

      // Find the subscription in our database
      const existingSub = await prisma.subscription.findFirst({
        where: { gatewaySubscriptionId },
        include: { user: true },
      });

      if (!existingSub) {
        console.warn(`[Razorpay Webhook] Subscription not found in database: ${gatewaySubscriptionId}`);
        return NextResponse.json({ success: true, message: "Subscription not found, ignored." }, { status: 200 });
      }

      // Check if this was a trial subscription upgrading to active
      const isTrialUpgrade = existingSub.status === SubscriptionStatus.TRIALING;

      // Calculate credits to add on a charged event
      let creditsToAdd = 0;
      if (isTrialUpgrade) {
        // Upgrading to full Creator Pro Monthly
        const baseConfig = await prisma.planConfig.findFirst({
          where: { plan: existingSub.plan },
        });
        creditsToAdd = baseConfig ? baseConfig.monthlyCredits : 800;
      } else {
        // Standard renewal charge
        const baseConfig = await prisma.planConfig.findFirst({
          where: { plan: existingSub.plan },
        });
        creditsToAdd = existingSub.billingCycle === BillingCycle.YEARLY
          ? (baseConfig ? baseConfig.yearlyCredits : 9600)
          : (baseConfig ? baseConfig.monthlyCredits : 800);
      }

      // Update user credits and transition status to ACTIVE
      await prisma.$transaction([
        prisma.user.update({
          where: { id: existingSub.userId },
          data: { credits: { increment: creditsToAdd } },
        }),
        prisma.subscription.update({
          where: { id: existingSub.id },
          data: {
            status: SubscriptionStatus.ACTIVE,
            trialEndsAt: null, // Clear trial end date since they paid
            currentPeriodEnd: new Date(Number(subscriptionPayload.current_end) * 1000),
          },
        }),
      ]);

      console.log(`[Razorpay Webhook] Successfully charged subscription ${gatewaySubscriptionId} and granted ${creditsToAdd} credits.`);

    } else if (event.event === "subscription.cancelled" || event.event === "subscription.halted") {
      const subscriptionPayload = event.payload.subscription.entity;
      const gatewaySubscriptionId = subscriptionPayload.id;

      const existingSub = await prisma.subscription.findFirst({
        where: { gatewaySubscriptionId },
      });

      if (existingSub) {
        await prisma.subscription.update({
          where: { id: existingSub.id },
          data: {
            status: SubscriptionStatus.CANCELED,
          },
        });
        console.log(`[Razorpay Webhook] Cancelled subscription ${gatewaySubscriptionId}.`);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("[Razorpay Webhook] Error processing webhook:", error);
    return NextResponse.json({ error: "Webhook handling failed", details: error.message }, { status: 500 });
  }
}
