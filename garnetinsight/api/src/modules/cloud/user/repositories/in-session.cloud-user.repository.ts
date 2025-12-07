import { Injectable } from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { CloudUserRepository } from 'src/modules/cloud/user/repositories/cloud-user.repository';
import { CloudUser } from 'src/modules/cloud/user/models';
import { CloudSessionService } from 'src/modules/cloud/session/cloud-session.service';
import { TransformGroup } from 'src/common/constants';

@Injectable()
export class InSessionCloudUserRepository extends CloudUserRepository {
  constructor(private readonly sessionService: CloudSessionService) {
    super();
  }

  /**
   * Get user model from current session
   * @param sessionId
   */
  async get(sessionId: string): Promise<CloudUser> {
    const session = await this.sessionService.getSession(sessionId);

    return (
      plainToInstance(CloudUser, session?.user, {
        groups: [TransformGroup.Secure],
      }) || null
    );
  }

  /**
   * Update user data in session
   * @param sessionId
   * @param data
   */
  async update(
    sessionId: string,
    data: Partial<CloudUser>,
  ): Promise<CloudUser> {
    const user = await this.get(sessionId);
    await this.sessionService.updateSessionData(sessionId, {
      user: plainToInstance(
        CloudUser,
        {
          ...instanceToPlain(user, { groups: [TransformGroup.Secure] }),
          ...instanceToPlain(data, { groups: [TransformGroup.Secure] }),
        },
        { groups: [TransformGroup.Secure] },
      ),
    });

    return this.get(sessionId);
  }
}
