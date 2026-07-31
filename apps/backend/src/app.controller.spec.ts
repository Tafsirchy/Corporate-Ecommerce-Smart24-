import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    })
      .useMocker(() => ({}))
      .compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return health check object', () => {
      const response = appController.getHello();
      expect(response).toHaveProperty('service', 'Business E-Commerce API');
      expect(response).toHaveProperty('status', 'ok');
    });
  });
});
