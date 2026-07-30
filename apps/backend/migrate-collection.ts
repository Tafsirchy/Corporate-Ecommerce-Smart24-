import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateCollection() {
  try {
    console.log('Connected via Prisma...');

    // First check if it exists (by doing a quick count or just attempting)
    // Actually, we can just run the aggregate command
    console.log('Copying data from CorporateCollection to BusinessCollection...');
    
    const result = await prisma.$runCommandRaw({
      aggregate: 'CorporateCollection',
      pipeline: [
        { $match: {} },
        { $out: 'BusinessCollection' }
      ],
      cursor: {}
    });
    
    console.log('Aggregation result:', result);
    console.log('Data copied successfully.');

    // Drop the old collection
    console.log('Dropping old CorporateCollection...');
    await prisma.$runCommandRaw({
      drop: 'CorporateCollection'
    });

    console.log('Migration complete! CorporateCollection renamed to BusinessCollection.');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateCollection();
