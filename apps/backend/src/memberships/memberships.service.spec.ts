import { Test, TestingModule } from '@nestjs/testing';
import { MembershipsService } from './memberships.service';

describe('MembershipsService', () => {
  let service: MembershipsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MembershipsService],
    })
      .useMocker(() => ({}))
      .compile();

    service = module.get<MembershipsService>(MembershipsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
