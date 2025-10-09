export interface RedisearchIndexField {
    name: string
    type: 'TEXT' | 'TAG' | 'NUMERIC' | 'GEO' | 'GEOSHAPE' | 'VECTOR'
}

export interface CreateRedisearchIndexParameters {
    indexName: string
    keyType: 'HASH' | 'JSON'
    prefixes?: string[]
    fields: RedisearchIndexField[]
}
