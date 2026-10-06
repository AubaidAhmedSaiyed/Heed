require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
  console.log('Tables in database:', tables.map(r => r.table_name));
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
