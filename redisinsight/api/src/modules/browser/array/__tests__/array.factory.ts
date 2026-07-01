import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import {
  AggregateArrayDto,
  ArrayAggregateOperation,
  ArrayCreationMode,
  ArrayElementDto,
  ArrayGrepCriteria,
  CreateArrayWithExpireDto,
  DeleteArrayElementsDto,
  DeleteArrayRangeDto,
  GetArraySearchDto,
  GetArraySearchResponse,
  SetArrayElementDto,
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

export const setArrayElementDtoFactory = Factory.define<SetArrayElementDto>(
  () => ({
    keyName: arrayKeyName(),
    index: '0',
    value: arrayValue(),
  }),
);

export const aggregateArrayDtoFactory = Factory.define<AggregateArrayDto>(
  () => ({
    keyName: arrayKeyName(),
    start: '0',
    end: '6',
    operation: ArrayAggregateOperation.Sum,
  }),
);

export const getArraySearchDtoFactory = Factory.define<GetArraySearchDto>(
  () => ({
    keyName: arrayKeyName(),
    predicates: [{ criteria: ArrayGrepCriteria.Match, value: '21.4' }],
  }),
);

// Defaults match mockArraySearchReplyWithValues; build with the search DTO's
// keyName so the echoed response key lines up.
export const getArraySearchResponseFactory =
  Factory.define<GetArraySearchResponse>(() => ({
    keyName: arrayKeyName(),
    elements: [
      { index: '5', value: Buffer.from('21.4') },
      { index: '6', value: Buffer.from('21.9') },
    ],
  }));

export const deleteArrayElementsDtoFactory =
  Factory.define<DeleteArrayElementsDto>(() => ({
    keyName: arrayKeyName(),
    indexes: ['0'],
  }));

export const deleteArrayRangeDtoFactory = Factory.define<DeleteArrayRangeDto>(
  () => ({
    keyName: arrayKeyName(),
    start: '0',
    end: '3',
  }),
);
