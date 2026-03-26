import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { GetKeyInfoResponse } from 'src/modules/browser/keys/dto';
import { MAX_KEY_SIZE } from '../constants';

interface VInfoResponse {
  raw: (string | number)[];
  quantType: string;
  vectorDim: number;
}

export const vectorSetKeyInfoFactory = Factory.define<GetKeyInfoResponse>(
  () => ({
    name: faker.string.sample(),
    type: 'vectorset',
    ttl: faker.number.int(),
    size: faker.number.int(),
    length: faker.number.int({ max: MAX_KEY_SIZE - 1 }),
    quantType: faker.helpers.arrayElement(['int8', 'float32', 'float64']),
    vectorDim: faker.number.int({ min: 1, max: 4096 }),
  }),
);

export const vInfoResponseFactory = Factory.define<VInfoResponse>(() => {
  const quantType = faker.helpers.arrayElement(['int8', 'float32', 'float64']);
  const vectorDim = faker.number.int({ min: 1, max: 4096 });

  return {
    raw: [
      'quant-type',
      quantType,
      'hnsw-m',
      '16',
      'vector-dim',
      vectorDim,
      'projection-input-dim',
      '0',
      'size',
      '5',
    ],
    quantType,
    vectorDim,
  };
});
