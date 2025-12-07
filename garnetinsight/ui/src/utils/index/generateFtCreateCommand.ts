// TODO: Since v1 would use predefined data, return a hardcoded command
// instead of generating it dynamically.

import { SampleDataContent } from 'uiSrc/pages/vector-search/create-index/types'

type FtCreateCommandParams = {
  indexName: string
  dataContent: SampleDataContent
  // TODO: this would eventually need to generate schema based on selected fields
  // indexFields: any[]
}

export const generateFtCreateCommand = ({
  indexName,
  dataContent,
}: FtCreateCommandParams): string => {
  if (dataContent === SampleDataContent.CONTENT_RECOMMENDATIONS) {
    return `FT.CREATE ${indexName}
    ON JSON
      PREFIX 1 "movie:"
    SCHEMA
      $.title AS title TEXT
      $.genres[*] AS genres TAG
      $.plot AS plot TEXT
      $.year AS year NUMERIC
      $.embedding AS embedding VECTOR FLAT 6
        TYPE FLOAT32
        DIM 8
        DISTANCE_METRIC COSINE`
  }

  return `FT.CREATE ${indexName}
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
}
