import { Test, TestingModule } from '@nestjs/testing';
import { ClassActivityController } from './class-activity.controller';

describe('ClassActivityController', () => {
  let controller: ClassActivityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassActivityController],
    }).compile();

    controller = module.get<ClassActivityController>(ClassActivityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
