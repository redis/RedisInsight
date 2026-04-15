import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import {
  DeleteVectorSetElementsDto,
  DownloadVectorSetEmbeddingDto,
  VectorSetElementDto,
  GetVectorSetElementsDto,
  GetVectorSetElementsResponse,
  SetVectorSetElementAttributeDto,
  GetVectorSetElementAttributeDto,
} from 'src/modules/browser/vector-set/dto';

export const vectorSetElementFactory = Factory.define<VectorSetElementDto>(
  () => ({
    name: Buffer.from(faker.string.alphanumeric(8)),
    vector: Array.from({ length: 3 }, () =>
      parseFloat(
        faker.number.float({ min: 0, max: 1, fractionDigits: 2 }).toFixed(2),
      ),
    ),
    attributes: faker.datatype.boolean()
      ? JSON.stringify({ [faker.string.alpha(5)]: faker.string.alpha(5) })
      : undefined,
  }),
);

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

export const getVectorSetElementAttributeDtoFactory =
  Factory.define<GetVectorSetElementAttributeDto>(() => ({
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
  Factory.define<DownloadVectorSetEmbeddingDto>(() => ({
    keyName: Buffer.from(`vset:${faker.string.alphanumeric(6)}`),
    element: Buffer.from(faker.string.alphanumeric(8)),
  }));

export const getVectorSetElementsResponseFactory =
  Factory.define<GetVectorSetElementsResponse>(({ transientParams }) => {
    const elements =
      transientParams.elements ?? vectorSetElementFactory.buildList(3);

    return {
      keyName: Buffer.from(`vset:${faker.string.alphanumeric(6)}`),
      total: elements.length,
      nextCursor: undefined,
      isPaginationSupported: true,
      elements,
    };
  });
