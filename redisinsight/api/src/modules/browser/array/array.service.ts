import { Injectable } from '@nestjs/common';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';

@Injectable()
export class ArrayService {
  constructor(private databaseClientFactory: DatabaseClientFactory) {}
}
