import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('FAQs')
@Controller({ path: 'faqs', version: '1' })
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active FAQs (Public)' })
  getAllFaqs() {
    return this.faqsService.getAllFaqs();
  }

  @Get('admin/all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all FAQs (Admin only)' })
  getAllFaqsAdmin() {
    return this.faqsService.getAllFaqsAdmin();
  }

  @Post(':id/feedback')
  @ApiOperation({ summary: 'Submit feedback for an FAQ' })
  submitFeedback(
    @Param('id') id: string,
    @Body('isHelpful') isHelpful: boolean
  ) {
    return this.faqsService.submitFeedback(id, isHelpful);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new FAQ (Admin only)' })
  createFaq(
    @Body() body: { category: string; question: string; answer: string; isActive?: boolean; order?: number }
  ) {
    return this.faqsService.createFaq(body);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update an FAQ (Admin only)' })
  updateFaq(
    @Param('id') id: string,
    @Body() body: Partial<{ category: string; question: string; answer: string; isActive: boolean; order: number }>
  ) {
    return this.faqsService.updateFaq(id, body);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete an FAQ (Admin only)' })
  deleteFaq(@Param('id') id: string) {
    return this.faqsService.deleteFaq(id);
  }
}
