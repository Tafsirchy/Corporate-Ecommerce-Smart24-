import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const fallbackData = [
  { position: 1, title: "ELECTRONICS", subtitle: "Tech & Gadgets", buttonText: "Shop Tech", targetUrl: "/shop?category=electronics", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800&h=600" },
  { position: 2, title: "ACCESSORIES", subtitle: "Premium Add-ons", buttonText: "Explore", targetUrl: "/shop?category=accessories", imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600&h=600" },
  { position: 3, title: "MENS FASHION", subtitle: "Apparel & More", buttonText: "Shop Men's", targetUrl: "/shop?category=mens-fashion", imageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=600&h=600" },
  { position: 4, title: "EARBUDS", subtitle: "Wireless Audio", buttonText: "Discover", targetUrl: "/shop?category=earbuds", imageUrl: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=600&h=600" },
  { position: 5, title: "SMARTPHONES", subtitle: "Latest Tech", buttonText: "Shop Phones", targetUrl: "/shop?category=smartphones", imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=600&h=600" },
  { position: 6, title: "WOMENS FASHION", subtitle: "Trendy Styles", buttonText: "Browse", targetUrl: "/shop?category=womens-fashion", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600&h=600" },
  { position: 7, title: "FURNITURE", subtitle: "Office & Home", buttonText: "New Arrivals", targetUrl: "/shop?category=furniture", imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600&h=600" },
  { position: 8, title: "HOME LIFESTYLE", subtitle: "Decor & More", buttonText: "View Collection", targetUrl: "/shop?category=home-lifestyle", imageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=600&h=600" }
];

async function main() {
  console.log('Start seeding business collections...');

  for (const data of fallbackData) {
    const existing = await prisma.businessCollection.findUnique({
      where: { position: data.position }
    });

    if (!existing) {
      await prisma.businessCollection.create({
        data: {
          position: data.position,
          title: data.title,
          subtitle: data.subtitle,
          buttonText: data.buttonText,
          targetUrl: data.targetUrl,
          imageUrl: data.imageUrl,
          isActive: true,
        }
      });
      console.log(`Created collection for position ${data.position}`);
    } else {
      console.log(`Position ${data.position} already exists.`);
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
