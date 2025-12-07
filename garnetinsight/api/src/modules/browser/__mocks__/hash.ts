import {
  AddFieldsToHashDto,
  CreateHashWithExpireDto,
  DeleteFieldsFromHashDto,
  GetHashFieldsDto,
  GetHashFieldsResponse,
  HashFieldDto,
  HashFieldTtlDto,
  UpdateHashFieldsTtlDto,
} from 'src/modules/browser/hash/dto';
import { mockKeyDto } from 'src/modules/browser/__mocks__/keys';
import { flatMap } from 'lodash';

export const mockHashField: HashFieldDto = {
  field: Buffer.from('field1'),
  value: Buffer.from('value'),
};

export const mockHashFieldWithExpire: HashFieldDto = {
  field: Buffer.from('field-exp1'),
  value: Buffer.from('value-exp1'),
  expire: 111,
};
export const mockHashFieldWithExpire2: HashFieldDto = {
  field: Buffer.from('field-exp2'),
  value: Buffer.from('value-exp2'),
  expire: 222,
};

export const mockAddFieldsDto: AddFieldsToHashDto = {
  keyName: mockKeyDto.keyName,
  fields: [mockHashField],
};

export const mockAddFieldsWithExpirationDto: CreateHashWithExpireDto = {
  keyName: mockKeyDto.keyName,
  fields: [mockHashField, mockHashFieldWithExpire, mockHashFieldWithExpire2],
};

export const mockHashFieldTtlDto = Object.assign(new HashFieldTtlDto(), {
  field: Buffer.from('field-ttl'),
  expire: -1,
});

export const mockHashFieldTtlDto2 = Object.assign(new HashFieldTtlDto(), {
  field: Buffer.from('field-ttl2'),
  expire: 0,
});

export const mockHashFieldTtlDto3 = Object.assign(new HashFieldTtlDto(), {
  field: Buffer.from('field-ttl3'),
  expire: 123123,
});

export const mockUpdateHashFieldsTtlDto: UpdateHashFieldsTtlDto = Object.assign(
  new UpdateHashFieldsTtlDto(),
  {
    keyName: mockKeyDto.keyName,
    fields: [mockHashFieldTtlDto, mockHashFieldTtlDto2, mockHashFieldTtlDto3],
  },
);

export const mockCreateHashWithExpireDto: CreateHashWithExpireDto = {
  keyName: mockKeyDto.keyName,
  fields: [mockHashField],
  expire: 3000,
};

export const mockCreateHashWithExpireAndFieldsExpireDto: CreateHashWithExpireDto =
  {
    ...mockAddFieldsWithExpirationDto,
    expire: 3000,
  };

export const mockDeleteFieldsDto: DeleteFieldsFromHashDto = {
  keyName: mockAddFieldsDto.keyName,
  fields: mockAddFieldsDto.fields.map((item) => item.field),
};
export const mockGetFieldsDto: GetHashFieldsDto = {
  keyName: mockAddFieldsDto.keyName,
  cursor: 0,
  count: 15,
  match: '*',
};
export const mockGetFieldsResponse: GetHashFieldsResponse = {
  keyName: mockGetFieldsDto.keyName,
  nextCursor: 0,
  total: mockAddFieldsDto.fields.length,
  fields: mockAddFieldsDto.fields,
};
export const mockGetFieldsWithTtlResponse: GetHashFieldsResponse = {
  keyName: mockGetFieldsDto.keyName,
  nextCursor: 0,
  total: mockCreateHashWithExpireAndFieldsExpireDto.fields.length,
  fields: mockCreateHashWithExpireAndFieldsExpireDto.fields.map((field) => ({
    ...field,
    expire: field.expire || -1,
  })),
};
export const mockRedisHScanResponse = [
  0,
  flatMap(mockAddFieldsDto.fields, ({ field, value }: HashFieldDto) => [
    field,
    value,
  ]),
];
export const mockRedisHScanWithFieldsExpireResponse = [
  0,
  flatMap(
    mockCreateHashWithExpireAndFieldsExpireDto.fields,
    ({ field, value }: HashFieldDto) => [field, value],
  ),
];
export const mockRedisHTtlResponse = flatMap(
  mockCreateHashWithExpireAndFieldsExpireDto.fields,
  ({ expire }: HashFieldDto) => [expire || -1],
);
