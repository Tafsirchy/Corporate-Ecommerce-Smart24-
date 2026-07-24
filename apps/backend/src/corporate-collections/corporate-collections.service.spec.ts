import { Test, TestingModule } from '@nestjs/testing';
import { CorporateCollectionsService } from './corporate-collections.service';

describe('CorporateCollectionsService', () => {
  let service: CorporateCollectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorporateCollectionsService],
    }).compile();

    service = module.get<CorporateCollectionsService>(CorporateCollectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
