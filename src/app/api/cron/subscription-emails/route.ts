import { NextRequest, NextResponse } from "next/server";
import { prisma, SubscriptionStatus } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // 1. Check for subscriptions ending in exactly 2 days with status CANCELED
    const twoDaysStart = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    twoDaysStart.setHours(0, 0, 0, 0);
    const twoDaysEnd = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    twoDaysEnd.setHours(23, 59, 59, 999);

    const expiringSoon = await prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.CANCELED,
        currentPeriodEnd: {
          gte: twoDaysStart,
          lte: twoDaysEnd,
        },
      },
      include: {
        user: true,
      },
    });

    let reminderCount = 0;
    for (const sub of expiringSoon) {
      try {
        await sendEmail({
          to: sub.user.email,
          subject: "⚠️ Your Vidzara Pro subscription is ending in 2 days",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #6366f1; text-align: center; margin-bottom: 20px;">Subscription Expiry Reminder</h2>
              <p>Hello, ${sub.user.name || "Creator"}!</p>
              <p>This is a reminder that your <strong>Vidzara Pro</strong> subscription is set to expire in 2 days on <strong>${new Date(sub.currentPeriodEnd!).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</strong>.</p>
              <p>Since auto-renewal is currently turned off (canceled status), you will lose access to your Pro features and credit limits once this period ends.</p>
              <p>To avoid any disruption and keep generating high-performing video scripts, SEO titles, and outlines, you can renew your subscription at any time.</p>
              <div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
                <a href="${process.env.BETTER_AUTH_URL || "https://vidzara.com"}/dashboard/billing" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Renew Subscription</a>
              </div>
              <p style="margin-top: 30px; font-size: 12px; color: #888888; text-align: center;">If you have any questions or need help, feel free to reply to this email.</p>
            </div>
          `
        });
        reminderCount++;
      } catch (emailErr) {
        console.error(`Failed to send expiry reminder to ${sub.user.email}:`, emailErr);
      }
    }

    // 2. Check for expired subscriptions (currentPeriodEnd < now and status not EXPIRED)
    const expired = await prisma.subscription.findMany({
      where: {
        currentPeriodEnd: {
          lt: now,
        },
        status: {
          not: SubscriptionStatus.EXPIRED,
        },
      },
      include: {
        user: true,
      },
    });

    let expiredCount = 0;
    for (const sub of expired) {
      // Update status to EXPIRED in database
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: SubscriptionStatus.EXPIRED },
      });

      // Send notice email
      try {
        await sendEmail({
          to: sub.user.email,
          subject: "❌ Your Vidzara Pro subscription has expired",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #ef4444; text-align: center; margin-bottom: 20px;">Subscription Expired</h2>
              <p>Hello, ${sub.user.name || "Creator"}!</p>
              <p>Your <strong>Vidzara Pro</strong> subscription expired on <strong>${new Date(sub.currentPeriodEnd!).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</strong>.</p>
              <p>Your account has been downgraded to the free plan. As a result, your creator credit allowance has been restricted and some advanced AI features (like long-form script generation, safety checking, etc.) are no longer active.</p>
              <p>To restore your Pro access and continue accelerating your channel growth, you can resubscribe at any time.</p>
              <div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
                <a href="${process.env.BETTER_AUTH_URL || "https://vidzara.com"}/dashboard/billing" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Resubscribe Now</a>
              </div>
              <p style="margin-top: 30px; font-size: 12px; color: #888888; text-align: center;">If you have any questions, feel free to reply to this email.</p>
            </div>
          `
        });
        expiredCount++;
      } catch (emailErr) {
        console.error(`Failed to send expiration notice to ${sub.user.email}:`, emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      remindersSent: reminderCount,
      expiredUpdated: expiredCount,
    });
  } catch (error: any) {
    console.error("Subscription Emails Cron Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
