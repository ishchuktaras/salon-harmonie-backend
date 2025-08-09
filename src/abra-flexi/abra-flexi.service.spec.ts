import { Test, TestingModule } from '@nestjs/testing';
import { AbraFlexiService } from './abra-flexi.service';

describe('AbraFlexiService', () => {
  let service: AbraFlexiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AbraFlexiService],
    }).compile();

    service = module.get<AbraFlexiService>(AbraFlexiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
