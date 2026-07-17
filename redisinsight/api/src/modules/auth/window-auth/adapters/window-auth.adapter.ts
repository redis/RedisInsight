import { INestApplication, Logger } from '@nestjs/common';
import { MessageMappingProperties } from '@nestjs/websockets';
import { get } from 'lodash';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { API_HEADER_WINDOW_ID } from 'src/common/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { SessionMetadataAdapter } from 'src/modules/auth/session-metadata/adapters/session-metadata.adapter';
import { WindowAuthService } from '../window-auth.service';

export class WindowsAuthAdapter extends SessionMetadataAdapter {
  private windowAuthService: WindowAuthService;

  private logger = new Logger('WindowsAuthAdapter');

  constructor(app: INestApplication) {
    super(app);
    this.windowAuthService = app.get(WindowAuthService);
  }

  async bindMessageHandlers(
    socket: Socket,
    handlers: MessageMappingProperties[],
    transform: (data: any) => Observable<any>,
  ) {
    const windowId =
      (get(socket, `handshake.headers.${API_HEADER_WINDOW_ID}`) as string) ||
      '';
    const isAuthorized = await this.windowAuthService?.isAuthorized(windowId);

    if (!isAuthorized) {
      this.logger.error(ERROR_MESSAGES.UNDEFINED_WINDOW_ID);
      return;
    }

    super.bindMessageHandlers(socket, handlers, transform);
  }
}
