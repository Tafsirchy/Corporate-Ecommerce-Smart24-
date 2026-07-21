require('dotenv').config();
const { MongoClient } = require('mongodb');
const slugify = require('slugify');

async function seed() {
  const uri = process.env.DATABASE_URL;
  if (!uri) throw new Error("DATABASE_URL not found");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db("corporate-ecommerce");

    const categoriesCollection = db.collection("Category");
    const brandsCollection = db.collection("Brand");
    const productsCollection = db.collection("Product");

    // Clear existing data
    await categoriesCollection.deleteMany({});
    await brandsCollection.deleteMany({});
    await productsCollection.deleteMany({});

    // Seed Categories
    const categoriesData = [
      { name: 'Electronics', level: 1 },
      { name: 'Accessories', level: 1 },
      { name: 'Clothing', level: 1 },
      { name: 'Home & Kitchen', level: 1 },
    ];

    const categoryDocs = categoriesData.map(c => ({
      name: c.name,
      slug: slugify(c.name, { lower: true, strict: true }),
      level: c.level,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const catResult = await categoriesCollection.insertMany(categoryDocs);
    const electronicsId = catResult.insertedIds[0];
    const accessoriesId = catResult.insertedIds[1];

    // Seed Subcategories
    await categoriesCollection.insertMany([
      {
        name: 'Smartphones',
        slug: 'smartphones',
        level: 2,
        parentId: electronicsId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Phone Cases',
        slug: 'phone-cases',
        level: 2,
        parentId: accessoriesId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    
    const smartphonesCat = await categoriesCollection.findOne({ slug: 'smartphones' });
    const phoneCasesCat = await categoriesCollection.findOne({ slug: 'phone-cases' });

    // Seed Brands
    const brandDocs = [
      { name: 'Apple', slug: 'apple', description: 'Apple Inc.', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Samsung', slug: 'samsung', description: 'Samsung Electronics', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Spigen', slug: 'spigen', description: 'Premium Cases', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Xiaomi', slug: 'xiaomi', description: 'Xiaomi', createdAt: new Date(), updatedAt: new Date() }
    ];
    await brandsCollection.insertMany(brandDocs);
    const appleBrand = await brandsCollection.findOne({ slug: 'apple' });
    const samsungBrand = await brandsCollection.findOne({ slug: 'samsung' });
    const spigenBrand = await brandsCollection.findOne({ slug: 'spigen' });

    // Seed Products
    const productsToInsert = [];
    
    // iPhones
    productsToInsert.push({
      name: 'iPhone 15 Pro Max',
      slug: 'iphone-15-pro-max',
      description: 'The ultimate iPhone with titanium design.',
      price: 159900,
      stock: 25,
      images: ['https://placehold.co/800x800/eeeeee/333333?text=iPhone+15+Pro+Max'],
      categoryId: smartphonesCat._id,
      brandId: appleBrand._id,
      rating: 4.8,
      reviewCount: 124,
      color: 'Grey',
      warrantyType: 'Brand Warranty',
      brandCompatibility: 'Apple',
      caseMaterial: 'Metal',
      compatibilityByModel: 'iPhone 15 Pro',
      location: 'Bangladesh',
      services: ['free-shipping', 'installment'],
      sellerName: 'Apple Official Store',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Samsung Galaxy
    productsToInsert.push({
      name: 'Galaxy S24 Ultra',
      slug: 'galaxy-s24-ultra',
      description: 'AI powered Samsung flagship.',
      price: 145000,
      stock: 15,
      images: ['https://placehold.co/800x800/eeeeee/333333?text=Galaxy+S24+Ultra'],
      categoryId: smartphonesCat._id,
      brandId: samsungBrand._id,
      rating: 4.7,
      reviewCount: 89,
      color: 'Black',
      warrantyType: 'Brand Warranty',
      brandCompatibility: 'Samsung',
      caseMaterial: 'Metal',
      compatibilityByModel: 'Galaxy S24 Ultra',
      location: 'Overseas',
      services: ['best-price', 'cod'],
      sellerName: 'Samsung Global',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Cases
    productsToInsert.push({
      name: 'Spigen Liquid Air Case for iPhone 15',
      slug: 'spigen-liquid-air-iphone-15',
      description: 'Slim protection for your new iPhone.',
      price: 1500,
      stock: 100,
      images: ['https://placehold.co/800x800/eeeeee/333333?text=Spigen+Case+Black'],
      categoryId: phoneCasesCat._id,
      brandId: spigenBrand._id,
      rating: 4.5,
      reviewCount: 340,
      color: 'Black',
      warrantyType: 'No Warranty',
      brandCompatibility: 'Apple',
      caseMaterial: 'Silicone',
      compatibilityByModel: 'iPhone 15 Pro',
      location: 'Bangladesh',
      services: ['cod'],
      sellerName: 'Smart24 Official',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    productsToInsert.push({
      name: 'Premium Leather Case Galaxy S24',
      slug: 'premium-leather-case-s24',
      description: 'Genuine leather cover.',
      price: 2500,
      stock: 40,
      images: ['https://placehold.co/800x800/eeeeee/333333?text=Leather+Case+Brown'],
      categoryId: phoneCasesCat._id,
      brandId: samsungBrand._id,
      rating: 4.2,
      reviewCount: 56,
      color: 'Brown',
      warrantyType: 'Local Seller Warranty',
      brandCompatibility: 'Samsung',
      caseMaterial: 'Leather',
      compatibilityByModel: 'Galaxy S24 Ultra',
      location: 'Bangladesh',
      services: ['free-shipping', 'cod'],
      sellerName: 'LeatherCraft',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Add 10 more generic products to have enough data for filtering
    const colors = ['Red', 'Blue', 'White', 'Yellow', 'Green'];
    const mats = ['Plastic', 'Glass', 'Metal'];
    for (let i = 1; i <= 10; i++) {
      productsToInsert.push({
        name: `Generic Smart Accessory ${i}`,
        slug: `generic-smart-accessory-${i}`,
        description: `High quality smart accessory number ${i}.`,
        price: 500 + (i * 150),
        stock: 10 * i,
        images: [`https://placehold.co/800x800/eeeeee/333333?text=Accessory+${i}`],
        categoryId: accessoriesId,
        brandId: null,
        rating: 3.5 + (i % 2),
        reviewCount: i * 15,
        color: colors[i % colors.length],
        warrantyType: i % 2 === 0 ? 'International Manufacturer Warranty' : 'No Warranty',
        brandCompatibility: i % 3 === 0 ? 'Universal' : 'Other',
        caseMaterial: mats[i % mats.length],
        compatibilityByModel: 'Universal',
        location: i % 4 === 0 ? 'Overseas' : 'Bangladesh',
        services: ['cod'],
        sellerName: 'Gadget Store',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await productsCollection.insertMany(productsToInsert);

    console.log(`Seeding successful! Inserted ${productsToInsert.length} products.`);
  } finally {
    await client.close();
  }
}

seed().catch(console.error);
