import { SampleDataContent } from 'uiSrc/pages/vector-search/create-index/types'
import { generateFtCreateCommand } from './generateFtCreateCommand'

describe('generateFtCreateCommand', () => {
  it('returns the expected hardcoded FT.CREATE command for e-commerce discovery', () => {
    const result = generateFtCreateCommand({
      indexName: 'idx:bikes_vss',
      dataContent: SampleDataContent.E_COMMERCE_DISCOVERY,
    })

    expect(result).toBe(`FT.CREATE idx:bikes_vss
    ON HASH
        PREFIX 1 "bikes:"
    SCHEMA
      "model" TEXT NOSTEM SORTABLE
      "brand" TEXT NOSTEM SORTABLE
      "price" NUMERIC SORTABLE
      "type" TAG
      "material" TAG
      "weight" NUMERIC SORTABLE
      "description_embeddings" VECTOR "FLAT" 10
        "TYPE" FLOAT32
        "DIM" 768
        "DISTANCE_METRIC" "L2"
        "INITIAL_CAP" 111
        "BLOCK_SIZE"  111`)
  })

  it('returns the expected hardcoded FT.CREATE command for content recommendations', () => {
    const result = generateFtCreateCommand({
      indexName: 'idx:movies',
      dataContent: SampleDataContent.CONTENT_RECOMMENDATIONS,
    })

    expect(result).toBe(`FT.CREATE idx:movies ON JSON PREFIX 1 "movie:" SCHEMA
  $.title AS title TEXT
  $.genres[*] AS genres TAG
  $.plot AS plot TEXT
  $.year AS year NUMERIC
  $.embedding AS embedding VECTOR FLAT 6
    TYPE FLOAT32
    DIM 8
    DISTANCE_METRIC COSINE`)
  })
})
