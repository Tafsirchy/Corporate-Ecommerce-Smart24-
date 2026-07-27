import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { SupportTicketsService } from './support-tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, SupportTicketStatus } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';

@ApiTags('Support Tickets')
@Controller({ path: 'support-tickets', version: '1' })
export class SupportTicketsController {
  constructor(private readonly supportTicketsService: SupportTicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new support ticket' })
  createTicket(
    @Req() req: any,
    @Body() body: CreateSupportTicketDto
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
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: SupportTicketStatus })
  getAllTickets(
    @Req() req: any
  ) {
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const search = req.query.search as string;
    const status = req.query.status as SupportTicketStatus;
    return this.supportTicketsService.getAllTickets(page, limit, search, status);
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

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a ticket (Admin only)' })
  deleteTicket(@Param('id') id: string) {
    return this.supportTicketsService.deleteTicket(id);
  }
}
