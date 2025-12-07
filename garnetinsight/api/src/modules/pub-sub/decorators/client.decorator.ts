import { get } from 'lodash';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserClient } from 'src/modules/pub-sub/model/user-client';

export const Client = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserClient => {
    const socket = ctx.switchToWs().getClient();

    return new UserClient(
      socket.id,
      socket,
      get(socket, 'handshake.query.instanceId'),
    );
  },
);
