import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma, Plan, SubscriptionStatus } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

    const { amount, currency } = await req.json();

    if (!amount || amount < 100) {
      return NextResponse.json({ error: "Invalid amount. Minimum 100 paise." }, { status: 400 });
    }

    // Enforce Pro / Unlimited active subscription check
    const userSub = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    const isEligible = userSub && 
      (userSub.plan === Plan.LIMITED_PRO || userSub.plan === Plan.UNLIMITED_PRO) && 
      userSub.status === SubscriptionStatus.ACTIVE;

    if (!isEligible) {
      return NextResponse.json(
        { error: "Credit top-ups are only available to active Pro and Unlimited subscription plan users." },
        { status: 400 }
      );
    }

    const options = {
      amount, // amount in smallest currency unit
      currency: currency || "INR",
      receipt: `receipt_order_${Math.floor(Math.random() * 10000)}`,
    };

    const order = await razorpay.orders.create(options);
    
    return NextResponse.json(order, { status: 200 });
  } catch (error: any) {
    console.error("Razorpay Order Creation Error:", error);
    return NextResponse.json(
      { error: "Failed to create Razorpay order", details: error.message },
      { status: 500 }
    );
  }
}
