import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MembershipsService {
  private readonly logger = new Logger(MembershipsService.name);

  constructor(private prisma: PrismaService) {}

  async evaluateUserMembership(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { membership: true },
    });

    if (!user) return null;

    // Get all membership levels ordered by requiredAmount DESC
    const levels = await this.prisma.membershipLevel.findMany({
      orderBy: { requiredAmount: 'desc' },
    });

    // Find the highest level the user qualifies for
    const qualifiedLevel = levels.find(
      (l) => user.lifetimeSpent >= l.requiredAmount,
    );

    if (qualifiedLevel) {
      // Check if upgrade is needed
      if (
        !user.membershipId ||
        (user.membership && qualifiedLevel.priority > user.membership.priority)
      ) {
        this.logger.log(
          `Upgrading user ${userId} to membership ${qualifiedLevel.name}`,
        );

        await this.prisma.user.update({
          where: { id: userId },
          data: { membershipId: qualifiedLevel.id },
        });

        // Send Notification
        await this.prisma.notification.create({
          data: {
            userId: userId,
            title: 'Membership Upgraded! 🎉',
            message: `Congratulations! You have been upgraded to the ${qualifiedLevel.name} tier.`,
            type: 'MEMBERSHIP_UPGRADE',
          },
        });

        return qualifiedLevel;
      }
    }
    return user.membership;
  }

  // Admin Methods
  async getAllLevels() {
    return this.prisma.membershipLevel.findMany({
      orderBy: { priority: 'asc' },
    });
  }

  async createLevel(data: any) {
    return this.prisma.membershipLevel.create({ data });
  }

  async updateLevel(id: string, data: any) {
    return this.prisma.membershipLevel.update({ where: { id }, data });
  }

  async deleteLevel(id: string) {
    return this.prisma.membershipLevel.delete({ where: { id } });
  }
}
