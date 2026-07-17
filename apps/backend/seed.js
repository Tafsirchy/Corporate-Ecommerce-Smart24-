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
      { name: 'Clothing', level: 1 },
      { name: 'Home & Kitchen', level: 1 },
      { name: 'Books', level: 1 },
      { name: 'Sports', level: 1 }
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

    // Seed Subcategory
    await categoriesCollection.insertOne({
      name: 'Smartphones',
      slug: 'smartphones',
      level: 2,
      parentId: electronicsId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const smartphonesCat = await categoriesCollection.findOne({ slug: 'smartphones' });

    // Seed Brands
    const brandResult = await brandsCollection.insertOne({
      name: 'TechCorp',
      slug: 'techcorp',
      description: 'Leading technology brand',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const brandId = brandResult.insertedId;

    // Seed Products
    await productsCollection.insertMany([
      {
        name: 'Smartphone X',
        slug: 'smartphone-x',
        description: 'This is an amazing Smartphone X',
        price: 999,
        stock: 50,
        images: ['https://placehold.co/600x400?text=Smartphone+X'],
        categoryId: smartphonesCat._id,
        brandId: brandId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Laptop Pro',
        slug: 'laptop-pro',
        description: 'This is an amazing Laptop Pro',
        price: 1499,
        stock: 50,
        images: ['https://placehold.co/600x400?text=Laptop+Pro'],
        categoryId: electronicsId,
        brandId: brandId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cotton T-Shirt',
        slug: 'cotton-t-shirt',
        description: 'This is an amazing Cotton T-Shirt',
        price: 19,
        stock: 50,
        images: ['https://placehold.co/600x400?text=Cotton+T-Shirt'],
        categoryId: catResult.insertedIds[1], // Clothing
        brandId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    console.log("Seeding successful!");
  } finally {
    await client.close();
  }
}

seed().catch(console.error);
