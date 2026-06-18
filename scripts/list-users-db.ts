import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

let prisma: any;

async function main() {
  const lib = await import("../src/lib/prisma");
  prisma = lib.prisma;

  console.log("Fetching users from database...");
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      email: true,
      credits: true,
      createdAt: true,
    },
  });

  console.log("Top 5 recent users in DB:");
  users.forEach((u: any) => {
    console.log(`- Email: ${u.email} | Credits: ${u.credits} | CreatedAt: ${u.createdAt}`);
  });
}

main()
  .catch((e) => {
    console.error("Error:", e);
  })
  .finally(async () => {
    if (prisma) await prisma.$disconnect();
  });
