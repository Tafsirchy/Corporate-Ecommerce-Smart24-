import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  async findAllByBusiness(businessProfileId: string) {
    return this.prisma.businessInvoice.findMany({
      where: { businessId: businessProfileId },
      include: {
        order: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.businessInvoice.findUnique({
      where: { id },
      include: { order: true }
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async updateStatus(id: string, status: any) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.businessInvoice.findUnique({
        where: { id }
      });
      if (!invoice) throw new NotFoundException('Invoice not found');

      const updated = await tx.businessInvoice.update({
        where: { id },
        data: { status }
      });

      // If the invoice is being marked as PAID and it wasn't PAID before
      if (status === 'PAID' && invoice.status !== 'PAID') {
        await tx.businessProfile.update({
          where: { id: invoice.businessId },
          data: {
            usedCredit: { decrement: invoice.totalAmount }
          }
        });
      }

      return updated;
    });
  }

  // Admin endpoint
  async findAll() {
    return this.prisma.businessInvoice.findMany({
      include: {
        businessProfile: true,
        order: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async exportMushakPdf(id: string): Promise<Buffer> {
    const PDFDocument = require('pdfkit');

    const invoice = await this.prisma.businessInvoice.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: {
              include: { product: true }
            }
          }
        },
        businessProfile: true
      }
    });

    if (!invoice) throw new NotFoundException('Invoice not found');

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];
        doc.on('data', (buffer) => buffers.push(buffer));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // NBR Mushak 6.3 Header
        doc.fontSize(20).text('GOVERNMENT OF THE PEOPLE\'S REPUBLIC OF BANGLADESH', { align: 'center' });
        doc.fontSize(14).text('NATIONAL BOARD OF REVENUE', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text('TAX INVOICE (Mushak 6.3)', { align: 'center', underline: true });
        doc.moveDown();

        // Business Info
        doc.fontSize(12).text(`Business Name: ${invoice.businessProfile.businessName}`);
        doc.text(`BIN / VAT Reg No: ${invoice.businessProfile.bin || 'N/A'}`);
        doc.text(`TIN: ${invoice.businessProfile.tin || 'N/A'}`);
        doc.text(`Invoice ID: ${invoice.id}`);
        doc.text(`Order ID: ${invoice.orderId}`);
        doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
        doc.text(`Status: ${invoice.status}`);
        doc.moveDown();

        // Items Table Header
        const tableTop = doc.y;
        doc.font('Helvetica-Bold');
        doc.text('Item', 50, tableTop);
        doc.text('Qty', 250, tableTop);
        doc.text('Unit Price', 300, tableTop);
        doc.text('Total', 400, tableTop);
        
        doc.moveTo(50, tableTop + 15).lineTo(500, tableTop + 15).stroke();
        doc.font('Helvetica');

        // Items
        let y = tableTop + 25;
        invoice.order.items.forEach((item) => {
          doc.text(item.product.name.substring(0, 30), 50, y);
          doc.text(item.quantity.toString(), 250, y);
          doc.text(item.priceAtPurchase.toString(), 300, y);
          doc.text((item.quantity * item.priceAtPurchase).toString(), 400, y);
          y += 20;
        });

        doc.moveTo(50, y).lineTo(500, y).stroke();
        y += 10;

        // Totals
        doc.font('Helvetica-Bold');
        doc.text('Subtotal:', 300, y);
        doc.text((invoice.order.totalAmount - invoice.order.deliveryCharge).toString(), 400, y);
        y += 20;
        doc.text('Delivery Charge:', 300, y);
        doc.text(invoice.order.deliveryCharge.toString(), 400, y);
        y += 20;
        doc.text('VAT (Included):', 300, y);
        doc.text(invoice.vatAmount.toString(), 400, y);
        y += 20;
        doc.text('Grand Total:', 300, y);
        doc.text(invoice.order.totalAmount.toString(), 400, y);

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
