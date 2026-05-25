import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { planType } = await req.json();

    if (!planType) {
      return NextResponse.json({ error: "Missing planType" }, { status: 400 });
    }

    let planId = "";

    switch (planType) {
      case "creator_monthly_inr":
        planId = process.env.RAZORPAY_PLAN_CREATOR_MONTHLY_INR || "";
        break;
      case "creator_yearly_inr":
        planId = process.env.RAZORPAY_PLAN_CREATOR_YEARLY_INR || "";
        break;
      case "studio_monthly_inr":
        planId = process.env.RAZORPAY_PLAN_STUDIO_MONTHLY_INR || "";
        break;
      case "studio_yearly_inr":
        planId = process.env.RAZORPAY_PLAN_STUDIO_YEARLY_INR || "";
        break;
      default:
        return NextResponse.json({ error: "Invalid planType" }, { status: 400 });
    }

    if (!planId) {
      return NextResponse.json({ error: `Plan ID for ${planType} not found in environment.` }, { status: 500 });
    }

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
