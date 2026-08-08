import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

const prisma = new PrismaClient();

const generateSlug = (name: string) => {
  return slugify(name, { lower: true, strict: true }) + '-' + Math.random().toString(36).substring(2, 6);
};

const categoryData = [
  {
    name: "Women's & Girls' Fashion",
    subcategories: [
      { name: "Women's Clothing", children: ["Sarees", "Salwar Kameez", "Kurtis", "Dresses", "Tops", "T-Shirts", "Shirts", "Jeans", "Pants", "Skirts", "Leggings", "Hoodies", "Jackets", "Nightwear", "Lingerie"] },
      { name: "Girls' Clothing", children: ["Dresses", "Tops", "T-Shirts", "Pants", "School Uniform", "Ethnic Wear"] },
      { name: "Women's Shoes", children: ["Heels", "Flats", "Sandals", "Sneakers", "Boots"] },
      { name: "Women's Bags", children: ["Handbags", "Tote Bags", "Shoulder Bags", "Wallets", "Clutches"] },
      { name: "Women's Accessories", children: ["Belts", "Sunglasses", "Scarves", "Hair Accessories"] }
    ]
  },
  {
    name: "Men's & Boys' Fashion",
    subcategories: [
      { name: "Men's Clothing", children: ["T-Shirts", "Shirts", "Polo Shirts", "Panjabi", "Jeans", "Trousers", "Shorts", "Blazers", "Suits", "Jackets", "Hoodies"] },
      { name: "Boys' Clothing", children: ["T-Shirts", "Shirts", "Pants", "Shorts", "School Uniform", "Ethnic Wear"] },
      { name: "Men's Shoes", children: ["Formal Shoes", "Casual Shoes", "Sneakers", "Sandals", "Boots"] },
      { name: "Men's Bags", children: ["Backpacks", "Laptop Bags", "Travel Bags", "Wallets"] },
      { name: "Men's Accessories", children: ["Belts", "Caps", "Sunglasses", "Ties"] }
    ]
  },
  {
    name: "Electronic Accessories",
    subcategories: [
      { name: "Mobile Accessories", children: ["Chargers", "USB Cables", "Phone Cases", "Screen Protectors", "Earphones", "Power Banks"] },
      { name: "Computer Accessories", children: ["Keyboard", "Mouse", "Webcam", "Speakers", "SSD", "RAM"] },
      { name: "Storage Devices", children: ["Memory Cards", "Pen Drives", "External HDD", "External SSD"] },
      { name: "Networking", children: ["Router", "Switch", "WiFi Extender"] },
      { name: "Smart Gadgets", children: ["Smart Watches", "Smart Bands"] }
    ]
  },
  {
    name: "TV & Home Appliances",
    subcategories: [
      { name: "Television", children: ["Smart TV", "Android TV", "LED TV"] },
      { name: "Kitchen Appliances", children: ["Rice Cooker", "Microwave Oven", "Blender", "Juicer", "Electric Kettle", "Induction Cooker"] },
      { name: "Home Appliances", children: ["Refrigerator", "Washing Machine", "Air Conditioner", "Vacuum Cleaner", "Iron"] },
      { name: "Home Entertainment", children: ["Speakers", "Soundbars", "Home Theatre"] }
    ]
  },
  {
    name: "Electronics Device",
    subcategories: [
      { name: "Mobile Phones", children: ["Android Phones", "iPhone", "Feature Phones"] },
      { name: "Tablets", children: [] },
      { name: "Laptops", children: ["Gaming Laptop", "Business Laptop", "Student Laptop"] },
      { name: "Desktop Computers", children: [] },
      { name: "Monitors", children: [] },
      { name: "Printers", children: [] },
      { name: "Cameras", children: ["DSLR", "Mirrorless", "Action Camera"] },
      { name: "Gaming", children: ["Gaming Console", "Gaming Monitor", "Gaming Chair"] }
    ]
  },
  {
    name: "Mother & Baby",
    subcategories: [
      { name: "Baby Food", children: [] },
      { name: "Diapers", children: [] },
      { name: "Baby Care", children: ["Shampoo", "Lotion", "Powder", "Wipes"] },
      { name: "Baby Clothing", children: [] },
      { name: "Baby Shoes", children: [] },
      { name: "Baby Toys", children: [] },
      { name: "Baby Gear", children: ["Stroller", "Walker", "Car Seat"] },
      { name: "School Supplies", children: [] }
    ]
  },
  {
    name: "Automotive & Motorbike",
    subcategories: [
      { name: "Car Accessories", children: ["Seat Covers", "Floor Mats", "Car Chargers", "Car Cameras"] },
      { name: "Motorbike Accessories", children: ["Helmets", "Riding Gloves", "Bike Covers"] },
      { name: "Tyres", children: [] },
      { name: "Lubricants", children: [] },
      { name: "Car Care", children: ["Polish", "Car Shampoo"] },
      { name: "Tools", children: [] }
    ]
  },
  {
    name: "Sports & Outdoors",
    subcategories: [
      { name: "Gym Equipment", children: [] },
      { name: "Cricket", children: [] },
      { name: "Football", children: [] },
      { name: "Badminton", children: [] },
      { name: "Cycling", children: [] },
      { name: "Camping", children: [] },
      { name: "Fishing", children: [] },
      { name: "Outdoor Accessories", children: [] },
      { name: "Fitness Wear", children: [] }
    ]
  },
  {
    name: "Home & Lifestyle",
    subcategories: [
      { name: "Furniture", children: ["Sofa", "Bed", "Chair", "Table", "Wardrobe"] },
      { name: "Kitchen & Dining", children: ["Cookware", "Dinnerware", "Kitchen Storage", "Kitchen Tools"] },
      { name: "Home Decor", children: ["Curtains", "Carpets", "Lighting", "Wall Decor"] },
      { name: "Bathroom Accessories", children: [] },
      { name: "Cleaning Supplies", children: [] },
      { name: "Storage & Organization", children: [] },
      { name: "Tools & Hardware", children: [] },
      { name: "Garden Supplies", children: [] }
    ]
  },
  {
    name: "Groceries",
    subcategories: [
      { name: "Rice", children: [] },
      { name: "Flour", children: [] },
      { name: "Sugar", children: [] },
      { name: "Salt", children: [] },
      { name: "Cooking Oil", children: [] },
      { name: "Spices", children: [] },
      { name: "Tea & Coffee", children: [] },
      { name: "Snacks", children: [] },
      { name: "Biscuits", children: [] },
      { name: "Dairy Products", children: [] },
      { name: "Frozen Food", children: [] },
      { name: "Beverages", children: [] },
      { name: "Bakery", children: [] },
      { name: "Canned Food", children: [] }
    ]
  },
  {
    name: "Health & Beauty",
    subcategories: [
      { name: "Skincare", children: [] },
      { name: "Hair Care", children: [] },
      { name: "Makeup", children: [] },
      { name: "Perfumes", children: [] },
      { name: "Personal Care", children: [] },
      { name: "Men's Grooming", children: [] },
      { name: "Beauty Tools", children: [] },
      { name: "Health Supplements", children: [] },
      { name: "Medical Devices", children: [] }
    ]
  },
  {
    name: "Watches, Bags & Jewellery",
    subcategories: [
      { name: "Watches", children: ["Analog Watches", "Digital Watches", "Smart Watches"] },
      { name: "Bags", children: ["Backpacks", "Handbags", "Laptop Bags", "Travel Bags", "Wallets"] },
      { name: "Luggage", children: ["Suitcases", "Trolley Bags"] },
      { name: "Jewellery", children: ["Rings", "Necklaces", "Earrings", "Bracelets", "Pendants"] }
    ]
  }
];

async function main() {
  console.log('Start seeding categories...');
  
  for (const parent of categoryData) {
    const createdParent = await prisma.category.create({
      data: {
        name: parent.name,
        slug: generateSlug(parent.name),
        level: 1,
        isActive: true,
      }
    });
    console.log(`Created Level 1: ${createdParent.name}`);

    for (const sub of parent.subcategories) {
      const createdSub = await prisma.category.create({
        data: {
          name: sub.name,
          slug: generateSlug(sub.name),
          level: 2,
          parentId: createdParent.id,
          isActive: true,
        }
      });
      console.log(`  Created Level 2: ${createdSub.name}`);

      for (const child of sub.children) {
        await prisma.category.create({
          data: {
            name: child,
            slug: generateSlug(child),
            level: 3,
            parentId: createdSub.id,
            isActive: true,
          }
        });
        console.log(`    Created Level 3: ${child}`);
      }
    }
  }
  
  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
