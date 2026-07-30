import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  for (const product of products) {
    if (!product.sku) {
      await prisma.product.update({
        where: { id: product.id },
        data: { sku: product.slug.toUpperCase() }
      });
      console.log(`Updated product ${product.slug} with sku ${product.slug.toUpperCase()}`);
    }
  }
  console.log('Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
