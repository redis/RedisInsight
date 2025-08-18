// TODO: Since v1 would use predefined data, return a hardcoded command
// instead of generating it dynamically.

type FtCreateCommandParams = {
  indexName: string
  // TODO: this would eventually need to generate schema based on selected fields
  // indexFields: any[]
}

export const generateFtCreateCommand = ({
  indexName,
}: FtCreateCommandParams): string => `FT.CREATE ${indexName}
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
        "BLOCK_SIZE"  111`
