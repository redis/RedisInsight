/* eslint-disable no-param-reassign */
import { Injectable } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { MessageMappingProperties } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { DEFAULT_SESSION_ID, DEFAULT_USER_ID } from 'src/common/constants';
import { SessionMetadata } from 'src/common/models';
import { getUserRoom } from 'src/constants/websocket-rooms';

@Injectable()
export class SessionMetadataAdapter extends IoAdapter {
  async bindMessageHandlers(
    socket: Socket,
    handlers: MessageMappingProperties[],
    transform: (data: any) => Observable<any>,
  ) {
    const sessionMetadata: SessionMetadata = {
      userId: DEFAULT_USER_ID,
      sessionId: DEFAULT_SESSION_ID,
    };

    socket.data['sessionMetadata'] = sessionMetadata;

    // join room for the userId
    socket.join(getUserRoom(sessionMetadata.userId));

    super.bindMessageHandlers(socket, handlers, transform);
  }
}
