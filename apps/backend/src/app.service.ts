import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return { status: 'ok', service: 'Corporate E-Commerce API', timestamp: new Date().toISOString() };
  }
}
