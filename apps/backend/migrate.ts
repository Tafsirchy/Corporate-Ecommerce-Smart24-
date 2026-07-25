import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  console.log('Starting migration of hardcoded product attributes to generic attributes array...');
  
  const products = await prisma.product.findMany({});
  let count = 0;
  
  for (const product of products) {
    const attributes = [...(product.attributes || [])];
    let changed = false;

    const addAttr = (key: string, value: string) => {
      if (!attributes.find(a => a.filterKey === key)) {
        attributes.push({ filterKey: key, value, source: 'manual', confidence: 1.0 });
        changed = true;
      }
    };

    if (product.color) addAttr('color', product.color);
    if (product.warrantyType) addAttr('warrantyType', product.warrantyType);
    if (product.brandCompatibility) addAttr('brandCompatibility', product.brandCompatibility);
    if (product.caseMaterial) addAttr('caseMaterial', product.caseMaterial);
    if (product.compatibilityByModel) addAttr('compatibilityByModel', product.compatibilityByModel);
    
    // Services is an array
    if (product.services && product.services.length > 0) {
      for (const service of product.services) {
        if (!attributes.find(a => a.filterKey === 'services' && a.value === service)) {
           attributes.push({ filterKey: 'services', value: service, source: 'manual', confidence: 1.0 });
           changed = true;
        }
      }
    }

    if (changed) {
      await prisma.product.update({
        where: { id: product.id },
        data: { attributes }
      });
      count++;
    }
  }

  console.log(`Migration completed. Updated ${count} products.`);
  await prisma.$disconnect();
}

migrate().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
