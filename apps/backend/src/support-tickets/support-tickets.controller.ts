import { Controller, Get, Post, Body, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { SupportTicketsService } from './support-tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, SupportTicketStatus } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Support Tickets')
@Controller({ path: 'support-tickets', version: '1' })
export class SupportTicketsController {
  constructor(private readonly supportTicketsService: SupportTicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new support ticket' })
  createTicket(
    @Req() req: any,
    @Body() body: { name: string; email: string; subject: string; message: string; orderId?: string; attachments?: string[] }
  ) {
    // req.user might be undefined if this endpoint is open to guests.
    // If you want guests to be able to contact support, we can extract userId safely.
    const userId = req.user?.id;
    return this.supportTicketsService.createTicket({ ...body, userId });
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all support tickets (Admin only)' })
  getAllTickets() {
    return this.supportTicketsService.getAllTickets();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get a specific ticket (Admin only)' })
  getTicketById(@Param('id') id: string) {
    return this.supportTicketsService.getTicketById(id);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update ticket status (Admin only)' })
  updateTicketStatus(
    @Param('id') id: string,
    @Body('status') status: SupportTicketStatus
  ) {
    return this.supportTicketsService.updateTicketStatus(id, status);
  }
}
