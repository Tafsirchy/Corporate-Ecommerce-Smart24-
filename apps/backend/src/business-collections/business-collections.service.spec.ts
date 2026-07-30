import { Test, TestingModule } from '@nestjs/testing';
import { BusinessCollectionsService } from './business-collections.service';

describe('BusinessCollectionsService', () => {
  let service: BusinessCollectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusinessCollectionsService],
    }).compile();

    service = module.get<BusinessCollectionsService>(BusinessCollectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
