import {
  ClientContext,
  ClientMetadata,
  SessionMetadata,
} from 'src/common/models';
import { mockDatabase } from 'src/__mocks__/databases';
import { v4 as uuidv4 } from 'uuid';
import { mockAccountId, mockUserId } from 'src/__mocks__/user';
import {
  DEFAULT_ACCOUNT_ID,
  DEFAULT_SESSION_ID,
  DEFAULT_USER_ID,
} from 'src/common/constants';

export type MockType<T> = {
  [P in keyof T]: jest.Mock<any>;
};

export const mockQueryBuilderWhere = jest.fn().mockReturnThis();
export const mockQueryBuilderWhereInIds = jest.fn().mockReturnThis();
export const mockQueryBuilderSelect = jest.fn().mockReturnThis();
export const mockQueryBuilderLeftJoinAndSelect = jest.fn().mockReturnThis();
export const mockQueryBuilderGetOne = jest.fn();
export const mockQueryBuilderGetMany = jest.fn();
export const mockQueryBuilderGetManyRaw = jest.fn();
export const mockQueryBuilderGetCount = jest.fn();
export const mockQueryBuilderExecute = jest.fn();
export const mockCreateQueryBuilder = jest.fn(() => ({
  // where: jest.fn().mockReturnThis(),
  where: mockQueryBuilderWhere,
  whereInIds: mockQueryBuilderWhereInIds,
  orWhere: mockQueryBuilderWhere,
  update: jest.fn().mockReturnThis(),
  select: mockQueryBuilderSelect,
  set: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  having: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  leftJoin: jest.fn().mockReturnThis(),
  leftJoinAndSelect: mockQueryBuilderLeftJoinAndSelect,
  offset: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  execute: mockQueryBuilderExecute,
  getCount: mockQueryBuilderGetCount,
  getRawMany: mockQueryBuilderGetManyRaw,
  getMany: mockQueryBuilderGetMany,
  getOne: mockQueryBuilderGetOne,
}));

export const mockRepository = jest.fn(() => ({
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  find: jest.fn(),
  findByIds: jest.fn(),
  merge: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  upsert: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: mockCreateQueryBuilder,
}));

export const mockSessionMetadata: SessionMetadata = {
  userId: mockUserId,
  accountId: mockAccountId,
  sessionId: uuidv4(),
};

export const mockDefaultSessionMetadata: SessionMetadata = {
  userId: DEFAULT_USER_ID,
  accountId: DEFAULT_ACCOUNT_ID,
  sessionId: DEFAULT_SESSION_ID,
};

export const mockClientMetadata: ClientMetadata = {
  sessionMetadata: mockSessionMetadata,
  databaseId: mockDatabase.id,
  context: ClientContext.Common,
};

export const mockCliClientMetadata: ClientMetadata = {
  sessionMetadata: mockSessionMetadata,
  databaseId: mockDatabase.id,
  context: ClientContext.CLI,
  uniqueId: uuidv4(),
};

export const mockWorkbenchClientMetadata: ClientMetadata = {
  sessionMetadata: mockSessionMetadata,
  databaseId: mockDatabase.id,
  context: ClientContext.Workbench,
};

export const mockBrowserClientMetadata: ClientMetadata = {
  sessionMetadata: mockSessionMetadata,
  databaseId: mockDatabase.id,
  context: ClientContext.Browser,
};

export const mockCommonClientMetadata: ClientMetadata = {
  sessionMetadata: mockSessionMetadata,
  databaseId: mockDatabase.id,
  context: ClientContext.Common,
};
