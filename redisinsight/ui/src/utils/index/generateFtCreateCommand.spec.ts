import { generateFtCreateCommand } from './generateFtCreateCommand'

describe('generateFtCreateCommand', () => {
  it('returns the expected hardcoded FT.CREATE command', () => {
    const result = generateFtCreateCommand()

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
})
