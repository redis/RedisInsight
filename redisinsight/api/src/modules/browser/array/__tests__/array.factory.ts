import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import {
  ArrayCreationMode,
  ArrayElementDto,
  CreateArrayWithExpireDto,
} from 'src/modules/browser/array/dto';

const arrayKeyName = () => Buffer.from(`array:${faker.string.alphanumeric(6)}`);
const arrayValue = () => Buffer.from(faker.string.alphanumeric(8));

export const arrayElementFactory = Factory.define<ArrayElementDto>(
  ({ sequence }) => ({
    index: `${sequence}`,
    value: arrayValue(),
  }),
);

export const createContiguousArrayDtoFactory =
  Factory.define<CreateArrayWithExpireDto>(() => ({
    keyName: arrayKeyName(),
    mode: ArrayCreationMode.Contiguous,
    startIndex: '0',
    values: [arrayValue(), arrayValue()],
  }));

export const createSparseArrayDtoFactory =
  Factory.define<CreateArrayWithExpireDto>(() => ({
    keyName: arrayKeyName(),
    mode: ArrayCreationMode.Sparse,
    elements: arrayElementFactory.buildList(2),
  }));
