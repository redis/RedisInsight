import {
  GetArrayCountResponse,
  GetArrayElementDto,
  GetArrayElementResponse,
  GetArrayLengthResponse,
  GetArrayMultiElementsDto,
  GetArrayMultiElementsResponse,
  GetArrayNextIndexResponse,
  GetArrayRangeDto,
  GetArrayRangeResponse,
  GetArrayScanDto,
  GetArrayScanResponse,
} from 'src/modules/browser/array/dto';
import { mockKeyDto } from 'src/modules/browser/__mocks__/keys';

export const mockArrayIndex = '0';
export const mockArrayElement1 = Buffer.from('20.1');
export const mockArrayElement2 = Buffer.from('20.4');

// Sparse range fixture: indexes 0,1 populated, 2,3 empty.
export const mockArrayRangeWithGaps: (Buffer | null)[] = [
  mockArrayElement1,
  mockArrayElement2,
  null,
  null,
];

export const mockGetArrayRangeDto: GetArrayRangeDto = {
  keyName: mockKeyDto.keyName,
  start: '0',
  end: '3',
};

export const mockGetArrayRangeResponse: GetArrayRangeResponse = {
  keyName: mockKeyDto.keyName,
  elements: mockArrayRangeWithGaps,
};

export const mockGetArrayScanDto: GetArrayScanDto = {
  keyName: mockKeyDto.keyName,
  start: '0',
  end: '6',
};

export const mockGetArrayScanResponse: GetArrayScanResponse = {
  keyName: mockKeyDto.keyName,
  elements: [
    { index: '0', value: mockArrayElement1 },
    { index: '1', value: mockArrayElement2 },
  ],
};

export const mockGetArrayElementDto: GetArrayElementDto = {
  keyName: mockKeyDto.keyName,
  index: mockArrayIndex,
};

export const mockGetArrayElementResponse: GetArrayElementResponse = {
  keyName: mockKeyDto.keyName,
  value: mockArrayElement1,
};

export const mockGetArrayMultiElementsDto: GetArrayMultiElementsDto = {
  keyName: mockKeyDto.keyName,
  indexes: ['0', '1', '3'],
};

export const mockGetArrayMultiElementsResponse: GetArrayMultiElementsResponse =
  {
    keyName: mockKeyDto.keyName,
    elements: [mockArrayElement1, mockArrayElement2, null],
  };

export const mockArrayLength = '7';
export const mockArrayCount = '5';
export const mockArrayNextIndex = '7';

export const mockGetArrayLengthResponse: GetArrayLengthResponse = {
  keyName: mockKeyDto.keyName,
  length: mockArrayLength,
};

export const mockGetArrayCountResponse: GetArrayCountResponse = {
  keyName: mockKeyDto.keyName,
  count: mockArrayCount,
};

export const mockGetArrayNextIndexResponse: GetArrayNextIndexResponse = {
  keyName: mockKeyDto.keyName,
  index: mockArrayNextIndex,
};
