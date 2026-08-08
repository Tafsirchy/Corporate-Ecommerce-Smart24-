import { Test, TestingModule } from '@nestjs/testing';
import { HeroContentController } from './hero-content.controller';

describe('HeroContentController', () => {
  let controller: HeroContentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HeroContentController],
    })
      .useMocker(() => ({}))
      .compile();

    controller = module.get<HeroContentController>(HeroContentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
