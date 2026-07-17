import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Post('contact')
  async submitContact(@Body() body: { name: string; email: string; company?: string; message: string }) {
    return this.appService.submitContact(body);
  }
}
