import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { IndexSchemaField, IndexConfig, IndexHashKeyData, IndexJsonKeyData } from 'e2eSrc/types';

/**
 * Test prefix for vector search resources
 */
export const TEST_VS_PREFIX = 'test-vs-';

/**
 * Index schema field factory
 *
 * Generates a single field definition for an FT index schema.
 * Default type is 'text'; override for numeric, tag, vector, etc.
 */
export const IndexSchemaFieldFactory = Factory.define<IndexSchemaField>(() => ({
  name: faker.string.alpha(10),
  type: 'text',
}));

/**
 * Index configuration factory
 *
 * Generates a full FT.CREATE-compatible config with a unique name,
 * prefix, and a default 2-field text schema.
 */
export const IndexConfigFactory = Factory.define<IndexConfig>(() => {
  const id = faker.string.alphanumeric(8);
  return {
    indexName: `${TEST_VS_PREFIX}idx-${id}`,
    prefix: `${TEST_VS_PREFIX}${id}:`,
    schema: [
      { name: 'name', type: 'text' },
      { name: 'description', type: 'text' },
    ],
    keyType: 'hash',
  };
});

/**
 * Hash key factory for vector search tests
 *
 * Generates a hash key with fields commonly used in search index testing:
 * name, description, price, category.
 *
 * Pass `keyName` override to set a specific prefix:
 *   IndexHashKeyFactory.build({ keyName: `${prefix}key1` })
 */
export const IndexHashKeyFactory = Factory.define<IndexHashKeyData>(() => ({
  keyName: `${TEST_VS_PREFIX}${faker.string.alphanumeric(8)}:key-${faker.string.alphanumeric(4)}`,
  fields: [
    { field: 'name', value: faker.commerce.productName() },
    { field: 'description', value: faker.commerce.productDescription() },
    { field: 'price', value: `${faker.number.int({ min: 10, max: 1000 })}` },
    { field: 'category', value: faker.commerce.department().toLowerCase() },
  ],
}));

/**
 * JSON key factory for vector search tests
 *
 * Generates a JSON key with fields commonly used in search index testing:
 * name, description, price, category.
 *
 * Pass `keyName` override to set a specific prefix:
 *   IndexJsonKeyFactory.build({ keyName: `${prefix}key1` })
 */
export const IndexJsonKeyFactory = Factory.define<IndexJsonKeyData>(() => ({
  keyName: `${TEST_VS_PREFIX}${faker.string.alphanumeric(8)}:key-${faker.string.alphanumeric(4)}`,
  value: {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: faker.number.int({ min: 10, max: 1000 }),
    category: faker.commerce.department().toLowerCase(),
  },
}));
