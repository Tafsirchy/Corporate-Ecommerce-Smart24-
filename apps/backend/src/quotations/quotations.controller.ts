import { Controller, Post, Get, Body, Req, UseGuards, Patch, Param } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Quotations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'quotations', version: '1' })
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  createQuotation(@Req() req: any, @Body() body: any) {
    return this.quotationsService.createQuotation(req.user.userId, body);
  }

  @Get('my-quotes')
  getMyQuotations(@Req() req: any) {
    return this.quotationsService.getMyQuotations(req.user.userId);
  }

  @Get('admin/all')
  @Roles(Role.ADMIN)
  getAllQuotations() {
    return this.quotationsService.getAllQuotations();
  }

  @Patch('admin/:id/respond')
  @Roles(Role.ADMIN)
  respondToQuotation(
    @Param('id') id: string,
    @Body('offeredPrice') offeredPrice: number,
    @Body('adminNotes') adminNotes?: string
  ) {
    return this.quotationsService.respondToQuotation(id, offeredPrice, adminNotes);
  }

  @Patch(':id/accept')
  acceptQuotation(@Param('id') id: string, @Req() req: any) {
    return this.quotationsService.acceptQuotation(id, req.user.userId);
  }

  @Patch(':id/reject')
  rejectQuotation(@Param('id') id: string, @Req() req: any) {
    return this.quotationsService.rejectQuotation(id, req.user.userId);
  }
}
