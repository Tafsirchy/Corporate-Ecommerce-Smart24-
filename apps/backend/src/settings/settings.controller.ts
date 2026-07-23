import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Settings')
@Controller({ path: 'settings', version: '1' })
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get(':key')
  @ApiOperation({ summary: 'Get a specific setting by key' })
  getSetting(@Param('key') key: string) {
    return this.settingsService.getSetting(key);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all settings (Admin only)' })
  getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  @Post(':key')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create or update a setting (Admin only)' })
  setSetting(@Param('key') key: string, @Body('value') value: string) {
    return this.settingsService.setSetting(key, value);
  }
}
