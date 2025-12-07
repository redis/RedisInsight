import { Injectable } from '@nestjs/common';
import { CloudUser } from 'src/modules/cloud/user/models';

@Injectable()
export abstract class CloudUserRepository {
  abstract get(userId: string): Promise<CloudUser>;
  abstract update(userId: string, data: Partial<CloudUser>): Promise<CloudUser>;
}
