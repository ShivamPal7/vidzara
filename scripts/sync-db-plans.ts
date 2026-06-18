import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });


let prisma: any;

async function main() {
  console.log("Syncing database PlanConfig with .env file...");
  const lib = await import("../src/lib/prisma");
  prisma = lib.prisma;
  const Plan = lib.Plan;

  const creatorMonthly = process.env.RAZORPAY_PLAN_CREATOR_MONTHLY_INR || null;
  const creatorYearly = process.env.RAZORPAY_PLAN_CREATOR_YEARLY_INR || null;
  const studioMonthly = process.env.RAZORPAY_PLAN_STUDIO_MONTHLY_INR || null;
  const studioYearly = process.env.RAZORPAY_PLAN_STUDIO_YEARLY_INR || null;

  console.log("Creator Monthly in env:", creatorMonthly);
  console.log("Creator Yearly in env:", creatorYearly);
  console.log("Studio Monthly in env:", studioMonthly);
  console.log("Studio Yearly in env:", studioYearly);

  // Update LIMITED_PRO plan configuration
  const configLimited = await prisma.planConfig.upsert({
    where: { plan: Plan.LIMITED_PRO },
    update: {
      razorpayPlanMonthlyINR: creatorMonthly,
      razorpayPlanYearlyINR: creatorYearly,
    },
    create: {
      plan: Plan.LIMITED_PRO,
      monthlyPriceINR: 999,
      yearlyPriceINR: 7999,
      monthlyPriceUSD: 19,
      yearlyPriceUSD: 190,
      monthlyCredits: 1200,
      yearlyCredits: 14400,
      razorpayPlanMonthlyINR: creatorMonthly,
      razorpayPlanYearlyINR: creatorYearly,
    },
  });
  console.log("Updated LIMITED_PRO:", configLimited);

  // Update UNLIMITED_PRO plan configuration
  const configUnlimited = await prisma.planConfig.upsert({
    where: { plan: Plan.UNLIMITED_PRO },
    update: {
      razorpayPlanMonthlyINR: studioMonthly,
      razorpayPlanYearlyINR: studioYearly,
    },
    create: {
      plan: Plan.UNLIMITED_PRO,
      monthlyPriceINR: 3499,
      yearlyPriceINR: 27999,
      monthlyPriceUSD: 59,
      yearlyPriceUSD: 590,
      monthlyCredits: 6000,
      yearlyCredits: 72000,
      razorpayPlanMonthlyINR: studioMonthly,
      razorpayPlanYearlyINR: studioYearly,
    },
  });
  console.log("Updated UNLIMITED_PRO:", configUnlimited);

  console.log("✅ Successfully synced database PlanConfig with .env!");
}

main()
  .catch((e) => {
    console.error("❌ Error syncing database plan config:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
