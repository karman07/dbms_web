import { Test, TestingModule } from '@nestjs/testing';
import { ClassActivityService } from './class-activity.service';

describe('ClassActivityService', () => {
  let service: ClassActivityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClassActivityService],
    }).compile();

    service = module.get<ClassActivityService>(ClassActivityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
