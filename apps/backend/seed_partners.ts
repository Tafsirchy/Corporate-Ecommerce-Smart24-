import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding industrial partners with supplied catalog products and detailed procurement records...');

  const products = await prisma.product.findMany({
    take: 8,
    select: { id: true, name: true, price: true },
  });

  const pIds = products.map((p) => p.id);
  const supplied1 = pIds.slice(0, 3);
  const procured1 = pIds.slice(2, 5);
  const supplied2 = pIds.slice(3, 6);
  const procured2 = pIds.slice(1, 4);
  const supplied3 = pIds.slice(5, 8);
  const procured3 = pIds.slice(4, 7);

  const partners = [
    {
      name: 'Walton Hi-Tech Industries PLC',
      slug: 'walton-hi-tech-industries-plc',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Walton_Bangladesh_logo.svg/1200px-Walton_Bangladesh_logo.svg.png',
      websiteUrl: 'https://waltonbd.com',
      industry: 'Electronics & Consumer Durables',
      tier: 'Strategic OEM Partner',
      description:
        'Bangladesh’s foremost electronics and appliance manufacturing conglomerate. Walton partners with Smart24 for customized hardware engineering, smart displays, and local distribution channels.',
      mouDetails:
        'Long-term manufacturing agreement signed in Q1 2024 covering bulk supply of motherboards, LED panels, and localized component assembly with 3-year enterprise warranty.',
      suppliedProductIds: supplied1,
      suppliedItems: [
        {
          productId: supplied1[0] || null,
          productName: products[0]?.name || 'Walton Primo Commercial Interactive Display 75"',
          sku: 'WLT-CID-75X',
          category: 'Commercial Displays & Panels',
          price: 95000,
          supplyPrice: 82000,
          availability: 'In Stock',
          warranty: '3 Years Official OEM Replacement',
          imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
          description: 'Ultra-bright 4K UHD interactive touch panel designed for boardrooms and smart classrooms.',
        },
        {
          productId: supplied1[1] || null,
          productName: products[1]?.name || 'Walton Smart Pure Inverter Air Solution 3.0T',
          sku: 'WLT-AC-INV30',
          category: 'HVAC & Climate Systems',
          price: 112000,
          supplyPrice: 98000,
          availability: 'In Stock',
          warranty: '5 Years Compressor, 2 Years Parts',
          imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80',
          description: 'Industrial dual-inverter heavy duty cooling unit with IoT monitoring integration.',
        },
        {
          productId: supplied1[2] || null,
          productName: products[2]?.name || 'Walton Enterprise Server Rack Enclosure 42U',
          sku: 'WLT-SRK-42U',
          category: 'Data Center Infrastructure',
          price: 45000,
          supplyPrice: 38000,
          availability: 'Made to Order',
          warranty: '10 Years Structural Warranty',
          imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
          description: 'Cold-rolled steel heavy duty enterprise server cabinet with dual ventilation fans.',
        },
      ],
      procuredProductIds: procured1,
      procurementNote:
        'Procured 2,500+ commercial display panels and localized power backup units over 6 purchase cycles in FY 2024-2025.',
      procuredItems: [
        {
          productId: procured1[0] || null,
          productName: products[2]?.name || 'Walton Commercial Display Panel 55" 4K',
          quantity: 120,
          purchasePrice: 42000,
          totalAmount: 5040000,
          purchaseDate: '2024-08-14',
          invoiceNo: 'PO-WLT-2024-089',
          notes: 'Batch 1 corporate display procurement for branch rollout',
        },
        {
          productId: procured1[1] || null,
          productName: products[3]?.name || 'Industrial UPS & Power Inverter 3KVA',
          quantity: 45,
          purchasePrice: 28500,
          totalAmount: 1282500,
          purchaseDate: '2024-11-20',
          invoiceNo: 'PO-WLT-2024-156',
          notes: 'Heavy duty backup units for server rooms',
        },
        {
          productId: procured1[2] || null,
          productName: products[4]?.name || 'Smart Ergonomic Workstation Desk Pro',
          quantity: 80,
          purchasePrice: 16500,
          totalAmount: 1320000,
          purchaseDate: '2025-01-10',
          invoiceNo: 'PO-WLT-2025-012',
          notes: 'Ergonomic smart motorized desks for enterprise clients',
        },
      ],
      isActive: true,
      order: 0,
    },
    {
      name: 'Samsung Electronics Bangladesh',
      slug: 'samsung-electronics-bangladesh',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/1200px-Samsung_Logo.svg.png',
      websiteUrl: 'https://www.samsung.com/bd',
      industry: 'Information Technology & Semiconductors',
      tier: 'Authorized Tier-1 Partner',
      description:
        'Global technology pioneer providing world-class memory, solid-state storage, enterprise monitors, and digital signage solutions for enterprise workspaces.',
      mouDetails:
        'Strategic Distribution & Enterprise Procurement Agreement ensuring direct factory pricing on NVMe drives, commercial monitors, and server RAM with dedicated priority RMA support.',
      suppliedProductIds: supplied2,
      suppliedItems: [
        {
          productId: supplied2[0] || null,
          productName: products[3]?.name || 'Samsung 990 Pro 2TB PCIe Gen4 NVMe M.2 SSD',
          sku: 'MZ-V9P2T0B',
          category: 'Storage & Memory',
          price: 24500,
          supplyPrice: 19800,
          availability: 'In Stock',
          warranty: '5 Years Official Warranty',
          imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80',
          description: 'High-speed read up to 7,450 MB/s for workstations and AI edge computing servers.',
        },
        {
          productId: supplied2[1] || null,
          productName: products[4]?.name || 'Samsung Odyssey Neo G9 49" Curved Gaming Monitor',
          sku: 'LS49AG950NNXZA',
          category: 'Curved Enterprise Monitors',
          price: 185000,
          supplyPrice: 155000,
          availability: 'In Stock',
          warranty: '3 Years Comprehensive Warranty',
          imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
          description: 'Dual QHD 240Hz 1000R curved display for financial trading and executive desks.',
        },
        {
          productId: supplied2[2] || null,
          productName: products[5]?.name || 'Samsung Knox Managed Enterprise Galaxy Tab Active5',
          sku: 'SM-X306B',
          category: 'Rugged Enterprise Tablets',
          price: 58000,
          supplyPrice: 49500,
          availability: 'In Stock',
          warranty: '2 Years Enterprise Knox Support',
          imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80',
          description: 'MIL-STD-810H rated rugged tablet for warehouse inspection and field operations.',
        },
      ],
      procuredProductIds: procured2,
      procurementNote:
        'Direct procurement of 1,200+ enterprise SSDs, 400 curved monitors, and digital signage systems valued at approx. $180,000.',
      procuredItems: [
        {
          productId: procured2[0] || null,
          productName: products[1]?.name || 'Samsung 990 Pro 2TB NVMe PCIe 4.0 SSD',
          quantity: 350,
          purchasePrice: 18500,
          totalAmount: 6475000,
          purchaseDate: '2024-09-05',
          invoiceNo: 'PO-SAM-2024-411',
          notes: 'High endurance enterprise server cache storage',
        },
        {
          productId: procured2[1] || null,
          productName: products[2]?.name || 'Samsung ViewFinity S8 32" 4K UHD Monitor',
          quantity: 90,
          purchasePrice: 47000,
          totalAmount: 4230000,
          purchaseDate: '2024-12-18',
          invoiceNo: 'PO-SAM-2024-589',
          notes: 'Color accurate designer displays for corporate studio',
        },
      ],
      isActive: true,
      order: 1,
    },
    {
      name: 'Transcom Electronics Limited',
      slug: 'transcom-electronics-limited',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Transcom_Group_Logo.svg/1200px-Transcom_Group_Logo.svg.png',
      websiteUrl: 'https://transcomdigital.com',
      industry: 'Supply Chain & Consumer Technology',
      tier: 'Exclusive Distribution Partner',
      description:
        'One of the largest conglomerates in Bangladesh, leading nationwide distribution networks for consumer electronics, climate control systems, and commercial appliances.',
      mouDetails:
        'Supply chain synchronization MoU allowing Smart24 real-time warehouse inventory visibility, rapid cross-docking, and nationwide same-day corporate logistics fulfillment.',
      suppliedProductIds: supplied3,
      suppliedItems: [
        {
          productId: supplied3[0] || null,
          productName: products[5]?.name || 'Hitachi Commercial Multi-Split VRF System',
          sku: 'HTC-VRF-10HP',
          category: 'Commercial HVAC Solutions',
          price: 380000,
          supplyPrice: 325000,
          availability: 'In Stock',
          warranty: '5 Years Compressor, 3 Years Service',
          imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
          description: 'High COP Japanese inverter VRF system for enterprise office complexes.',
        },
        {
          productId: supplied3[1] || null,
          productName: products[6]?.name || 'Whirlpool Commercial Heavy-Duty Laundry System',
          sku: 'WHL-IND-15KG',
          category: 'Commercial Appliances',
          price: 145000,
          supplyPrice: 122000,
          availability: 'Made to Order',
          warranty: '3 Years Full Warranty',
          imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80',
          description: '15kg high extraction commercial laundry setup for hospitality clients.',
        },
      ],
      procuredProductIds: procured3,
      procurementNote:
        'Cross-docked procurement of 800+ commercial cooling systems, server room accessories, and smart logistics equipment.',
      procuredItems: [
        {
          productId: procured3[0] || null,
          productName: products[4]?.name || 'Commercial Precision Cooling Unit 2.5 Ton',
          quantity: 25,
          purchasePrice: 95000,
          totalAmount: 2375000,
          purchaseDate: '2024-10-12',
          invoiceNo: 'PO-TRN-2024-023',
          notes: 'Inverter climate control units for data centers',
        },
      ],
      isActive: true,
      order: 2,
    },
    {
      name: 'Hikvision Bangladesh',
      slug: 'hikvision-bangladesh',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Hikvision_logo.svg/1200px-Hikvision_logo.svg.png',
      websiteUrl: 'https://www.hikvision.com',
      industry: 'Security & Surveillance Systems',
      tier: 'Technology Integration Partner',
      description:
        'World-leading IoT solutions provider with video surveillance as its core competency. Partnered for integrated corporate access control and biometric systems.',
      mouDetails:
        'Enterprise Security Partnership MoU detailing OEM integration of biometric scanners, smart turnstiles, and AI-enabled IP security hardware for corporate offices.',
      suppliedProductIds: supplied1,
      suppliedItems: [
        {
          productId: supplied1[0] || null,
          productName: 'Hikvision DeepinView AI Bullet Camera 4K 8MP',
          sku: 'iDS-2CD7A86G0/P-IZHS',
          category: 'AI Video Surveillance',
          price: 36000,
          supplyPrice: 28500,
          availability: 'In Stock',
          warranty: '3 Years Replacement Warranty',
          imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80',
          description: 'Built-in deep learning algorithms for vehicle ANPR and perimeter protection.',
        },
        {
          productId: supplied1[1] || null,
          productName: 'Hikvision MinMoe Biometric Face Recognition Access Terminal',
          sku: 'DS-K1T673DX',
          category: 'Access Control & Biometrics',
          price: 42000,
          supplyPrice: 34000,
          availability: 'In Stock',
          warranty: '2 Years Official Warranty',
          imageUrl: 'https://images.unsplash.com/photo-1580983218765-f663bec07b37?auto=format&fit=crop&w=600&q=80',
          description: '7-inch touch screen with dual lens and temperature screening support.',
        },
      ],
      procuredProductIds: procured2,
      procurementNote:
        'Procured 600+ AI-powered access control terminals and NVR storage arrays deployed across client premises.',
      procuredItems: [
        {
          productId: procured2[0] || null,
          productName: products[1]?.name || 'Hikvision Face Recognition Terminal DS-K1T671',
          quantity: 60,
          purchasePrice: 32000,
          totalAmount: 1920000,
          purchaseDate: '2024-07-28',
          invoiceNo: 'PO-HIK-2024-102',
          notes: 'Touchless biometric attendance and door access systems',
        },
        {
          productId: procured2[1] || null,
          productName: products[2]?.name || 'Hikvision 32-Channel 4K NVR Storage Server',
          quantity: 15,
          purchasePrice: 68000,
          totalAmount: 1020000,
          purchaseDate: '2024-11-14',
          invoiceNo: 'PO-HIK-2024-219',
          notes: 'Centralized network video recording storage nodes',
        },
      ],
      isActive: true,
      order: 3,
    },
  ];

  for (const partner of partners) {
    const existing = await prisma.partner.findFirst({
      where: {
        OR: [{ name: partner.name }, { slug: partner.slug }],
      },
    });

    if (existing) {
      await prisma.partner.update({
        where: { id: existing.id },
        data: partner,
      });
      console.log(`Updated partner with supplied and procurement records: ${partner.name}`);
    } else {
      await prisma.partner.create({
        data: partner,
      });
      console.log(`Created partner: ${partner.name}`);
    }
  }

  console.log('Seeding completed successfully!');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Seeding error:', e);
  process.exit(1);
});
