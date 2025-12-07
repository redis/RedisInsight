import { Injectable } from '@nestjs/common';
import { SessionService } from 'src/modules/session/session.service';
import { CloudSession } from 'src/modules/cloud/session/models/cloud-session';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { TransformGroup } from 'src/common/constants';
import { CloudSessionRepository } from './repositories/cloud.session.repository';

@Injectable()
export class CloudSessionService {
  constructor(
    private readonly sessionService: SessionService,
    private readonly cloudSessionRepository: CloudSessionRepository,
  ) {}

  async getSession(id: string): Promise<CloudSession> {
    const session = await this.sessionService.getSession(id);
    const cloud = session?.data?.cloud;
    if (!cloud?.refreshToken) {
      try {
        const cloudSessionData = await this.cloudSessionRepository.get();
        if (cloudSessionData?.data) {
          const { data } = cloudSessionData;

          return {
            ...cloud,
            refreshToken: data.refreshToken,
            idpType: data.idpType,
          };
        }
      } catch (e) {
        // ignore
      }
    }
    return cloud || null;
  }

  async updateSessionData(id: string, cloud: any): Promise<CloudSession> {
    const session = await this.getSession(id);

    const cloudSession =
      (
        await this.sessionService.updateSessionData(id, {
          cloud: plainToInstance(
            CloudSession,
            {
              ...instanceToPlain(session, { groups: [TransformGroup.Secure] }),
              ...instanceToPlain(cloud, { groups: [TransformGroup.Secure] }),
            },
            { groups: [TransformGroup.Secure] },
          ),
        })
      )?.data?.cloud || null;

    if (cloudSession && cloud?.refreshToken && cloud?.idpType) {
      try {
        this.cloudSessionRepository.save({
          data: {
            refreshToken: cloud.refreshToken,
            idpType: cloud.idpType,
          },
        });
      } catch (e) {
        // ignore
      }
    }

    return cloudSession;
  }

  async deleteSessionData(id: string): Promise<void> {
    await this.sessionService.updateSessionData(id, { cloud: null });

    try {
      await this.cloudSessionRepository.save({ data: null });
    } catch (e) {
      // ignore
    }
  }

  async invalidateApiSession(id: string): Promise<void> {
    await this.updateSessionData(id, {
      csrf: null,
      apiSessionId: null,
      user: null,
    });
  }
}
