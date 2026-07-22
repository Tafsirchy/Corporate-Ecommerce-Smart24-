import { Injectable, NotFoundException } from '@nestjs/common';
import { WishlistRepositoryService } from '../repositories/wishlist.repository.service';
import { ProductRepository } from '../repositories/product.repository.service';

@Injectable()
export class WishlistService {
  constructor(
    private wishlistRepo: WishlistRepositoryService,
    private productRepo: ProductRepository
  ) {}

  async getWishlist(userId: string) {
    let wishlist = await this.wishlistRepo.getWishlistByUserId(userId);
    if (!wishlist) {
      await this.wishlistRepo.createWishlistForUser(userId);
      wishlist = await this.wishlistRepo.getWishlistByUserId(userId);
    }
    return wishlist!;
  }

  async addItem(userId: string, productId: string) {
    const product = await this.productRepo.findById(productId);
    if (!product) throw new NotFoundException('Product not found');
    
    const wishlist = await this.getWishlist(userId);
    await this.wishlistRepo.addWishlistItem(wishlist.id, productId);
    return this.getWishlist(userId);
  }

  async removeItem(userId: string, productId: string) {
    const wishlist = await this.getWishlist(userId);
    await this.wishlistRepo.removeWishlistItem(wishlist.id, productId);
    return this.getWishlist(userId);
  }

  async mergeWishlist(userId: string, productIds: string[]) {
    const wishlist = await this.getWishlist(userId);
    
    for (const productId of productIds) {
      const product = await this.productRepo.findById(productId);
      if (product) {
        await this.wishlistRepo.addWishlistItem(wishlist.id, productId);
      }
    }
    
    return this.getWishlist(userId);
  }
}
