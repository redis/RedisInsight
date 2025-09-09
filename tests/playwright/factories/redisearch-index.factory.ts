import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import {
    CreateRedisearchIndexParameters,
    RedisearchIndexField,
} from '../types/indexes'

export const redisearchIndexFieldFactory = Factory.define<RedisearchIndexField>(
    ({ params }) => ({
        name: params.name ?? faker.word.noun(),
        type:
            params.type ??
            faker.helpers.arrayElement([
                'TEXT',
                'TAG',
                'NUMERIC',
                'GEO',
                'GEOSHAPE',
                'VECTOR',
            ]),
    }),
)

export const redisearchIndexFactory =
    Factory.define<CreateRedisearchIndexParameters>(({ params }) => ({
        indexName: params.indexName ?? faker.word.noun(),
        keyType: params.keyType ?? 'HASH',
        prefixes: params.prefixes ?? [
            `product:${faker.string.alphanumeric({ length: 5 })}:`,
        ],
        fields: params.fields ?? redisearchIndexFieldFactory.buildList(3),
    }))
