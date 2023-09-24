import { Test, TestingModule } from '@nestjs/testing';
import { DefconService } from './defcon.service';

describe('DefconService', () => {
  let service: DefconService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DefconService],
    }).compile();

    service = module.get<DefconService>(DefconService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
