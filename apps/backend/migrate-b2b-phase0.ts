import { PrismaClient, Role, BusinessType, VerificationStatus, VerificationLevel, MembershipTier } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  console.log('Starting migration for Phase 0 B2B Ecosystem...');
  
  const businessUsers = await prisma.user.findMany({
    where: { role: Role.BUSINESS },
    include: { addresses: true }
  });

  console.log(`Found ${businessUsers.length} users with BUSINESS role.`);
  let count = 0;

  for (const user of businessUsers) {
    try {
      // Determine placeholder address
      let defaultAddress = 'Address Pending';
      if (user.addresses && user.addresses.length > 0) {
        defaultAddress = user.addresses[0].address;
      }

      await prisma.$transaction(async (tx) => {
        // 1. Update user role to BUSINESS
        await tx.user.update({
          where: { id: user.id },
          data: { role: Role.BUSINESS }
        });

        // 2. Create BusinessProfile
        const existingProfile = await tx.businessProfile.findUnique({
          where: { userId: user.id }
        });

        if (!existingProfile) {
          await tx.businessProfile.create({
            data: {
              userId: user.id,
              businessName: user.name + ' Business',
              businessType: BusinessType.REGISTERED_COMPANY,
              ownerName: user.name,
              address: defaultAddress,
              verificationStatus: VerificationStatus.PENDING,
              verificationLevel: VerificationLevel.BASIC,
              membershipTier: MembershipTier.BRONZE,
            }
          });
        }
      });
      count++;
      console.log(`Migrated user ${user.id} (${user.email})`);
    } catch (error) {
      console.error(`Failed to migrate user ${user.id}:`, error);
    }
  }

  console.log(`Migration completed. Successfully updated ${count} users.`);
}

migrate()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
