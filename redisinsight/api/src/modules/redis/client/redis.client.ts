import { ClientContext, ClientMetadata } from 'src/common/models';
import { isNumber } from 'lodash';
import { RedisString, UNKNOWN_REDIS_INFO } from 'src/common/constants';
import apiConfig from 'src/utils/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { convertRedisInfoReplyToObject } from 'src/utils';
import { convertArrayReplyToObject } from '../utils';
import * as semverCompare from 'node-version-compare';
import { RedisDatabaseHelloResponse } from 'src/modules/database/dto/redis-info.dto';
import { plainToClass } from 'class-transformer';

const REDIS_CLIENTS_CONFIG = apiConfig.get('redis_clients');

export enum RedisClientConnectionType {
  STANDALONE = 'STANDALONE',
  CLUSTER = 'CLUSTER',
  SENTINEL = 'SENTINEL',
}

export enum RedisClientNodeRole {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
}

export interface IRedisClientCommandOptions {
  firstKey?: RedisString;
  readOnly?: boolean;
  replyEncoding?: 'utf8' | null;
  unknownCommands?: boolean;
}

export interface IRedisClientOptions {
  host?: string;
  port?: number;
  natHost?: string;
  natPort?: number;
  tlsPort?: number;
  connectTimeout?: number;
}

export type RedisClientCommandArgument = RedisString | number;
export type RedisClientCommandArguments = RedisClientCommandArgument[];
export type RedisClientCommand = [
  cmd: string,
  ...args: RedisClientCommandArguments,
];
export type RedisClientCommandReply =
  | string
  | number
  | Buffer
  | null
  | undefined
  | Array<RedisClientCommandReply>;

export enum RedisFeature {
  HashFieldsExpiration = 'HashFieldsExpiration',
  UnlinkCommand = 'UnlinkCommand',
}

export abstract class RedisClient extends EventEmitter2 {
  public readonly id: string;

  protected _redisVersion: string | undefined;

  protected _isInfoCommandDisabled: boolean | undefined;

  protected lastTimeUsed: number;

  constructor(
    public readonly clientMetadata: ClientMetadata,
    protected readonly client: unknown,
    public readonly options: IRedisClientOptions,
  ) {
    super();
    this.clientMetadata = RedisClient.prepareClientMetadata(clientMetadata);
    this.lastTimeUsed = Date.now();
    this.id = RedisClient.generateId(this.clientMetadata);
  }

  /**
   * Get native client
   * @deprecated
   * For backward compatibility. Will be deleted with next releases
   */
  public getClient(): any {
    return this.client;
  }

  public setLastUsed(): void {
    this.lastTimeUsed = Date.now();
  }

  public isIdle(): boolean {
    return Date.now() - this.lastTimeUsed > REDIS_CLIENTS_CONFIG.idleThreshold;
  }

  public get isInfoCommandDisabled() {
    return this._isInfoCommandDisabled;
  }

  /**
   * Checks if client has established connection
   */
  abstract isConnected(): boolean;

  /**
   * Get connection type (STANDALONE, CLUSTER or SENTINEL)
   */
  abstract getConnectionType(): RedisClientConnectionType;

  abstract nodes(role?: RedisClientNodeRole): Promise<RedisClient[]>;

  abstract sendCommand(
    command: RedisClientCommand,
    options?: IRedisClientCommandOptions,
  ): Promise<RedisClientCommandReply>;

  abstract sendPipeline(
    commands: RedisClientCommand[],
    options?: IRedisClientCommandOptions,
  ): Promise<Array<[Error | null, RedisClientCommandReply]>>;

  /** TODO: It's necessary to investigate transactions
  abstract sendMulti(
    commands: RedisClientCommand[],
    options?: IRedisClientCommandOptions,
  ): Promise<Array<[Error | null, RedisClientCommandReply]>>;
   */

  abstract call(
    command: RedisClientCommand,
    options?: IRedisClientCommandOptions,
  ): Promise<RedisClientCommandReply>;

  abstract monitor(): Promise<any>;

  /**
   * Close Redis connection without waiting for pending commands
   */
  abstract disconnect(): Promise<void>;

  /**
   * Wait for pending commands will be processed and then close the connection
   */
  abstract quit(): Promise<void>;

  abstract publish(channel: string, message: string): Promise<number>;

  abstract subscribe(channel: string): Promise<void>;

  abstract pSubscribe(channel: string): Promise<void>;

  abstract unsubscribe(channel: string): Promise<void>;

  abstract pUnsubscribe(channel: string): Promise<void>;

  abstract getCurrentDbIndex(): Promise<number>;

  /**
   * Detects if feature is supported by redis database
   * todo: move out from here when final requirements will be clear
   * @param feature
   */
  public async isFeatureSupported(feature: RedisFeature): Promise<boolean> {
    switch (feature) {
      case RedisFeature.HashFieldsExpiration:
        try {
          const redisVersion = await this.getRedisVersion();
          return redisVersion && semverCompare('7.3', redisVersion) < 1;
        } catch (e) {
          return false;
        }
      case RedisFeature.UnlinkCommand:
        try {
          const redisVersion = await this.getRedisVersion();
          // UNLINK command was introduced in Redis 4.0.0
          return redisVersion && semverCompare('4.0.0', redisVersion) < 1;
        } catch (e) {
          return false;
        }
      default:
        return false;
    }
  }

  private async getRedisVersion(): Promise<string> {
    if (!this._redisVersion) {
      const infoData = await this.getInfo('server');
      this._redisVersion = infoData?.server?.redis_version;
    }

    return this._redisVersion;
  }

  /**
   * Get redis database info
   * If INFO fails, it will try to get info from HELLO command, which provides limited data
   * If HELLO fails, it will return a static object
   * @param force
   * @param infoSection - e.g. server, clients, memory, etc.
   */
  public async getInfo(infoSection?: string) {
    let infoData: any; // TODO: we should ideally type this

    try {
      infoData = convertRedisInfoReplyToObject(
        (await this.call(infoSection ? ['info', infoSection] : ['info'], {
          replyEncoding: 'utf8',
        })) as string,
      );
      this._isInfoCommandDisabled = false;
    } catch (error) {
      this._isInfoCommandDisabled = true;
      try {
        // Fallback to getting basic information from `hello` command
        infoData = await this.getRedisHelloInfo();
      } catch (_error) {
        // Ignore: hello is not available pre redis version 6
      }
    }

    return infoData ?? UNKNOWN_REDIS_INFO;
  }

  private async getRedisHelloInfo() {
    const helloResponse = await this.getRedisHelloResponse();

    return {
      replication: {
        role: helloResponse.role,
      },
      server: {
        server_name: helloResponse.server,
        redis_version: helloResponse.version,
        redis_mode: helloResponse.mode,
      },
      modules: helloResponse.modules,
    };
  }

  private async getRedisHelloResponse(): Promise<RedisDatabaseHelloResponse> {
    const helloResponse = (await this.sendCommand(['hello'], {
      replyEncoding: 'utf8',
    })) as any[];

    const helloInfoResponse = convertArrayReplyToObject(helloResponse);

    if (helloInfoResponse.modules?.length) {
      helloInfoResponse.modules = helloInfoResponse.modules.map(
        convertArrayReplyToObject,
      );
    }

    return plainToClass(RedisDatabaseHelloResponse, helloInfoResponse);
  }

  /**
   * Prepare clientMetadata to be used for generating id and other operations with clients
   * like: find, remove many, etc.
   * @param clientMetadata
   */
  static prepareClientMetadata(clientMetadata: ClientMetadata): ClientMetadata {
    return {
      ...clientMetadata,
      // Workaround: for cli connections we must ignore db index when storing/getting client
      // since inside CLI itself users are able to "select" database manually
      // uniqueness will be guaranteed by ClientMetadata.uniqueId and each opened CLI terminal
      // will have own and a single client
      db:
        clientMetadata.context === ClientContext.CLI ? null : clientMetadata.db,
    };
  }

  static generateId(cm: ClientMetadata): string {
    const empty = '(nil)';
    const separator = '_';

    const id = [
      cm.databaseId,
      cm.context,
      cm.uniqueId || empty,
      isNumber(cm.db) ? cm.db : empty,
    ].join(separator);

    const uId = [
      cm.sessionMetadata?.userId || empty,
      cm.sessionMetadata?.accountId || empty,
      cm.sessionMetadata?.sessionId || empty,
      cm.sessionMetadata?.uniqueId || empty,
    ].join(separator);

    return [id, uId].join(separator);
  }
}
