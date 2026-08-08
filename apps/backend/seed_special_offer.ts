import { PrismaClient, BannerType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding special offer banner...');
  
  const existingSpecialOffer = await prisma.banner.findFirst({
    where: { type: 'SPECIAL_OFFER' }
  });

  if (!existingSpecialOffer) {
    await prisma.banner.create({
      data: {
        title: 'Huge End of Season Sale',
        imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop',
        targetUrl: '/shop',
        type: 'SPECIAL_OFFER',
        isActive: true,
        order: 1
      }
    });
    console.log('Special offer banner seeded successfully.');
  } else {
    // If it exists, make sure it's active
    await prisma.banner.update({
      where: { id: existingSpecialOffer.id },
      data: { isActive: true }
    });
    console.log('Special offer banner already existed, made sure it is active.');
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
