import { Test, TestingModule } from '@nestjs/testing';
import { CorporateCollectionsController } from './corporate-collections.controller';

describe('CorporateCollectionsController', () => {
  let controller: CorporateCollectionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CorporateCollectionsController],
    }).compile();

    controller = module.get<CorporateCollectionsController>(CorporateCollectionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
