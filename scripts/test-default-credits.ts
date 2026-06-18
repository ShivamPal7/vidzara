import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

let prisma: any;

async function main() {
  const lib = await import("../src/lib/prisma");
  prisma = lib.prisma;

  const email = `test-user-${Date.now()}@example.com`;
  console.log(`Creating test user with email: ${email}`);

  const user = await prisma.user.create({
    data: {
      name: "Test User Default Credits",
      email: email,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log("Created user successfully!");
  console.log("User credits:", user.credits);

  // Clean up
  await prisma.user.delete({
    where: { id: user.id },
  });
  console.log("Cleaned up test user.");
}

main()
  .catch((e) => {
    console.error("Error running test:", e);
  })
  .finally(async () => {
    if (prisma) await prisma.$disconnect();
  });
