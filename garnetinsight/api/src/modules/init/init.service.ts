import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export abstract class InitService implements OnModuleInit {
  abstract onModuleInit(): Promise<void>;
}
