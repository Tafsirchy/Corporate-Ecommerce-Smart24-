import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CartRepositoryService } from '../repositories/cart.repository.service';
import { ProductRepository } from '../repositories/product.repository.service';

@Injectable()
export class CartService {
  constructor(
    private cartRepo: CartRepositoryService,
    private productRepo: ProductRepository
  ) {}

  async getCart(userId: string) {
    let cart = await this.cartRepo.getCartByUserId(userId);
    if (!cart) {
      await this.cartRepo.createCartForUser(userId);
      cart = await this.cartRepo.getCartByUserId(userId);
    }
    return cart!;
  }

  async updateItem(userId: string, productId: string, quantity: number) {
    const product = await this.productRepo.findById(productId);
    if (!product) throw new NotFoundException('Product not found');
    
    // Check stock
    if (quantity > product.stock) {
      throw new BadRequestException(`Only ${product.stock} items left in stock`);
    }

    const cart = await this.getCart(userId);
    
    if (quantity <= 0) {
      return this.cartRepo.removeCartItem(cart.id, productId);
    }
    
    return this.cartRepo.upsertCartItem(cart.id, productId, quantity);
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.getCart(userId);
    return this.cartRepo.removeCartItem(cart.id, productId);
  }

  async mergeCart(userId: string, items: { productId: string; quantity: number }[]) {
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
    
    return this.getCart(userId);
  }
}
