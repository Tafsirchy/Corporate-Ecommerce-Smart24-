import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting corporate data seeding with deep categories...');

  // 1. Clear existing generic data
  await prisma.supportTicket.deleteMany({});
  await prisma.faq.deleteMany({});
  await prisma.setting.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.orderItem.deleteMany({}).catch(() => {});
  await prisma.review.deleteMany({}).catch(() => {});
  await prisma.product.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.banner.deleteMany({});
  await prisma.category.deleteMany({ where: { level: 3 } }).catch(() => {});
  await prisma.category.deleteMany({ where: { level: 2 } }).catch(() => {});
  await prisma.category.deleteMany({ where: { level: 1 } }).catch(() => {});
  await prisma.category.deleteMany({}); // Catch any remaining

  console.log('Cleared existing products, brands, and categories.');

  // 2. Brands
  const apple = await prisma.brand.create({ data: { name: 'Apple', slug: 'apple', description: 'Tech giant' } });
  const samsung = await prisma.brand.create({ data: { name: 'Samsung', slug: 'samsung', description: 'Electronics leader' } });
  const nike = await prisma.brand.create({ data: { name: 'Nike', slug: 'nike', description: 'Sports apparel' } });
  const zara = await prisma.brand.create({ data: { name: 'Zara', slug: 'zara', description: 'Fashion forward' } });
  const ikea = await prisma.brand.create({ data: { name: 'IKEA', slug: 'ikea', description: 'Home furniture' } });

  console.log('Brands created.');

  // 3. Categories (3-level deep)
  // L1
  const fashionW = await prisma.category.create({ data: { name: "Women's & Girls' Fashion", slug: "womens-fashion", level: 1 } });
  const fashionM = await prisma.category.create({ data: { name: "Men's & Boys' Fashion", slug: "mens-fashion", level: 1 } });
  const electronics = await prisma.category.create({ data: { name: "Electronics", slug: "electronics", level: 1 } });
  const home = await prisma.category.create({ data: { name: "Home & Lifestyle", slug: "home-lifestyle", level: 1 } });

  // L2
  const bags = await prisma.category.create({ data: { name: "Bags", slug: "bags", level: 2, parentId: fashionW.id } });
  const clothingW = await prisma.category.create({ data: { name: "Clothing", slug: "clothing-women", level: 2, parentId: fashionW.id } });
  
  const shoes = await prisma.category.create({ data: { name: "Shoes", slug: "shoes", level: 2, parentId: fashionM.id } });
  const clothingM = await prisma.category.create({ data: { name: "Clothing", slug: "clothing-men", level: 2, parentId: fashionM.id } });

  const mobiles = await prisma.category.create({ data: { name: "Mobile Phones", slug: "mobile-phones", level: 2, parentId: electronics.id } });
  const accessories = await prisma.category.create({ data: { name: "Accessories", slug: "accessories", level: 2, parentId: electronics.id } });

  const furniture = await prisma.category.create({ data: { name: "Furniture", slug: "furniture", level: 2, parentId: home.id } });
  const decor = await prisma.category.create({ data: { name: "Decor", slug: "decor", level: 2, parentId: home.id } });

  // L3
  const wallets = await prisma.category.create({ data: { name: "Wallets", slug: "wallets", level: 3, parentId: bags.id } });
  const backpacks = await prisma.category.create({ data: { name: "Backpacks", slug: "backpacks", level: 3, parentId: bags.id } });
  const crossbody = await prisma.category.create({ data: { name: "Crossbody & Shoulder Bags", slug: "crossbody", level: 3, parentId: bags.id } });

  const dresses = await prisma.category.create({ data: { name: "Dresses", slug: "dresses", level: 3, parentId: clothingW.id } });
  const tops = await prisma.category.create({ data: { name: "Tops", slug: "tops", level: 3, parentId: clothingW.id } });

  const sneakers = await prisma.category.create({ data: { name: "Sneakers", slug: "sneakers", level: 3, parentId: shoes.id } });
  const formalShoes = await prisma.category.create({ data: { name: "Formal Shoes", slug: "formal-shoes", level: 3, parentId: shoes.id } });

  const tshirts = await prisma.category.create({ data: { name: "T-Shirts", slug: "tshirts", level: 3, parentId: clothingM.id } });
  const jeans = await prisma.category.create({ data: { name: "Jeans", slug: "jeans", level: 3, parentId: clothingM.id } });

  const smartphones = await prisma.category.create({ data: { name: "Smartphones", slug: "smartphones", level: 3, parentId: mobiles.id } });
  const earbuds = await prisma.category.create({ data: { name: "Earbuds", slug: "earbuds", level: 3, parentId: accessories.id } });

  const chairs = await prisma.category.create({ data: { name: "Chairs", slug: "chairs", level: 3, parentId: furniture.id } });
  const tables = await prisma.category.create({ data: { name: "Tables", slug: "tables", level: 3, parentId: furniture.id } });
  const lighting = await prisma.category.create({ data: { name: "Lighting", slug: "lighting", level: 3, parentId: decor.id } });

  console.log('Categories created (3-level deep).');

  // 4. Products (40+)
  const products: any[] = [
    { name: "Leather Wallet Minimalist", price: 1200, categoryId: wallets.id, brandId: zara.id },
    { name: "Zip Around Wallet", price: 1500, categoryId: wallets.id, brandId: zara.id },
    { name: "Women's Travel Backpack", price: 3500, categoryId: backpacks.id, brandId: nike.id },
    { name: "Canvas Mini Backpack", price: 2100, categoryId: backpacks.id, brandId: zara.id },
    { name: "Elegant Crossbody Bag", price: 2800, categoryId: crossbody.id, brandId: zara.id },
    { name: "Casual Crossbody Purse", price: 1800, categoryId: crossbody.id, brandId: zara.id },
    
    { name: "Summer Floral Dress", price: 2200, categoryId: dresses.id, brandId: zara.id },
    { name: "Evening Maxi Dress", price: 4500, categoryId: dresses.id, brandId: zara.id },
    { name: "Cotton V-Neck Top", price: 800, categoryId: tops.id, brandId: zara.id },
    { name: "Silk Blouse", price: 2600, categoryId: tops.id, brandId: zara.id },

    { name: "Air Max Running Sneakers", price: 8500, categoryId: sneakers.id, brandId: nike.id },
    { name: "Classic White Sneakers", price: 6500, categoryId: sneakers.id, brandId: nike.id },
    { name: "Oxford Formal Leather Shoes", price: 4200, categoryId: formalShoes.id, brandId: zara.id },
    { name: "Brown Derby Shoes", price: 3800, categoryId: formalShoes.id, brandId: zara.id },

    { name: "Basic Cotton T-Shirt Black", price: 500, categoryId: tshirts.id, brandId: nike.id },
    { name: "Graphic Print T-Shirt", price: 800, categoryId: tshirts.id, brandId: nike.id },
    { name: "Slim Fit Blue Jeans", price: 2500, categoryId: jeans.id, brandId: zara.id },
    { name: "Relaxed Fit Black Jeans", price: 2400, categoryId: jeans.id, brandId: zara.id },

    { name: "iPhone 15 Pro Max 256GB", price: 155000, categoryId: smartphones.id, brandId: apple.id },
    { name: "iPhone 14 128GB", price: 85000, categoryId: smartphones.id, brandId: apple.id },
    { name: "Galaxy S24 Ultra", price: 145000, categoryId: smartphones.id, brandId: samsung.id },
    { name: "Galaxy A54 5G", price: 45000, categoryId: smartphones.id, brandId: samsung.id },

    { name: "AirPods Pro (2nd Gen)", price: 28000, categoryId: earbuds.id, brandId: apple.id },
    { name: "Galaxy Buds 2 Pro", price: 18000, categoryId: earbuds.id, brandId: samsung.id },
    { name: "Nike Sport Earbuds", price: 8000, categoryId: earbuds.id, brandId: nike.id },
    { name: "Basic Wireless Earbuds", price: 2500, categoryId: earbuds.id, brandId: samsung.id },

    { name: "Ergonomic Office Chair", price: 12000, categoryId: chairs.id, brandId: ikea.id },
    { name: "Dining Chair Velvet", price: 4500, categoryId: chairs.id, brandId: ikea.id },
    { name: "Minimalist Desk", price: 8500, categoryId: tables.id, brandId: ikea.id },
    { name: "Coffee Table Wood", price: 6200, categoryId: tables.id, brandId: ikea.id },

    { name: "Modern Floor Lamp", price: 3500, categoryId: lighting.id, brandId: ikea.id },
    { name: "LED Desk Lamp", price: 1200, categoryId: lighting.id, brandId: ikea.id },
    { name: "Pendant Ceiling Light", price: 2800, categoryId: lighting.id, brandId: ikea.id },
    { name: "Smart LED Bulb Color", price: 1500, categoryId: lighting.id, brandId: samsung.id },
    
    // Extra products to reach 40+
    { name: "Running T-Shirt Dri-Fit", price: 1200, categoryId: tshirts.id, brandId: nike.id },
    { name: "Training Shorts Men", price: 1500, categoryId: clothingM.id, brandId: nike.id },
    { name: "Yoga Pants Women", price: 1800, categoryId: clothingW.id, brandId: nike.id },
    { name: "Sports Bra Core", price: 1400, categoryId: tops.id, brandId: nike.id },
    { name: "Wireless Charging Pad", price: 2500, categoryId: accessories.id, brandId: samsung.id },
    { name: "MagSafe Charger", price: 4500, categoryId: accessories.id, brandId: apple.id },
    { name: "Leather Phone Case", price: 1800, categoryId: accessories.id, brandId: apple.id },
    { name: "Silicone Watch Band", price: 800, categoryId: accessories.id, brandId: apple.id },
    { name: "Bookshelf 5-Tier", price: 7500, categoryId: furniture.id, brandId: ikea.id },
    { name: "TV Cabinet Modern", price: 14000, categoryId: furniture.id, brandId: ikea.id }
  ];

  // Add 60 more generic dummy products to test Just For You section
  for (let i = 1; i <= 60; i++) {
    const isFlashSale = i <= 15; // Make the first 15 products flash sale
    const price = Math.floor(Math.random() * 5000) + 1500;
    const discountPrice = isFlashSale ? Math.floor(price * 0.7) : null; // 30% off for flash sales

    products.push({
      name: `Just For You Premium Product ${i}`,
      price: price,
      discountPrice: discountPrice,
      isFlashSale: isFlashSale,
      categoryId: accessories.id,
      brandId: samsung.id
    });
  }

  const validImages = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600&h=600',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600&h=600',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=600&h=600',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=600&h=600',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=600&h=600'
  ];

  const productData = products.map((p, i) => ({
    name: p.name,
    slug: slugify(p.name + '-' + Math.random().toString(36).substring(7), { lower: true, strict: true }),
    description: `High quality ${p.name.toLowerCase()} for your everyday needs. Discover the best in class.`,
    price: p.price,
    discountPrice: (p as any).discountPrice || null,
    isFlashSale: (p as any).isFlashSale || false,
    stock: Math.floor(Math.random() * 100) + 10,
    categoryId: p.categoryId,
    brandId: p.brandId,
    images: [validImages[i % validImages.length]]
  }));

  await prisma.product.createMany({ data: productData });

  console.log(`Seeded ${products.length} products successfully!`);

  // 5. Banners
  await prisma.banner.createMany({
    data: [
      {
        title: 'Corporate Furniture Sale',
        imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1200&h=400',
        targetUrl: '/shop',
        type: 'MAIN_CAROUSEL',
        isActive: true,
        order: 1
      },
      {
        title: 'New Office Tech Arrivals',
        imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200&h=400',
        targetUrl: '/shop',
        type: 'MAIN_CAROUSEL',
        isActive: true,
        order: 2
      },
      {
        title: 'Special Offer Banner',
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200&h=200',
        targetUrl: '/contact',
        type: 'SPECIAL_OFFER',
        isActive: true,
        order: 1
      }
    ]
  });
  console.log('Banners created.');

  // 6. Settings
  await prisma.setting.createMany({
    data: [
      { key: 'SUPPORT_EMAIL', value: 'support@smart24.com' },
      { key: 'CONTACT_PHONE', value: '+880 1234 567890' },
      { key: 'OFFICE_ADDRESS', value: '123 Business Avenue, Dhaka, Bangladesh' },
    ]
  });
  console.log('Settings (Support details) created.');

  // 7. FAQs
  await prisma.faq.createMany({
    data: [
      {
        category: 'Orders & Tracking',
        question: 'How can I track my order?',
        answer: 'You can track your order by going to the "Track Order" page and entering your Order ID.',
        isActive: true,
        order: 1,
        helpfulCount: 45,
        notHelpfulCount: 2
      },
      {
        category: 'Orders & Tracking',
        question: 'What is the estimated delivery time?',
        answer: 'Typically, orders are delivered within 4 business days after processing.',
        isActive: true,
        order: 2,
        helpfulCount: 30,
        notHelpfulCount: 5
      },
      {
        category: 'Returns & Refunds',
        question: 'How do I return a damaged product?',
        answer: 'Please go to the Contact Us page, select "Order Issue", choose the linked order, and provide a screenshot of the damaged product. Our team will assist you within 24 hours.',
        isActive: true,
        order: 3,
        helpfulCount: 65,
        notHelpfulCount: 1
      },
      {
        category: 'Returns & Refunds',
        question: 'How long does a refund take?',
        answer: 'Refunds usually take 5-7 business days to reflect in your account once the returned item is inspected.',
        isActive: true,
        order: 4,
        helpfulCount: 22,
        notHelpfulCount: 0
      },
      {
        category: 'General',
        question: 'Do you offer international shipping?',
        answer: 'Currently, we only ship within Bangladesh.',
        isActive: true,
        order: 5,
        helpfulCount: 15,
        notHelpfulCount: 12
      }
    ]
  });
  console.log('FAQs created.');

  // 8. Subscription Plans
  await prisma.subscriptionPlan.deleteMany({});
  
  const savedProducts = await prisma.product.findMany({ take: 10 });

  if (savedProducts.length >= 6) {
    // Create Basic Office Supplies Plan
    await prisma.subscriptionPlan.create({
      data: {
        name: 'Basic Office Supplies',
        description: 'A monthly refill of essential office items like paper, pens, and notepads.',
        price: 5000,
        isActive: true,
        items: {
          create: [
            { productId: savedProducts[0].id, quantity: 2 },
            { productId: savedProducts[1].id, quantity: 1 }
          ]
        }
      }
    });

    // Create Premium Pantry Plan
    await prisma.subscriptionPlan.create({
      data: {
        name: 'Premium Pantry Box',
        description: 'Keep your team energized with a monthly supply of premium coffee, tea, and snacks.',
        price: 12000,
        isActive: true,
        items: {
          create: [
            { productId: savedProducts[2].id, quantity: 5 },
            { productId: savedProducts[3].id, quantity: 3 }
          ]
        }
      }
    });

    // Create Executive Box
    await prisma.subscriptionPlan.create({
      data: {
        name: 'Executive Tech Refresh',
        description: 'Quarterly/Monthly tech accessories and premium lifestyle items for executives.',
        price: 25000,
        isActive: true,
        items: {
          create: [
            { productId: savedProducts[4].id, quantity: 1 },
            { productId: savedProducts[5].id, quantity: 1 }
          ]
        }
      }
    });
  }

  console.log('Subscription Plans created.');

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
