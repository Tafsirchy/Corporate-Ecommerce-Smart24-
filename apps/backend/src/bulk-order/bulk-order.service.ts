import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BulkOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async validateCsv(csvContent: string) {
    const lines = csvContent
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length < 2) {
      throw new BadRequestException(
        'CSV must contain a header and at least one row',
      );
    }

    const validItems: any[] = [];
    const invalidItems: any[] = [];
    const parsedRows: { rowNum: number; sku: string; quantity: number }[] = [];
    const skusToFetch: string[] = [];

    // Assuming first line is header: SKU,Quantity
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map((cell) => cell.trim());
      if (row.length < 2) {
        invalidItems.push({
          row: i + 1,
          sku: lines[i],
          reason: 'Invalid format (needs SKU,Quantity)',
        });
        continue;
      }

      const [sku, qtyStr] = row;
      const quantity = parseInt(qtyStr, 10);

      if (!sku || isNaN(quantity) || quantity <= 0) {
        invalidItems.push({
          row: i + 1,
          sku,
          reason: 'Invalid SKU or Quantity',
        });
        continue;
      }

      parsedRows.push({ rowNum: i + 1, sku, quantity });
      skusToFetch.push(sku);
    }

    // Batch query products
    const productMap = new Map<string, any>();
    if (skusToFetch.length > 0) {
      // Find products by sku. If sku is missing on old records, fallback to slug temporarily
      const products = await this.prisma.product.findMany({
        where: {
          OR: [
            { sku: { in: skusToFetch } },
            { slug: { in: skusToFetch } }, // Fallback for backwards compatibility
          ],
        },
      });
      for (const p of products) {
        productMap.set(p.sku || p.slug, p);
      }
    }

    for (const row of parsedRows) {
      const product = productMap.get(row.sku);
      if (product) {
        if (product.stock >= row.quantity) {
          validItems.push({
            productId: product.id,
            sku: product.sku || product.slug,
            name: product.name,
            quantity: row.quantity,
            price: product.price,
          });
        } else {
          invalidItems.push({
            row: row.rowNum,
            sku: row.sku,
            reason: `Insufficient stock. Available: ${product.stock}`,
          });
        }
      } else {
        invalidItems.push({
          row: row.rowNum,
          sku: row.sku,
          reason: 'SKU not found',
        });
      }
    }

    return { validItems, invalidItems };
  }
}
