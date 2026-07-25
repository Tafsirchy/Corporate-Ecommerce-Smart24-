import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed script for Dynamic Filters and Products...');

  // 1. Get or Create Category
  let electronics = await prisma.category.findFirst({ where: { slug: 'electronics' } });
  if (!electronics) {
    electronics = await prisma.category.create({ data: { name: 'Electronics', slug: 'electronics', level: 1 } });
  }

  let smartphones = await prisma.category.findFirst({ where: { slug: 'smartphones' } });
  if (!smartphones) {
    smartphones = await prisma.category.create({ 
      data: { name: 'Smartphones', slug: 'smartphones', level: 2, parentId: electronics.id } 
    });
  }

  // 2. Get or Create Brands
  let apple = await prisma.brand.findFirst({ where: { slug: 'apple' } });
  if (!apple) {
    apple = await prisma.brand.create({ data: { name: 'Apple', slug: 'apple' } });
  }

  let samsung = await prisma.brand.findFirst({ where: { slug: 'samsung' } });
  if (!samsung) {
    samsung = await prisma.brand.create({ data: { name: 'Samsung', slug: 'samsung' } });
  }

  // 3. Create Filter Definitions for Smartphones
  console.log('Creating Filter Definitions...');
  
  await prisma.filterDefinition.deleteMany({}); // clear existing for a fresh start

  const ramFilter = await prisma.filterDefinition.create({
    data: {
      key: 'ram',
      label: 'RAM',
      type: 'CHECKBOX',
      categoryIds: [smartphones.id],
      status: 'ACTIVE',
      displayOrder: 1,
      values: [
        { value: '4GB', label: '4GB' },
        { value: '8GB', label: '8GB' },
        { value: '12GB', label: '12GB' },
        { value: '16GB', label: '16GB' },
      ],
      createdBy: 'admin'
    }
  });

  const storageFilter = await prisma.filterDefinition.create({
    data: {
      key: 'storage',
      label: 'Storage Capacity',
      type: 'CHECKBOX',
      categoryIds: [smartphones.id],
      status: 'ACTIVE',
      displayOrder: 2,
      values: [
        { value: '64GB', label: '64GB' },
        { value: '128GB', label: '128GB' },
        { value: '256GB', label: '256GB' },
        { value: '512GB', label: '512GB' },
        { value: '1TB', label: '1TB' },
      ],
      createdBy: 'admin'
    }
  });

  const colorFilter = await prisma.filterDefinition.create({
    data: {
      key: 'color',
      label: 'Color',
      type: 'SWATCH',
      categoryIds: [electronics.id, smartphones.id],
      status: 'ACTIVE',
      displayOrder: 3,
      values: [
        { value: 'Midnight Black', label: 'Midnight Black', colorHex: '#1a1a1a' },
        { value: 'Glacier White', label: 'Glacier White', colorHex: '#f2f2f2' },
        { value: 'Titanium Blue', label: 'Titanium Blue', colorHex: '#4a5b6d' },
        { value: 'Red', label: 'Product RED', colorHex: '#ff0000' }
      ],
      createdBy: 'admin'
    }
  });

  // 4. Create Seed Products
  console.log('Creating Products with standard and dynamic filters...');
  
  await prisma.product.deleteMany({ where: { categoryId: smartphones.id } }); // Clear previous smartphones

  const productsToSeed = [
    {
      name: 'iPhone 15 Pro',
      slug: 'iphone-15-pro',
      description: 'Titanium design with A17 Pro chip. 128GB storage in Titanium Blue.',
      price: 999,
      discountPrice: null,
      rating: 4.9,
      reviewCount: 320,
      isFlashSale: false,
      categoryId: smartphones.id,
      brandId: apple.id,
      images: ['https://placehold.co/600x600/4a5b6d/white?text=iPhone+15+Pro+Blue'],
      attributes: [
        { filterKey: 'ram', value: '8GB', source: 'manual' },
        { filterKey: 'storage', value: '128GB', source: 'manual' },
        { filterKey: 'color', value: 'Titanium Blue', source: 'manual' }
      ]
    },
    {
      name: 'iPhone 15 Pro Max',
      slug: 'iphone-15-pro-max',
      description: 'The ultimate iPhone with 5x optical zoom. 256GB storage, Glacier White.',
      price: 1199,
      discountPrice: null,
      rating: 4.8,
      reviewCount: 410,
      isFlashSale: true,
      categoryId: smartphones.id,
      brandId: apple.id,
      images: ['https://placehold.co/600x600/f2f2f2/black?text=iPhone+15+Pro+Max+White'],
      attributes: [
        { filterKey: 'ram', value: '8GB', source: 'manual' },
        { filterKey: 'storage', value: '256GB', source: 'manual' },
        { filterKey: 'color', value: 'Glacier White', source: 'manual' }
      ]
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      slug: 'samsung-galaxy-s24-ultra',
      description: 'Galaxy AI is here. Epic camera, 512GB storage, 12GB RAM, Midnight Black.',
      price: 1299,
      discountPrice: 1250,
      rating: 4.7,
      reviewCount: 280,
      isFlashSale: false,
      categoryId: smartphones.id,
      brandId: samsung.id,
      images: ['https://placehold.co/600x600/1a1a1a/white?text=Galaxy+S24+Ultra+Black'],
      attributes: [
        { filterKey: 'ram', value: '12GB', source: 'manual' },
        { filterKey: 'storage', value: '512GB', source: 'manual' },
        { filterKey: 'color', value: 'Midnight Black', source: 'manual' }
      ]
    },
    {
      name: 'Samsung Galaxy A54',
      slug: 'samsung-galaxy-a54',
      description: 'Awesome screen, awesome camera. 128GB storage, 8GB RAM.',
      price: 449,
      discountPrice: null,
      rating: 4.5,
      reviewCount: 150,
      isFlashSale: true,
      categoryId: smartphones.id,
      brandId: samsung.id,
      images: ['https://placehold.co/600x600/1a1a1a/white?text=Galaxy+A54+Black'],
      attributes: [
        { filterKey: 'ram', value: '8GB', source: 'manual' },
        { filterKey: 'storage', value: '128GB', source: 'manual' },
        { filterKey: 'color', value: 'Midnight Black', source: 'manual' }
      ]
    },
    {
      name: 'iPhone 13',
      slug: 'iphone-13',
      description: 'Your new superpower. 128GB storage, Product RED.',
      price: 599,
      discountPrice: 550,
      rating: 4.6,
      reviewCount: 890,
      isFlashSale: false,
      categoryId: smartphones.id,
      brandId: apple.id,
      images: ['https://placehold.co/600x600/ff0000/white?text=iPhone+13+Red'],
      attributes: [
        { filterKey: 'ram', value: '4GB', source: 'manual' },
        { filterKey: 'storage', value: '128GB', source: 'manual' },
        { filterKey: 'color', value: 'Red', source: 'manual' }
      ]
    }
  ];

  let count = 0;
  for (const prodData of productsToSeed) {
    await prisma.product.create({
      data: prodData
    });
    count++;
  }

  console.log(`Seeded ${count} smartphones with dynamic filters!`);

  // Let's create a huge amount of dummy data to test pagination and faceted counts performance
  // 50 more phones!
  console.log('Seeding 50 additional dummy phones...');
  
  const dummyProducts: any[] = [];
  const storages = ['64GB', '128GB', '256GB', '512GB', '1TB'];
  const rams = ['4GB', '8GB', '12GB', '16GB'];
  const colors = ['Midnight Black', 'Glacier White', 'Titanium Blue', 'Red'];
  const brandsArr = [apple.id, samsung.id];

  for (let i = 1; i <= 50; i++) {
    const s = storages[Math.floor(Math.random() * storages.length)];
    const r = rams[Math.floor(Math.random() * rams.length)];
    const c = colors[Math.floor(Math.random() * colors.length)];
    const b = brandsArr[Math.floor(Math.random() * brandsArr.length)];
    
    dummyProducts.push({
      name: `Dummy Smartphone Model X-${i}`,
      slug: `dummy-smartphone-${i}`,
      description: `A generic smartphone with ${s} storage and ${r} RAM. Looks great in ${c}.`,
      price: Math.floor(Math.random() * 800) + 200,
      discountPrice: null,
      rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3.0 to 5.0
      reviewCount: Math.floor(Math.random() * 100),
      isFlashSale: Math.random() > 0.8, // 20% flash sale
      categoryId: smartphones.id,
      brandId: b,
      images: ['https://placehold.co/600x600/eeeeee/black?text=Dummy+Phone'],
      attributes: [
        { filterKey: 'ram', value: r, source: 'manual' },
        { filterKey: 'storage', value: s, source: 'manual' },
        { filterKey: 'color', value: c, source: 'manual' }
      ]
    });
  }

  // Insert dummy products using standard create since createMany with composite arrays has some nuances
  for (const prodData of dummyProducts) {
    try {
      await prisma.product.create({
        data: prodData
      });
      process.stdout.write('.');
    } catch (e: any) {
      console.error(`\nFailed to insert ${prodData.name}:`, e.message);
    }
  }
  console.log('\nFinished seeding dummy phones!');
  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
