import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const dummyClients = [
  {
    name: 'Grameenphone Ltd.',
    slug: 'grameenphone-ltd',
    logoUrl: '/clients/grameenphone.svg',
    websiteUrl: 'https://www.grameenphone.com',
    industry: 'Telecommunications',
    description:
      "Bangladesh's leading telecommunications operator with over 80 million subscribers. Grameenphone partnered with Smart24 to equip their corporate offices with premium tech accessories and office solutions.",
    purchaseNote:
      'Supplied 500+ ergonomic accessories, networking equipment, and branded peripherals for nationwide offices.',
    productIds: [],
    isActive: true,
    order: 0,
  },
  {
    name: 'BRAC Bank PLC',
    slug: 'brac-bank-plc',
    logoUrl: '/clients/brac-bank.svg',
    websiteUrl: 'https://www.bracbank.com',
    industry: 'Banking & Financial Services',
    description:
      'One of the fastest growing banks in Bangladesh focused on SME banking. BRAC Bank chose Smart24 as their trusted procurement partner for digital workstation upgrades.',
    purchaseNote:
      'Procured 300+ laptops, workstation peripherals, and security accessories for branch digitization.',
    productIds: [],
    isActive: true,
    order: 1,
  },
  {
    name: 'Square Pharmaceuticals Ltd.',
    slug: 'square-pharmaceuticals-ltd',
    logoUrl: '/clients/square.svg',
    websiteUrl: 'https://www.squarepharma.com.bd',
    industry: 'Healthcare & Pharmaceuticals',
    description:
      'The largest pharmaceutical company in Bangladesh. Square Pharmaceuticals leveraged Smart24 for bulk procurement of IT accessories for their R&D and manufacturing operations.',
    purchaseNote:
      'Bulk supply of 200+ precision accessories, lab-grade electronics, and enterprise-level storage devices.',
    productIds: [],
    isActive: true,
    order: 2,
  },
  {
    name: 'Dhaka University',
    slug: 'dhaka-university',
    logoUrl: '/clients/dhaka-university.svg',
    websiteUrl: 'https://www.du.ac.bd',
    industry: 'Education & Training',
    description:
      "The oldest and largest public university in Bangladesh. Dhaka University selected Smart24 to modernize their computer labs and faculty offices with cutting-edge tech solutions.",
    purchaseNote:
      'Delivered 400+ computer peripherals, classroom AV equipment, and smart devices for 12 academic departments.',
    productIds: [],
    isActive: true,
    order: 3,
  },
  {
    name: 'Walton Hi-Tech Industries PLC',
    slug: 'walton-hi-tech-industries',
    logoUrl: '/clients/walton.svg',
    websiteUrl: 'https://www.waltonbd.com',
    industry: 'Manufacturing & Industrial',
    description:
      "Bangladesh's leading electronics and appliance manufacturer. Walton partnered with Smart24 for specialized industrial accessories and component procurement to support their production lines.",
    purchaseNote:
      'Sourced 600+ specialized components, tools, and industrial-grade accessories for manufacturing and QA divisions.',
    productIds: [],
    isActive: true,
    order: 4,
  },
  {
    name: 'bKash Limited',
    slug: 'bkash-limited',
    logoUrl: '/clients/bkash.svg',
    websiteUrl: 'https://www.bkash.com',
    industry: 'FinTech & Digital Payments',
    description: 'Leading mobile financial services provider in Bangladesh serving 70M+ customers.',
    purchaseNote: 'Equipped digital customer centers and regional tech offices with verified IT hardware.',
    productIds: [],
    isActive: true,
    order: 5,
  },
  {
    name: 'Unilever Bangladesh',
    slug: 'unilever-bangladesh',
    logoUrl: '/clients/unilever.svg',
    websiteUrl: 'https://www.unilever.com.bd',
    industry: 'FMCG & Consumer Goods',
    description: 'Multinational FMCG giant powering household essentials across Bangladesh.',
    purchaseNote: 'Supply chain workstation optimization and ergonomic workspace setup.',
    productIds: [],
    isActive: true,
    order: 6,
  },
  {
    name: 'Robi Axiata Limited',
    slug: 'robi-axiata-limited',
    logoUrl: '/clients/robi.svg',
    websiteUrl: 'https://www.robi.com.bd',
    industry: 'Telecommunications',
    description: 'Premier digital network service provider with nationwide 4.5G network infrastructure.',
    purchaseNote: 'Corporate IT equipment and data management accessories.',
    productIds: [],
    isActive: true,
    order: 7,
  },
  {
    name: 'Beximco Group',
    slug: 'beximco-group',
    logoUrl: '/clients/beximco.svg',
    websiteUrl: 'https://www.beximco.com',
    industry: 'Conglomerate & Export',
    description: 'Diversified multinational industrial conglomerate with global pharmaceutical and textile reach.',
    purchaseNote: 'High-volume corporate procurement for industrial headquarters.',
    productIds: [],
    isActive: true,
    order: 8,
  },
  {
    name: 'Standard Chartered Bangladesh',
    slug: 'standard-chartered-bangladesh',
    logoUrl: '/clients/standard-chartered.svg',
    websiteUrl: 'https://www.sc.com/bd',
    industry: 'Banking & Financial Services',
    description: 'Oldest international financial institution operating in Bangladesh.',
    purchaseNote: 'Executive floor tech refits and secure smart office peripherals.',
    productIds: [],
    isActive: true,
    order: 9,
  },
];

async function main() {
  console.log('🌱 Updating clients with local SVG logos...\n');

  for (const client of dummyClients) {
    const existing = await prisma.client.findFirst({
      where: {
        OR: [{ slug: client.slug }, { name: client.name }],
      },
    });

    if (existing) {
      await prisma.client.update({
        where: { id: existing.id },
        data: client,
      });
      console.log(`🔄 Updated: ${client.name}`);
    } else {
      await prisma.client.create({ data: client });
      console.log(`✅ Created: ${client.name}`);
    }
  }

  console.log('\n🎉 Client seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
