import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Checking Prisma Client...");
  
  if (!prisma) {
    console.error("❌ Prisma instance is undefined");
    process.exit(1);
  }

  // Check if userProfile model delegate exists
  // @ts-ignore - Dynamic check
  if (prisma.userProfile) {
    console.log("✅ prisma.userProfile is defined");
    // Try a simple operation (count or findFirst)
    try {
        // We just want to see if the function exists and is callable, 
        // actual DB connection might fail if env is not set correctly in this context, 
        // but 'findUnique' property access is what failed for the user.
        console.log("Type of userProfile.findUnique:", typeof prisma.userProfile.findUnique);
    } catch (e) {
        console.error("Error accessing userProfile:", e);
    }
  } else {
    console.error("❌ prisma.userProfile is UNDEFINED");
    console.log("Available keys on prisma:", Object.keys(prisma));
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
