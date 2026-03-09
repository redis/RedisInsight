import {
  GetVectorSetElementsDto,
  GetVectorSetElementsResponse,
  VectorSetElementDto,
} from 'src/modules/browser/vector-set/dto';

export const mockVectorSetElementDto: VectorSetElementDto = {
  name: Buffer.from('element1'),
  vector: [0.5, 0.3, 0.8],
  attributes: '{"category": "test"}',
};

export const mockVectorSetElementDto2: VectorSetElementDto = {
  name: Buffer.from('element2'),
  vector: [0.1, 0.2, 0.9],
  attributes: undefined,
};

export const mockVectorSetElementDto3: VectorSetElementDto = {
  name: Buffer.from('element3'),
  vector: [0.7, 0.4, 0.6],
  attributes: '{"score": 0.95}',
};

export const mockGetVectorSetElementsDto: GetVectorSetElementsDto = {
  keyName: Buffer.from('vset:test'),
  start: '-',
  end: '+',
  count: 15,
};

export const mockVectorSetElements = [
  mockVectorSetElementDto,
  mockVectorSetElementDto2,
  mockVectorSetElementDto3,
];

export const mockGetVectorSetElementsResponse: GetVectorSetElementsResponse = {
  keyName: mockGetVectorSetElementsDto.keyName,
  total: mockVectorSetElements.length,
  nextCursor: undefined,
  elements: mockVectorSetElements,
};

