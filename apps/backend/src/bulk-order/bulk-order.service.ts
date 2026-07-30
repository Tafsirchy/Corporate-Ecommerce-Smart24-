import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BulkOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async validateCsv(csvContent: string) {
    const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length < 2) {
      throw new BadRequestException('CSV must contain a header and at least one row');
    }

    const validItems = [];
    const invalidItems = [];

    // Assuming first line is header: SKU,Quantity
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(cell => cell.trim());
      if (row.length < 2) {
        invalidItems.push({ row: i + 1, sku: lines[i], reason: 'Invalid format (needs SKU,Quantity)' });
        continue;
      }

      const [sku, qtyStr] = row;
      const quantity = parseInt(qtyStr, 10);
      
      if (!sku || isNaN(quantity) || quantity <= 0) {
        invalidItems.push({ row: i + 1, sku, reason: 'Invalid SKU or Quantity' });
        continue;
      }

      // Check if product exists with this SKU
      const product = await this.prisma.product.findUnique({
        where: { sku }
      });

      if (product) {
        if (product.stockQuantity >= quantity) {
          validItems.push({ 
            productId: product.id, 
            sku: product.sku,
            name: product.name,
            quantity, 
            price: product.price 
          });
        } else {
          invalidItems.push({ row: i + 1, sku, reason: `Insufficient stock. Available: ${product.stockQuantity}` });
        }
      } else {
        invalidItems.push({ row: i + 1, sku, reason: 'SKU not found' });
      }
    }

    return { validItems, invalidItems };
  }
}
