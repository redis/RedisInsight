import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomBytes } from 'crypto';
import { when } from 'jest-when';
import {
  mockRedisNoPermError,
  mockRedisWrongTypeError,
  mockBrowserClientMetadata,
  mockDatabaseClientFactory,
  mockStandaloneRedisClient,
  mockDatabaseService,
  MockType,
  mockDatabaseWithModules,
} from 'src/__mocks__';
import { ReplyError } from 'src/models';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  BrowserToolKeysCommands,
  BrowserToolRejsonRlCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { mockAddFieldsDto } from 'src/modules/browser/__mocks__';
import { DatabaseService } from 'src/modules/database/database.service';
import config, { Config } from 'src/utils/config';
import { RejsonRlService } from './rejson-rl.service';

const mockModulesConfig = config.get('modules') as Config['modules'];

jest.mock(
  'src/utils/config',
  jest.fn(() => jest.requireActual('src/utils/config') as object),
);

const testKey = Buffer.from('somejson');
const testSerializedObject = JSON.stringify({ some: 'object' });
const testPath = '$';
const testExpire = 30;

describe('JsonService', () => {
  const client = mockStandaloneRedisClient;
  let service: RejsonRlService;
  let databaseService: MockType<DatabaseService>;

  beforeEach(async () => {
    mockModulesConfig.json.lengthThreshold = -1;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RejsonRlService,
        {
          provide: DatabaseClientFactory,
          useFactory: mockDatabaseClientFactory,
        },
        {
          provide: DatabaseService,
          useFactory: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<RejsonRlService>(RejsonRlService);
    client.sendCommand = jest.fn().mockResolvedValue(undefined);
    databaseService = module.get(DatabaseService);
  });

  describe('getJson', () => {
    const mockRedisCallsForSafeResponse = (
      path,
      key,
      type,
      value,
      cardinality = 0,
    ) => {
      when(client.sendCommand)
        .calledWith([BrowserToolRejsonRlCommands.JsonType, testKey, path], {
          replyEncoding: 'utf8',
        })
        .mockReturnValue([type]);

      if (value !== undefined) {
        when(client.sendCommand)
          .calledWith([BrowserToolRejsonRlCommands.JsonGet, testKey, path], {
            replyEncoding: 'utf8',
          })
          .mockReturnValue(JSON.stringify([value]));
      }

      switch (type) {
        case 'array':
          when(client.sendCommand)
            .calledWith(
              [BrowserToolRejsonRlCommands.JsonArrLen, testKey, path],
              { replyEncoding: 'utf8' },
            )
            .mockReturnValue([cardinality]);
          break;
        case 'object':
          when(client.sendCommand)
            .calledWith(
              [BrowserToolRejsonRlCommands.JsonObjLen, testKey, path],
              { replyEncoding: 'utf8' },
            )
            .mockReturnValue([cardinality]);
          break;
        default:
      }
    };

    describe('full json download', () => {
      beforeEach(() => {
        databaseService.get.mockResolvedValue(mockDatabaseWithModules);
        when(client.sendCommand)
          .calledWith([
            BrowserToolRejsonRlCommands.JsonDebug,
            'MEMORY',
            testKey,
            '.',
          ])
          .mockReturnValue(10);
      });

      it('should throw BadRequest error when no key found in the database', async () => {
        when(client.sendCommand)
          .calledWith([
            BrowserToolRejsonRlCommands.JsonDebug,
            'MEMORY',
            testKey,
            '.',
          ])
          .mockResolvedValue(null);

        try {
          await service.getJson(mockBrowserClientMetadata, {
            keyName: testKey,
            path: testPath,
          });
        } catch (err) {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.message).toEqual(
            `There is no such path: "${testPath}" in key: "${testKey}"`,
          );
        }
      });
      it('should throw BadRequest error when incorrect type of a key', async () => {
        when(client.sendCommand)
          .calledWith(
            [BrowserToolRejsonRlCommands.JsonGet, testKey, testPath],
            { replyEncoding: 'utf8' },
          )
          .mockResolvedValue(null);

        try {
          await service.getJson(mockBrowserClientMetadata, {
            keyName: testKey,
            path: testPath,
            forceRetrieve: true,
          });
        } catch (err) {
          expect(err).toBeInstanceOf(BadRequestException);
        }
      });
      it('should throw BadRequest when try to force get not existing path/key', async () => {
        const replyError: ReplyError = {
          ...mockRedisWrongTypeError,
          command: 'JSON.DEBUG',
        };
        client.sendCommand.mockRejectedValue(replyError);

        try {
          await service.getJson(mockBrowserClientMetadata, {
            keyName: testKey,
            path: testPath,
          });
        } catch (err) {
          expect(err).toBeInstanceOf(BadRequestException);
        }
      });
      it('should throw BadRequest error when module not loaded for getJson', async () => {
        const replyError: ReplyError = {
          name: 'ReplyError',
          message: `unknown command ${BrowserToolRejsonRlCommands.JsonGet}`,
          command: BrowserToolRejsonRlCommands.JsonGet,
        };
        client.sendCommand.mockRejectedValue(replyError);

        try {
          await service.getJson(mockBrowserClientMetadata, {
            keyName: testKey,
            path: testPath,
          });
        } catch (err) {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.message).toEqual(
            ERROR_MESSAGES.REDIS_MODULE_IS_REQUIRED('JSON'),
          );
        }
      });
      it('should throw InternalError when some unexpected error happened', async () => {
        client.sendCommand.mockRejectedValue(new Error()); // no message here

        try {
          await service.getJson(mockBrowserClientMetadata, {
            keyName: testKey,
            path: testPath,
          });
        } catch (err) {
          expect(err).toBeInstanceOf(InternalServerErrorException);
        }
      });
      it('should return data (string)', async () => {
        const testData = 'some string';
        when(client.sendCommand)
          .calledWith(
            [BrowserToolRejsonRlCommands.JsonGet, testKey, testPath],
            { replyEncoding: 'utf8' },
          )
          .mockReturnValue(JSON.stringify([testData]));

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });

        expect(result).toEqual({
          downloaded: true,
          path: testPath,
          data: JSON.stringify(testData),
        });
      });
      it('should return data (number)', async () => {
        const testData = 3.14;
        when(client.sendCommand)
          .calledWith(
            [BrowserToolRejsonRlCommands.JsonGet, testKey, testPath],
            { replyEncoding: 'utf8' },
          )
          .mockReturnValue(JSON.stringify([testData]));

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });

        expect(result).toEqual({
          downloaded: true,
          path: testPath,
          data: JSON.stringify(testData),
        });
      });
      it('should return data (integer)', async () => {
        const testData = 123;
        when(client.sendCommand)
          .calledWith(
            [BrowserToolRejsonRlCommands.JsonGet, testKey, testPath],
            { replyEncoding: 'utf8' },
          )
          .mockReturnValue(JSON.stringify([testData]));

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });

        expect(result).toEqual({
          downloaded: true,
          path: testPath,
          data: JSON.stringify(testData),
        });
      });
      it('should return data (boolean)', async () => {
        const testData = true;
        when(client.sendCommand)
          .calledWith(
            [BrowserToolRejsonRlCommands.JsonGet, testKey, testPath],
            { replyEncoding: 'utf8' },
          )
          .mockReturnValue(JSON.stringify([testData]));

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });

        expect(result).toEqual({
          downloaded: true,
          path: testPath,
          data: JSON.stringify(testData),
        });
      });
      it('should return data (null)', async () => {
        const testData = null;
        when(client.sendCommand)
          .calledWith(
            [BrowserToolRejsonRlCommands.JsonGet, testKey, testPath],
            { replyEncoding: 'utf8' },
          )
          .mockReturnValue(JSON.stringify([testData]));

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });

        expect(result).toEqual({
          downloaded: true,
          path: testPath,
          data: JSON.stringify(testData),
        });
      });
      it('should return data (array)', async () => {
        const testData = [
          1,
          'str',
          false,
          null,
          0.98,
          [1, 2],
          { some: 'field' },
        ];
        when(client.sendCommand)
          .calledWith(
            [BrowserToolRejsonRlCommands.JsonGet, testKey, testPath],
            { replyEncoding: 'utf8' },
          )
          .mockReturnValue(JSON.stringify([testData]));

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });

        expect(result).toEqual({
          downloaded: true,
          path: testPath,
          data: JSON.stringify(testData),
        });
      });
      it('should return data (object)', async () => {
        const testData = {
          someStr: 'field',
          someArr: [],
          someBool: true,
          someNumber: 12.22,
          someInt: 1222,
        };
        when(client.sendCommand)
          .calledWith(
            [BrowserToolRejsonRlCommands.JsonGet, testKey, testPath],
            { replyEncoding: 'utf8' },
          )
          .mockReturnValue(JSON.stringify([testData]));

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });

        expect(result).toEqual({
          downloaded: true,
          path: testPath,
          data: JSON.stringify(testData),
        });
      });
      it('should return data with "constructor" property (prototype pollution safe)', async () => {
        const testData = {
          constructor: 'hello',
          name: 'test',
        };
        when(client.sendCommand)
          .calledWith(
            [BrowserToolRejsonRlCommands.JsonGet, testKey, testPath],
            { replyEncoding: 'utf8' },
          )
          .mockReturnValue(JSON.stringify([testData]));

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });

        expect(result).toEqual({
          downloaded: true,
          path: testPath,
          data: JSON.stringify(testData),
        });
      });
      it('should return data with "__proto__" property (prototype pollution safe)', async () => {
        const testDataString = '{"__proto__":"polluted","name":"test"}';
        when(client.sendCommand)
          .calledWith(
            [BrowserToolRejsonRlCommands.JsonGet, testKey, testPath],
            { replyEncoding: 'utf8' },
          )
          .mockReturnValue(`[${testDataString}]`);

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });

        expect(result).toEqual({
          downloaded: true,
          path: testPath,
          data: testDataString,
        });
      });
      it('should return array with "constructor" property in nested object', async () => {
        const testData = [{ constructor: 'hello' }];
        when(client.sendCommand)
          .calledWith(
            [BrowserToolRejsonRlCommands.JsonGet, testKey, testPath],
            { replyEncoding: 'utf8' },
          )
          .mockReturnValue(JSON.stringify([testData]));

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });

        expect(result).toEqual({
          downloaded: true,
          path: testPath,
          data: JSON.stringify(testData),
        });
      });
      it('should return full json data when forceRetrieve is true', async () => {
        const testData = {
          someStr: 'field',
          someArr: [],
          someBool: true,
          someNumber: 12.22,
          someInt: 1222,
        };

        when(client.sendCommand)
          .calledWith([
            BrowserToolRejsonRlCommands.JsonDebug,
            'MEMORY',
            testKey,
            '.',
          ])
          .mockReturnValue(1025);

        when(client.sendCommand)
          .calledWith(
            [BrowserToolRejsonRlCommands.JsonGet, testKey, testPath],
            { replyEncoding: 'utf8' },
          )
          .mockReturnValue(JSON.stringify([testData]));

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
          forceRetrieve: true,
        });

        expect(result).toEqual({
          downloaded: true,
          path: testPath,
          data: JSON.stringify(testData),
        });
      });
    });
    describe('user has no PERM for JSON.DEBUG', () => {
      beforeEach(() => {
        databaseService.get.mockResolvedValue(mockDatabaseWithModules);
        const replyError: ReplyError = {
          ...mockRedisNoPermError,
          command: 'JSON.DEBUG',
        };

        when(client.sendCommand)
          .calledWith([
            BrowserToolRejsonRlCommands.JsonDebug,
            'MEMORY',
            testKey,
            '.',
          ])
          .mockRejectedValue(replyError);
      });

      it('should return data (string)', async () => {
        const testData = 'some string';
        when(client.sendCommand)
          .calledWith(
            [BrowserToolRejsonRlCommands.JsonGet, testKey, testPath],
            { replyEncoding: 'utf8' },
          )
          .mockReturnValue(JSON.stringify([testData]));

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });

        expect(result).toEqual({
          downloaded: true,
          path: testPath,
          data: JSON.stringify(testData),
        });
      });

      it('should return full json value even if size is above the limit', async () => {
        const testData = { arr: [randomBytes(2000).toString('hex')] };
        when(client.sendCommand)
          .calledWith(
            [BrowserToolRejsonRlCommands.JsonGet, testKey, testPath],
            { replyEncoding: 'utf8' },
          )
          .mockReturnValue(JSON.stringify([testData]));

        when(client.sendCommand)
          .calledWith(
            [BrowserToolRejsonRlCommands.JsonType, testKey, testPath],
            { replyEncoding: 'utf8' },
          )
          .mockReturnValue('object');

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });

        expect(result).toEqual({
          downloaded: true,
          path: testPath,
          data: JSON.stringify(testData),
        });
      });
    });
    describe('partial json download', () => {
      beforeEach(() => {
        databaseService.get.mockResolvedValue(mockDatabaseWithModules);
        when(client.sendCommand)
          .calledWith([
            BrowserToolRejsonRlCommands.JsonDebug,
            'MEMORY',
            testKey,
            '.',
          ])
          .mockReturnValue(1025);
      });

      it('should return full string value even if size is above the limit', async () => {
        const testData = randomBytes(2000).toString('hex');
        when(client.sendCommand)
          .calledWith(
            [BrowserToolRejsonRlCommands.JsonGet, testKey, testPath],
            { replyEncoding: 'utf8' },
          )
          .mockReturnValue(JSON.stringify([testData]));
        when(client.sendCommand)
          .calledWith(
            [BrowserToolRejsonRlCommands.JsonType, testKey, testPath],
            { replyEncoding: 'utf8' },
          )
          .mockReturnValue(['string']);

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });

        expect(result).toEqual({
          downloaded: false,
          path: testPath,
          data: JSON.stringify(testData),
          type: 'string',
        });
      });
      it('should return array with scalar values as strings and safe struct types descriptions', async () => {
        const testData = [
          12,
          3.14,
          'str',
          false,
          null,
          [1, 2, 3],
          { key1: 'value1', key2: 'value2' },
        ];
        when(client.sendCommand)
          .calledWith(
            [BrowserToolRejsonRlCommands.JsonType, testKey, testPath],
            { replyEncoding: 'utf8' },
          )
          .mockReturnValue(['array']);
        when(client.sendCommand)
          .calledWith(
            [BrowserToolRejsonRlCommands.JsonArrLen, testKey, testPath],
            { replyEncoding: 'utf8' },
          )
          .mockReturnValue([7]);

        mockRedisCallsForSafeResponse('$[0]', 0, 'integer', testData[0]);
        mockRedisCallsForSafeResponse('$[1]', 1, 'number', testData[1]);
        mockRedisCallsForSafeResponse('$[2]', 2, 'string', testData[2]);
        mockRedisCallsForSafeResponse('$[3]', 3, 'boolean', testData[3]);
        mockRedisCallsForSafeResponse('$[4]', 4, 'null', testData[4]);
        mockRedisCallsForSafeResponse('$[5]', 5, 'array', undefined, 3);
        mockRedisCallsForSafeResponse('$[6]', 6, 'object', undefined, 2);

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });

        expect(result).toEqual({
          downloaded: false,
          path: testPath,
          type: 'array',
          data: [
            {
              key: 0,
              path: '$[0]',
              cardinality: 1,
              type: 'integer',
              value: String(testData[0]),
            },
            {
              key: 1,
              path: '$[1]',
              cardinality: 1,
              type: 'number',
              value: String(testData[1]),
            },
            {
              key: 2,
              path: '$[2]',
              cardinality: 1,
              type: 'string',
              value: `"${testData[2]}"`,
            },
            {
              key: 3,
              path: '$[3]',
              cardinality: 1,
              type: 'boolean',
              value: String(testData[3]),
            },
            {
              key: 4,
              path: '$[4]',
              cardinality: 1,
              type: 'null',
              value: String(testData[4]),
            },
            {
              key: 5,
              path: '$[5]',
              cardinality: 3,
              type: 'array',
            },
            {
              key: 6,
              path: '$[6]',
              cardinality: 2,
              type: 'object',
            },
          ],
        });
      });
      it('should throw an error when array length exceeds threshold', async () => {
        mockModulesConfig.json.lengthThreshold = 5_000;

        when(client.sendCommand)
          .calledWith(
            [BrowserToolRejsonRlCommands.JsonType, testKey, testPath],
            { replyEncoding: 'utf8' },
          )
          .mockReturnValue(['array']);
        when(client.sendCommand)
          .calledWith(
            [BrowserToolRejsonRlCommands.JsonArrLen, testKey, testPath],
            { replyEncoding: 'utf8' },
          )
          .mockReturnValue([5001]);

        await expect(
          service.getJson(mockBrowserClientMetadata, {
            keyName: testKey,
            path: testPath,
          }),
        ).rejects.toThrow(
          new BadRequestException(ERROR_MESSAGES.UNSAFE_BIG_JSON_LENGTH),
        );
      });
      it('should return array with scalar values in a custom path', async () => {
        const path = '$["customPath"]';
        const testData = [12, 'str'];
        when(client.sendCommand)
          .calledWith([
            BrowserToolRejsonRlCommands.JsonDebug,
            'MEMORY',
            testKey,
            path,
          ])
          .mockReturnValue(1025);
        when(client.sendCommand)
          .calledWith([BrowserToolRejsonRlCommands.JsonType, testKey, path], {
            replyEncoding: 'utf8',
          })
          .mockReturnValue(['array']);
        when(client.sendCommand)
          .calledWith([BrowserToolRejsonRlCommands.JsonArrLen, testKey, path], {
            replyEncoding: 'utf8',
          })
          .mockReturnValue([2]);

        mockRedisCallsForSafeResponse(`${path}[0]`, 0, 'integer', testData[0]);
        mockRedisCallsForSafeResponse(`${path}[1]`, 1, 'string', testData[1]);

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path,
        });

        expect(result).toEqual({
          downloaded: false,
          path,
          type: 'array',
          data: [
            {
              key: 0,
              path: `${path}[0]`,
              cardinality: 1,
              type: 'integer',
              value: String(testData[0]),
            },
            {
              key: 1,
              path: `${path}[1]`,
              cardinality: 1,
              type: 'string',
              value: `"${testData[1]}"`,
            },
          ],
        });
      });
      it('should return object with scalar values as strings and safe struct types descriptions', async () => {
        const testData = {
          fInt: 12,
          fNum: 3.14,
          fStr: 'str',
          fBool: false,
          fNull: null,
          fArr: [1, 2, 3],
          fObj: { key1: 'value1', key2: 'value2' },
        };

        when(client.sendCommand)
          .calledWith(
            [BrowserToolRejsonRlCommands.JsonType, testKey, testPath],
            { replyEncoding: 'utf8' },
          )
          .mockReturnValue(['object']);
        when(client.sendCommand)
          .calledWith(
            [BrowserToolRejsonRlCommands.JsonObjKeys, testKey, testPath],
            { replyEncoding: 'utf8' },
          )
          .mockReturnValue([Object.keys(testData)]);

        mockRedisCallsForSafeResponse(
          '$["fInt"]',
          'fInt',
          'integer',
          testData.fInt,
        );
        mockRedisCallsForSafeResponse(
          '$["fNum"]',
          'fNum',
          'number',
          testData.fNum,
        );
        mockRedisCallsForSafeResponse(
          '$["fStr"]',
          'fStr',
          'string',
          testData.fStr,
        );
        mockRedisCallsForSafeResponse(
          '$["fBool"]',
          'fBool',
          'boolean',
          testData.fBool,
        );
        mockRedisCallsForSafeResponse(
          '$["fNull"]',
          'fNull',
          'null',
          testData.fNull,
        );
        mockRedisCallsForSafeResponse(
          '$["fArr"]',
          'fArr',
          'array',
          undefined,
          3,
        );
        mockRedisCallsForSafeResponse(
          '$["fObj"]',
          'fObj',
          'object',
          undefined,
          2,
        );

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });

        expect(result).toEqual({
          downloaded: false,
          path: testPath,
          type: 'object',
          data: [
            {
              key: 'fInt',
              path: '$["fInt"]',
              cardinality: 1,
              type: 'integer',
              value: String(testData.fInt),
            },
            {
              key: 'fNum',
              path: '$["fNum"]',
              cardinality: 1,
              type: 'number',
              value: String(testData.fNum),
            },
            {
              key: 'fStr',
              path: '$["fStr"]',
              cardinality: 1,
              type: 'string',
              value: `"${testData.fStr}"`,
            },
            {
              key: 'fBool',
              path: '$["fBool"]',
              cardinality: 1,
              type: 'boolean',
              value: String(testData.fBool),
            },
            {
              key: 'fNull',
              path: '$["fNull"]',
              cardinality: 1,
              type: 'null',
              value: String(testData.fNull),
            },
            {
              key: 'fArr',
              path: '$["fArr"]',
              cardinality: 3,
              type: 'array',
            },
            {
              key: 'fObj',
              path: '$["fObj"]',
              cardinality: 2,
              type: 'object',
            },
          ],
        });
      });
      it('should throw an error when number of object entries exceeds threshold', async () => {
        mockModulesConfig.json.lengthThreshold = 5_000;

        when(client.sendCommand)
          .calledWith(
            [BrowserToolRejsonRlCommands.JsonType, testKey, testPath],
            { replyEncoding: 'utf8' },
          )
          .mockReturnValue(['object']);
        when(client.sendCommand)
          .calledWith(
            [BrowserToolRejsonRlCommands.JsonObjLen, testKey, testPath],
            { replyEncoding: 'utf8' },
          )
          .mockReturnValue([10_000]);

        await expect(
          service.getJson(mockBrowserClientMetadata, {
            keyName: testKey,
            path: testPath,
          }),
        ).rejects.toThrow(
          new BadRequestException(ERROR_MESSAGES.UNSAFE_BIG_JSON_LENGTH),
        );
      });
      it('should return object with scalar values as strings in a custom path', async () => {
        const path = '$["customPath"]';
        const testData = {
          fInt: 12,
          fStr: 'str',
        };

        when(client.sendCommand)
          .calledWith([
            BrowserToolRejsonRlCommands.JsonDebug,
            'MEMORY',
            testKey,
            path,
          ])
          .mockReturnValue(1025);
        when(client.sendCommand)
          .calledWith([BrowserToolRejsonRlCommands.JsonType, testKey, path], {
            replyEncoding: 'utf8',
          })
          .mockReturnValue(['object']);
        when(client.sendCommand)
          .calledWith(
            [BrowserToolRejsonRlCommands.JsonObjKeys, testKey, path],
            { replyEncoding: 'utf8' },
          )
          .mockReturnValue([Object.keys(testData)]);

        mockRedisCallsForSafeResponse(
          `${path}["fInt"]`,
          'fInt',
          'integer',
          testData.fInt,
        );
        mockRedisCallsForSafeResponse(
          `${path}["fStr"]`,
          'fStr',
          'string',
          testData.fStr,
        );

        const result = await service.getJson(mockBrowserClientMetadata, {
          keyName: testKey,
          path,
        });

        expect(result).toEqual({
          downloaded: false,
          path,
          type: 'object',
          data: [
            {
              key: 'fInt',
              path: `${path}["fInt"]`,
              cardinality: 1,
              type: 'integer',
              value: String(testData.fInt),
            },
            {
              key: 'fStr',
              path: `${path}["fStr"]`,
              cardinality: 1,
              type: 'string',
              value: `"${testData.fStr}"`,
            },
          ],
        });
      });
    });

    describe('prepareJsonPath', () => {
      it('should convert "$" to "." for RedisJSON v1 (legacy)', async () => {
        const database = {
          ...mockDatabaseWithModules,
          modules: [{ name: 'ReJSON', semanticVersion: ['1', '0', '0'] }],
        };
        databaseService.get.mockResolvedValue(database);

        const result = await service['prepareJsonPath'](
          mockBrowserClientMetadata,
          '$',
        );

        expect(result).toBe('.');
      });

      it('should strip "$" from path for RedisJSON v1', async () => {
        const database = {
          ...mockDatabaseWithModules,
          modules: [{ name: 'ReJSON', semanticVersion: ['1', '4', '2'] }],
        };
        databaseService.get.mockResolvedValue(database);

        const result = await service['prepareJsonPath'](
          mockBrowserClientMetadata,
          '$.user.name',
        );

        expect(result).toBe('.user.name');
      });

      it('should fallback to dot path when semanticVersion is missing', async () => {
        const database = {
          ...mockDatabaseWithModules,
          modules: [
            { name: 'ReJSON' }, // no semanticVersion field
          ],
        };
        databaseService.get.mockResolvedValue(database);

        const result = await service['prepareJsonPath'](
          mockBrowserClientMetadata,
          '$',
        );

        expect(result).toBe('.');
      });

      it('should return original path for RedisJSON v2', async () => {
        const database = {
          ...mockDatabaseWithModules,
          modules: [{ name: 'ReJSON', semanticVersion: ['2', '0', '0'] }],
        };
        databaseService.get.mockResolvedValue(database);

        const result = await service['prepareJsonPath'](
          mockBrowserClientMetadata,
          '$.user.name',
        );

        expect(result).toBe('$.user.name');
      });
    });
  });
  describe('create', () => {
    beforeEach(() => {
      databaseService.get.mockResolvedValue(mockDatabaseWithModules);
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockAddFieldsDto.keyName])
        .mockResolvedValue(false);
      client.sendCommand.mockReturnValue('OK');
    });
    it('should throw Conflict error when key is already in the database', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockAddFieldsDto.keyName])
        .mockResolvedValue(true);
      client.sendCommand.mockReturnValue(null);

      try {
        await service.create(mockBrowserClientMetadata, {
          keyName: testKey,
          data: testSerializedObject,
        });
      } catch (err) {
        expect(err).toBeInstanceOf(ConflictException);
        expect(err.message).toEqual(ERROR_MESSAGES.KEY_NAME_EXIST);
      }
    });
    it('should throw Forbidden error when no perms for an action for create', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
      };
      client.sendCommand.mockRejectedValue(replyError);

      try {
        await service.create(mockBrowserClientMetadata, {
          keyName: testKey,
          data: testSerializedObject,
        });
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
    it('should throw BadRequest error when module not loaded for create', async () => {
      const replyError: ReplyError = {
        name: 'ReplyError',
        message: `unknown command ${BrowserToolRejsonRlCommands.JsonSet}`,
        command: BrowserToolRejsonRlCommands.JsonSet,
      };
      client.sendCommand.mockRejectedValue(replyError);

      try {
        await service.create(mockBrowserClientMetadata, {
          keyName: testKey,
          data: testSerializedObject,
        });
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toEqual(
          ERROR_MESSAGES.REDIS_MODULE_IS_REQUIRED('JSON'),
        );
      }
    });
    it('should silently handle key expire error and log it', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
      };
      when(client.sendCommand)
        .calledWith([
          BrowserToolRejsonRlCommands.JsonSet,
          testKey,
          testPath,
          testSerializedObject,
          'NX',
        ])
        .mockReturnValue('OK');
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Expire, testKey, testExpire])
        .mockRejectedValue(replyError);

      await service.create(mockBrowserClientMetadata, {
        keyName: testKey,
        data: testSerializedObject,
        expire: testExpire,
      });
      expect(client.sendCommand).lastCalledWith([
        BrowserToolKeysCommands.Expire,
        testKey,
        testExpire,
      ]);
    });
    it('should successful create key', async () => {
      when(client.sendCommand)
        .calledWith([BrowserToolKeysCommands.Exists, mockAddFieldsDto.keyName])
        .mockResolvedValue(true);
      await service.create(mockBrowserClientMetadata, {
        keyName: testKey,
        data: testSerializedObject,
      });
    });
  });
  describe('jsonSet', () => {
    beforeEach(() => {
      databaseService.get.mockResolvedValue(mockDatabaseWithModules);
      client.sendCommand.mockReturnValue('OK');
    });
    it('should throw NotFound error when key does not exists for jsonSet', async () => {
      client.sendCommand.mockReturnValue(0);

      try {
        await service.jsonSet(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
          data: testSerializedObject,
        });
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message).toEqual(ERROR_MESSAGES.KEY_NOT_EXIST);
      }
    });
    it('should throw BadRequest error when module not loaded for jsonSet', async () => {
      const replyError: ReplyError = {
        name: 'ReplyError',
        message: `unknown command ${BrowserToolRejsonRlCommands.JsonSet}`,
        command: BrowserToolRejsonRlCommands.JsonSet,
      };
      client.sendCommand.mockRejectedValue(replyError);

      try {
        await service.jsonSet(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
          data: testSerializedObject,
        });
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toEqual(
          ERROR_MESSAGES.REDIS_MODULE_IS_REQUIRED('JSON'),
        );
      }
    });
    it('should throw NotFound error when try to set to the incorrect path', async () => {
      const replyError: ReplyError = {
        name: 'ReplyError',
        command: 'json.set',
        message: "ERR index '[7]' out of range at level 1 in path",
      };
      client.sendCommand.mockRejectedValue(replyError);

      try {
        await service.jsonSet(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
          data: testSerializedObject,
        });
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message).toEqual(ERROR_MESSAGES.PATH_NOT_EXISTS());
      }
    });
    it('should throw Forbidden error when no perms for an action for jsonSet', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
      };
      client.sendCommand.mockRejectedValue(replyError);

      try {
        await service.jsonSet(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
          data: testSerializedObject,
        });
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
    it('should successful modify data', async () => {
      await service.jsonSet(mockBrowserClientMetadata, {
        keyName: testKey,
        path: testPath,
        data: testSerializedObject,
      });

      expect(client.sendCommand).toHaveBeenNthCalledWith(1, [
        BrowserToolKeysCommands.Exists,
        testKey,
      ]);
      expect(client.sendCommand).lastCalledWith([
        BrowserToolRejsonRlCommands.JsonSet,
        testKey,
        testPath,
        testSerializedObject,
      ]);
    });
  });
  describe('arrAppend', () => {
    beforeEach(() => {
      client.sendCommand.mockReturnValue('OK');
    });
    it('should throw NotFound error when key does not exists', async () => {
      client.sendCommand.mockReturnValue(0);

      try {
        await service.arrAppend(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
          data: [testSerializedObject],
        });
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message).toEqual(ERROR_MESSAGES.KEY_NOT_EXIST);
      }
    });
    it('should throw BadRequest error when module not loaded', async () => {
      const replyError: ReplyError = {
        name: 'ReplyError',
        message: `unknown command ${BrowserToolRejsonRlCommands.JsonArrAppend}`,
        command: BrowserToolRejsonRlCommands.JsonArrAppend,
      };
      client.sendCommand.mockRejectedValue(replyError);

      try {
        await service.arrAppend(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
          data: [testSerializedObject],
        });
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toEqual(
          ERROR_MESSAGES.REDIS_MODULE_IS_REQUIRED('JSON'),
        );
      }
    });
    it('should throw Forbidden error when no perms for an action', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
      };
      client.sendCommand.mockRejectedValue(replyError);

      try {
        await service.arrAppend(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
          data: [testSerializedObject],
        });
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
    it('should successful modify data', async () => {
      client.sendCommand.mockReturnValueOnce('OK');
      // JSON.ARRAPEND returns an array of integer replies for each path, the array's new size,
      // or nil, if the matching JSON value is not an array
      client.sendCommand.mockReturnValueOnce([10]);
      const database = {
        ...mockDatabaseWithModules,
        modules: [{ name: 'ReJSON', semanticVersion: ['2', '0', '0'] }],
      };
      databaseService.get.mockResolvedValue(database);
      await service.arrAppend(mockBrowserClientMetadata, {
        keyName: testKey,
        path: testPath,
        data: [testSerializedObject, testSerializedObject],
      });

      expect(client.sendCommand).toHaveBeenNthCalledWith(1, [
        BrowserToolKeysCommands.Exists,
        testKey,
      ]);
      expect(client.sendCommand).lastCalledWith([
        BrowserToolRejsonRlCommands.JsonArrAppend,
        testKey,
        testPath,
        testSerializedObject,
        testSerializedObject,
      ]);
    });
  });
  describe('remove', () => {
    beforeEach(() => {
      databaseService.get.mockResolvedValue(mockDatabaseWithModules);
      client.sendCommand.mockReturnValue('OK');
    });
    it('should throw NotFound error when key does not exists', async () => {
      client.sendCommand.mockReturnValue(0);

      try {
        await service.remove(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message).toEqual(ERROR_MESSAGES.KEY_NOT_EXIST);
      }
    });
    it('should throw BadRequest error when module not loaded', async () => {
      const replyError: ReplyError = {
        name: 'ReplyError',
        message: `unknown command ${BrowserToolRejsonRlCommands.JsonDel}`,
        command: BrowserToolRejsonRlCommands.JsonDel,
      };
      client.sendCommand.mockRejectedValue(replyError);

      try {
        await service.remove(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toEqual(
          ERROR_MESSAGES.REDIS_MODULE_IS_REQUIRED('JSON'),
        );
      }
    });
    it('should throw Forbidden error when no perms for an action', async () => {
      const replyError: ReplyError = {
        ...mockRedisNoPermError,
      };
      client.sendCommand.mockRejectedValue(replyError);

      try {
        await service.remove(mockBrowserClientMetadata, {
          keyName: testKey,
          path: testPath,
        });
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
    it('should successful remove path', async () => {
      await service.remove(mockBrowserClientMetadata, {
        keyName: testKey,
        path: testPath,
      });

      expect(client.sendCommand).toHaveBeenNthCalledWith(1, [
        BrowserToolKeysCommands.Exists,
        testKey,
      ]);
      expect(client.sendCommand).lastCalledWith([
        BrowserToolRejsonRlCommands.JsonDel,
        testKey,
        testPath,
      ]);
    });
  });
});
