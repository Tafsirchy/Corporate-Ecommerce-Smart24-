import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting data migration: CORPORATE -> BUSINESS');

  try {
    const result = await prisma.$runCommandRaw({
      update: 'User',
      updates: [
        {
          q: { role: 'CORPORATE' },
          u: { $set: { role: 'BUSINESS' } },
          multi: true,
        },
      ],
    });

    console.log('Migration command executed.');
    console.dir(result, { depth: null });
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
