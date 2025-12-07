import { ConflictException, NotFoundException } from '@nestjs/common';
import { RedisString } from 'src/common/constants';
import { RedisClient } from 'src/modules/redis/client';
import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
import ERROR_MESSAGES from 'src/constants/error-messages';

export const checkIfKeyNotExists = async (
  keyName: RedisString,
  client: RedisClient,
): Promise<void> => {
  const isExist = await client.sendCommand([
    BrowserToolKeysCommands.Exists,
    keyName,
  ]);
  if (!isExist) {
    throw new NotFoundException(ERROR_MESSAGES.KEY_NOT_EXIST);
  }
};

export const checkIfKeyExists = async (
  keyName: RedisString,
  client: RedisClient,
): Promise<void> => {
  const isExist = await client.sendCommand([
    BrowserToolKeysCommands.Exists,
    keyName,
  ]);
  if (isExist) {
    throw new ConflictException(ERROR_MESSAGES.KEY_NAME_EXIST);
  }
};
