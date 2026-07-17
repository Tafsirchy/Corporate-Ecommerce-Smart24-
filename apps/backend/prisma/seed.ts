import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting corporate data seeding...');

  // 1. Clear existing generic data (Careful not to delete Users/Orders)
  await prisma.product.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.category.deleteMany({});

  console.log('Cleared existing products, brands, and categories.');

  // 2. Create Corporate Brands
  const smart24Essentials = await prisma.brand.create({
    data: {
      name: 'Smart24 Essentials',
      slug: slugify('Smart24 Essentials', { lower: true, strict: true }),
      description: 'High-quality everyday corporate essentials curated by Smart24.'
    }
  });

  const freshFarms = await prisma.brand.create({
    data: {
      name: 'FreshFarms',
      slug: slugify('FreshFarms', { lower: true, strict: true }),
      description: 'Fresh organic produce sourced directly from farmers.'
    }
  });

  const techPro = await prisma.brand.create({
    data: {
      name: 'TechPro',
      slug: slugify('TechPro', { lower: true, strict: true }),
      description: 'Reliable IT and electronic supplies for modern offices.'
    }
  });

  console.log('Brands created.');

  // 3. Create Corporate Categories
  const officeSupplies = await prisma.category.create({
    data: {
      name: 'Office Supplies',
      slug: slugify('Office Supplies', { lower: true, strict: true }),
      level: 1
    }
  });

  const pantryGroceries = await prisma.category.create({
    data: {
      name: 'Pantry & Groceries',
      slug: slugify('Pantry & Groceries', { lower: true, strict: true }),
      level: 1
    }
  });

  const corporateBundles = await prisma.category.create({
    data: {
      name: 'Corporate Bundles',
      slug: slugify('Corporate Bundles', { lower: true, strict: true }),
      level: 1
    }
  });

  const cleaningSupplies = await prisma.category.create({
    data: {
      name: 'Cleaning Supplies',
      slug: slugify('Cleaning Supplies', { lower: true, strict: true }),
      level: 1
    }
  });

  const construction = await prisma.category.create({
    data: {
      name: 'Construction & Hardware',
      slug: slugify('Construction & Hardware', { lower: true, strict: true }),
      level: 1
    }
  });

  console.log('Categories created.');

  // 4. Create Corporate Products
  await prisma.product.createMany({
    data: [
      {
        name: 'Weekly Veg Box',
        slug: slugify('Weekly Veg Box', { lower: true, strict: true }),
        description: 'A curated weekly box of fresh seasonal vegetables. Ideal for corporate cafeterias.',
        price: 650,
        stock: 100,
        categoryId: corporateBundles.id,
        brandId: freshFarms.id,
        images: ['https://placehold.co/600x600/16A34A/FFFFFF?text=Weekly+Veg+Box']
      },
      {
        name: 'Cement Bag (50kg)',
        slug: slugify('Cement Bag (50kg)', { lower: true, strict: true }),
        description: 'Premium quality Portland cement for corporate construction projects. 50kg bag.',
        price: 480,
        stock: 5, // Low stock to trigger warnings if built
        categoryId: construction.id,
        brandId: null,
        images: ['https://placehold.co/600x600/6B7280/FFFFFF?text=Cement+Bag+50kg']
      },
      {
        name: 'A4 Printer Paper (500 Sheets)',
        slug: slugify('A4 Printer Paper 500 Sheets', { lower: true, strict: true }),
        description: 'High quality A4 printer paper for all your office documentation needs. 80 GSM, 500 sheets per ream.',
        price: 450,
        stock: 500,
        categoryId: officeSupplies.id,
        brandId: smart24Essentials.id,
        images: ['https://placehold.co/600x600/DBEAFE/1E40AF?text=A4+Printer+Paper']
      },
      {
        name: 'Premium Tea Bags (100 Pcs)',
        slug: slugify('Premium Tea Bags 100 Pcs', { lower: true, strict: true }),
        description: 'Finest quality black tea bags for the corporate pantry. Box of 100.',
        price: 250,
        stock: 200,
        categoryId: pantryGroceries.id,
        brandId: smart24Essentials.id,
        images: ['https://placehold.co/600x600/FEF3C7/92400E?text=Premium+Tea+Bags']
      },
      {
        name: 'Miniket Rice (25kg Bag)',
        slug: slugify('Miniket Rice 25kg Bag', { lower: true, strict: true }),
        description: 'Premium sorted Miniket rice for corporate dining facilities. 25kg sack.',
        price: 1800,
        stock: 50,
        categoryId: pantryGroceries.id,
        brandId: freshFarms.id,
        images: ['https://placehold.co/600x600/F0FDF4/166534?text=Miniket+Rice+25kg']
      },
      {
        name: 'Office Ergonomic Chair',
        slug: slugify('Office Ergonomic Chair', { lower: true, strict: true }),
        description: 'Comfortable mesh ergonomic chair with lumbar support for long working hours.',
        price: 8500,
        stock: 15,
        categoryId: officeSupplies.id,
        brandId: techPro.id,
        images: ['https://placehold.co/600x600/F3F4F6/111827?text=Ergonomic+Chair']
      }
    ]
  });

  console.log('Products created.');
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
