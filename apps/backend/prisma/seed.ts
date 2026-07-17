import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding categories, brands, and products...');

  // Create Categories
  const categoriesData = [
    { name: 'Electronics' },
    { name: 'Clothing' },
    { name: 'Home & Kitchen' },
    { name: 'Books' },
    { name: 'Sports' }
  ];

  const categories: any[] = [];
  for (const cat of categoriesData) {
    const slug = slugify(cat.name, { lower: true, strict: true });
    const created = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name: cat.name, slug, level: 1 }
    });
    categories.push(created);
  }

  // Add a subcategory
  const smartPhonesSlug = slugify('Smartphones', { lower: true, strict: true });
  const smartphones = await prisma.category.upsert({
    where: { slug: smartPhonesSlug },
    update: {},
    create: {
      name: 'Smartphones',
      slug: smartPhonesSlug,
      level: 2,
      parentId: categories[0].id
    }
  });

  // Create Brands
  const brandSlug = slugify('TechCorp', { lower: true, strict: true });
  const brand = await prisma.brand.upsert({
    where: { slug: brandSlug },
    update: {},
    create: {
      name: 'TechCorp',
      slug: brandSlug,
      description: 'Leading technology brand'
    }
  });

  // Create Products
  const productsData = [
    { name: 'Smartphone X', price: 999, categoryId: smartphones.id, brandId: brand.id },
    { name: 'Laptop Pro', price: 1499, categoryId: categories[0].id, brandId: brand.id },
    { name: 'Cotton T-Shirt', price: 19, categoryId: categories[1].id, brandId: null },
    { name: 'Coffee Maker', price: 89, categoryId: categories[2].id, brandId: null },
    { name: 'Running Shoes', price: 120, categoryId: categories[4].id, brandId: null }
  ];

  for (const prod of productsData) {
    const slug = slugify(prod.name, { lower: true, strict: true });
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        name: prod.name,
        slug,
        description: `This is an amazing ${prod.name}`,
        price: prod.price,
        stock: 50,
        images: ['https://placehold.co/600x400?text=' + slugify(prod.name)],
        categoryId: prod.categoryId,
        brandId: prod.brandId
      }
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
