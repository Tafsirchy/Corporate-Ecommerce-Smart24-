import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  create(@Req() req: any, @Body() data: any) {
    return this.addressesService.create(
      req.user?.id || req.user?.userId || req.user?.sub,
      data,
    );
  }

  @Get()
  findAll(@Req() req: any) {
    return this.addressesService.findByUserId(
      req.user?.id || req.user?.userId || req.user?.sub,
    );
  }

  @Put(':id')
  update(@Param('id') id: string, @Req() req: any, @Body() data: any) {
    return this.addressesService.update(
      id,
      req.user?.id || req.user?.userId || req.user?.sub,
      data,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.addressesService.delete(
      id,
      req.user?.id || req.user?.userId || req.user?.sub,
    );
  }

  @Patch(':id/default-shipping')
  setDefaultShipping(@Param('id') id: string, @Req() req: any) {
    return this.addressesService.setDefaultShipping(
      id,
      req.user?.id || req.user?.userId || req.user?.sub,
    );
  }

  @Patch(':id/default-billing')
  setDefaultBilling(@Param('id') id: string, @Req() req: any) {
    return this.addressesService.setDefaultBilling(
      id,
      req.user?.id || req.user?.userId || req.user?.sub,
    );
  }
}
