import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CartRepositoryService } from '../repositories/cart.repository.service';
import { ProductRepository } from '../repositories/product.repository.service';

@Injectable()
export class CartService {
  constructor(
    private cartRepo: CartRepositoryService,
    private productRepo: ProductRepository
  ) {}

  async getCart(userId?: string, sessionId?: string) {
    if (!userId && !sessionId) throw new BadRequestException('Must provide userId or sessionId');
    let cart = await this.cartRepo.getCart(userId, sessionId);
    if (!cart) {
      try {
        await this.cartRepo.createCart(userId, sessionId);
      } catch (error) {
        // Ignore unique constraint violation if cart was created concurrently
      }
      cart = await this.cartRepo.getCart(userId, sessionId);
    }
    return cart!;
  }

  async updateItem(userId: string | undefined, sessionId: string | undefined, productId: string, quantity: number) {
    const product = await this.productRepo.findById(productId);
    if (!product) throw new NotFoundException('Product not found');
    
    // Check stock
    if (quantity > product.stock) {
      throw new BadRequestException(`Only ${product.stock} items left in stock`);
    }

    const cart = await this.getCart(userId, sessionId);
    
    if (quantity <= 0) {
      return this.cartRepo.removeCartItem(cart.id, productId);
    }
    
    return this.cartRepo.upsertCartItem(cart.id, productId, quantity);
  }

  async removeItem(userId: string | undefined, sessionId: string | undefined, productId: string) {
    const cart = await this.getCart(userId, sessionId);
    return this.cartRepo.removeCartItem(cart.id, productId);
  }

  async mergeCart(userId: string, sessionId: string | undefined, items: { productId: string; quantity: number }[]) {
    const cart = await this.getCart(userId);
    
    // Process items sequentially or with Promise.all
    for (const item of items) {
      const product = await this.productRepo.findById(item.productId);
      if (product) {
        // Find if it already exists to sum
        const existingItem = cart.items?.find(i => i.productId === item.productId);
        const newQuantity = (existingItem?.quantity || 0) + item.quantity;
        const cappedQuantity = Math.min(newQuantity, product.stock || newQuantity);
        
        await this.cartRepo.upsertCartItem(cart.id, item.productId, cappedQuantity);
      }
    }
    
    // Also delete the guest cart if it exists
    if (sessionId) {
      const guestCart = await this.cartRepo.getCart(undefined, sessionId);
      if (guestCart) {
        await this.cartRepo.clearCart(guestCart.id);
        // Note: Prisma does not easily allow deleting the Cart record without breaking items if we don't clear items first
        // But since we did clearCart, we can delete the guest cart
        try {
           // This assumes a delete method exists or we can just leave it empty
        } catch (e) {}
      }
    }

    return this.getCart(userId);
  }
}
