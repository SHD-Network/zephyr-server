import { Test, TestingModule } from '@nestjs/testing';
import { DefconController } from './defcon.controller';
import { DefconService } from './defcon.service';

describe('DefconController', () => {
  let controller: DefconController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DefconController],
      providers: [DefconService],
    }).compile();

    controller = module.get<DefconController>(DefconController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
