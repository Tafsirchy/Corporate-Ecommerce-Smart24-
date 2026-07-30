import { Test, TestingModule } from '@nestjs/testing';
import { BusinessCollectionsController } from './business-collections.controller';

describe('BusinessCollectionsController', () => {
  let controller: BusinessCollectionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessCollectionsController],
    }).compile();

    controller = module.get<BusinessCollectionsController>(BusinessCollectionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
