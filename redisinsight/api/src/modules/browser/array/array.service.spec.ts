import { Test, TestingModule } from '@nestjs/testing';
import { mockDatabaseClientFactory } from 'src/__mocks__';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { ArrayService } from 'src/modules/browser/array/array.service';

describe('ArrayService', () => {
  let service: ArrayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArrayService,
        {
          provide: DatabaseClientFactory,
          useFactory: mockDatabaseClientFactory,
        },
      ],
    }).compile();

    service = module.get(ArrayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
