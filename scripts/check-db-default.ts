import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

let prisma: any;

async function main() {
  const lib = await import("../src/lib/prisma");
  prisma = lib.prisma;

  console.log("Checking credits column database default value...");
  const result = await prisma.$queryRawUnsafe(`
    SELECT column_name, column_default, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'user' AND column_name = 'credits';
  `);

  console.log("Database column metadata:", result);
}

main()
  .catch((e) => {
    console.error("Error:", e);
  })
  .finally(async () => {
    if (prisma) await prisma.$disconnect();
  });
