import { Test, TestingModule } from '@nestjs/testing';
import { HeroContentService } from './hero-content.service';

describe('HeroContentService', () => {
  let service: HeroContentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HeroContentService],
    }).compile();

    service = module.get<HeroContentService>(HeroContentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
