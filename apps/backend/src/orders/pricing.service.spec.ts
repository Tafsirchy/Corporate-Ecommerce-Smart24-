import { Test, TestingModule } from '@nestjs/testing';
import { PricingService } from './pricing.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { BadRequestException } from '@nestjs/common';

describe('PricingService', () => {
  let service: PricingService;
  let prisma: any;
  let loyaltyService: any;

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn() },
      coupon: { findUnique: jest.fn() },
      userReward: { findUnique: jest.fn() },
      pricingRule: { findMany: jest.fn().mockResolvedValue([]) },
    };

    loyaltyService = {
      calculateRewardPoints: jest.fn().mockResolvedValue(100),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        { provide: PrismaService, useValue: prisma },
        { provide: LoyaltyService, useValue: loyaltyService },
      ],
    }).compile();

    service = module.get<PricingService>(PricingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateCartTotals', () => {
    it('should calculate basic cart total without discounts', async () => {
      const cartItems = [
        {
          productId: '1',
          quantity: 2,
          product: { name: 'A', price: 100, stock: 10 },
        },
      ];
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.calculateCartTotals(undefined, cartItems);

      expect(result.totalAmount).toBe(200);
      expect(result.deliveryCharge).toBe(100);
      expect(result.orderItems.length).toBe(1);
      expect(result.orderItems[0].priceAtPurchase).toBe(100);
    });

    it('should apply CORPORATE tier discount of 15%', async () => {
      const cartItems = [
        {
          productId: '1',
          quantity: 1,
          product: { name: 'B', price: 1000, stock: 10 },
        },
      ];
      prisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        role: 'BUSINESS',
        businessProfile: { membershipTier: 'PLATINUM', businessType: 'RETAIL' },
      });

      const result = await service.calculateCartTotals('user1', cartItems);

      // PLATINUM discount is 15%. 15% of 1000 is 150.
      // So discounted price is 850.
      expect(result.totalAmount).toBe(850);
      expect(result.deliveryCharge).toBe(100);
    });
  });

  describe('validatePromo', () => {
    it('should reject if coupon is inactive', async () => {
      prisma.coupon.findUnique.mockResolvedValue({ isActive: false });

      await expect(
        service.validatePromo('user1', 'CODE', 1000),
      ).rejects.toThrow('Coupon is inactive');
    });

    it('should apply valid PERCENTAGE coupon', async () => {
      prisma.coupon.findUnique.mockResolvedValue({
        id: 'coupon1',
        isActive: true,
        code: 'SAVE20',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        maxDiscount: 50, // 20% of 1000 is 200, but max is 50
        minOrderAmount: 100,
        validUntil: new Date(Date.now() + 10000),
        usageLimit: null,
      });

      const result = await service.validatePromo('user1', 'SAVE20', 1000);

      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(50);
      expect(result.type).toBe('COUPON');
    });
  });
});
