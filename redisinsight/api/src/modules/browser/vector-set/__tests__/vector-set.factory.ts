import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import {
  AddElementsToVectorSetDto,
  AddVectorSetElementDto,
  CreateVectorSetDto,
  DeleteVectorSetElementsDto,
  VectorSetElementDetailsDto,
  VectorSetElementKeyDto,
  GetVectorSetElementsDto,
  GetVectorSetElementsResponse,
  SetVectorSetElementAttributeDto,
} from 'src/modules/browser/vector-set/dto';

export const vectorSetElementFactory =
  Factory.define<VectorSetElementDetailsDto>(() => ({
    name: Buffer.from(faker.string.alphanumeric(8)),
    vector: Array.from({ length: 3 }, () =>
      parseFloat(
        faker.number.float({ min: 0, max: 1, fractionDigits: 2 }).toFixed(2),
      ),
    ),
    attributes: faker.datatype.boolean()
      ? JSON.stringify({ [faker.string.alpha(5)]: faker.string.alpha(5) })
      : undefined,
  }));

export const getVectorSetElementsDtoFactory =
  Factory.define<GetVectorSetElementsDto>(() => ({
    keyName: Buffer.from(`vset:${faker.string.alphanumeric(6)}`),
    start: '-',
    end: '+',
    count: faker.number.int({ min: 1, max: 100 }),
  }));

export const deleteVectorSetElementsDtoFactory =
  Factory.define<DeleteVectorSetElementsDto>(() => ({
    keyName: Buffer.from(`vset:${faker.string.alphanumeric(6)}`),
    elements: [
      Buffer.from(faker.string.alphanumeric(8)),
      Buffer.from(faker.string.alphanumeric(8)),
    ],
  }));

export const getVectorSetElementDetailsDtoFactory =
  Factory.define<VectorSetElementKeyDto>(() => ({
    keyName: Buffer.from(`vset:${faker.string.alphanumeric(6)}`),
    element: Buffer.from(faker.string.alphanumeric(8)),
  }));

export const setVectorSetElementAttributeDtoFactory =
  Factory.define<SetVectorSetElementAttributeDto>(() => ({
    keyName: Buffer.from(`vset:${faker.string.alphanumeric(6)}`),
    element: Buffer.from(faker.string.alphanumeric(8)),
    attributes: JSON.stringify({
      [faker.string.alpha(5)]: faker.string.alpha(5),
    }),
  }));

export const downloadVectorSetEmbeddingDtoFactory =
  Factory.define<VectorSetElementKeyDto>(() => ({
    keyName: Buffer.from(`vset:${faker.string.alphanumeric(6)}`),
    element: Buffer.from(faker.string.alphanumeric(8)),
  }));

export const addVectorSetElementDtoFactory =
  Factory.define<AddVectorSetElementDto>(() => ({
    name: Buffer.from(faker.string.alphanumeric(8)),
    vector: Array.from({ length: 3 }, () =>
      parseFloat(
        faker.number.float({ min: 0, max: 1, fractionDigits: 2 }).toFixed(2),
      ),
    ),
  }));

export const addElementsToVectorSetDtoFactory =
  Factory.define<AddElementsToVectorSetDto>(() => ({
    keyName: Buffer.from(`vset:${faker.string.alphanumeric(6)}`),
    elements: addVectorSetElementDtoFactory.buildList(2),
  }));

export const createVectorSetDtoFactory = Factory.define<CreateVectorSetDto>(
  () => ({
    keyName: Buffer.from(`vset:${faker.string.alphanumeric(6)}`),
    elements: addVectorSetElementDtoFactory.buildList(2),
  }),
);

export const getVectorSetElementsResponseFactory =
  Factory.define<GetVectorSetElementsResponse>(({ transientParams }) => {
    const elementNames =
      transientParams.elementNames ??
      vectorSetElementFactory.buildList(3).map((el) => el.name);

    return {
      keyName: Buffer.from(`vset:${faker.string.alphanumeric(6)}`),
      total: elementNames.length,
      nextCursor: undefined,
      isPaginationSupported: true,
      elementNames,
    };
  });
