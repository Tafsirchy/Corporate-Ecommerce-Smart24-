import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Credit Limits...');
  const profiles = await prisma.businessProfile.findMany();
  
  for (const profile of profiles) {
    if (profile.creditLimit === 0) {
      const limit = Math.floor(Math.random() * 50) * 1000 + 10000; // Between 10k and 60k
      await prisma.businessProfile.update({
        where: { id: profile.id },
        data: { creditLimit: limit, usedCredit: 0 }
      });
      console.log(`Updated profile ${profile.id} with limit ${limit}`);
    }
  }
  console.log('Done!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
