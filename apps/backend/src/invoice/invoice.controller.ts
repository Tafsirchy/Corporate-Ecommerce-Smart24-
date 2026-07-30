import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Res } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Controller('invoice')
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly prisma: PrismaService
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUSINESS)
  @Get('my-invoices')
  async getMyInvoices(@Req() req: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      include: { businessProfile: true }
    });
    if (!user || !user.businessProfile) {
      return [];
    }
    return this.invoiceService.findAllByBusiness(user.businessProfile.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUSINESS)
  @Get('my-invoices/:id')
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/all')
  findAll() {
    return this.invoiceService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/:id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.invoiceService.updateStatus(id, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUSINESS, Role.ADMIN)
  @Get(':id/export')
  async exportPdf(@Param('id') id: string, @Req() req: any, @Res() res: any) {
    // Check if BUSINESS user is authorized to view this invoice
    if (req.user.role === 'BUSINESS') {
      const user = await this.prisma.user.findUnique({
        where: { id: req.user.id },
        include: { businessProfile: true }
      });
      const invoice = await this.invoiceService.findOne(id);
      if (invoice.businessId !== user?.businessProfile?.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    const pdfBuffer = await this.invoiceService.exportMushakPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="mushak-6.3-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }
}
