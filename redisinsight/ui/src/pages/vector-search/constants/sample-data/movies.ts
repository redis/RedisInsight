import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { SampleDatasetConfig } from './types'

export const MOVIES_DATASET: SampleDatasetConfig = {
  displayName: 'Content recommendations',
  indexName: 'idx:movies_vss',
  indexPrefix: 'movie:',
  collectionName: 'movies',
  fields: [
    { id: 'title', name: 'title', value: 'Toy Story', type: FieldTypes.TEXT },
    {
      id: 'genres',
      name: 'genres',
      value: 'Animation, Comedy, Family',
      type: FieldTypes.TAG,
    },
    {
      id: 'plot',
      name: 'plot',
      value: 'Toys come to life when humans arent around.',
      type: FieldTypes.TEXT,
    },
    { id: 'year', name: 'year', value: 1995, type: FieldTypes.NUMERIC },
    {
      id: 'embedding',
      name: 'embedding',
      value: 'FLAT, FLOAT32, 8, COSINE',
      type: FieldTypes.VECTOR,
    },
  ],
  sampleQueries: [
    {
      name: 'Basic plot similarity search',
      description:
        'Performs a K-nearest neighbors search to find movies with plot embeddings most similar to the query vector. Returns the top 3 matches with title, plot, and similarity score. Demonstrates pure semantic search—Toy Story ranks first based on meaning, not keyword matches.',
      query:
        'FT.SEARCH idx:movies_vss "*=>[KNN 3 @embedding $vec AS score]" ' +
        'PARAMS 2 vec "\\x9a\\x99\\x19\\x3f\\xcd\\xcc\\xcc\\x3d\\x9a\\x99\\x4c\\x3f\\x9a\\x99\\x33\\x3e\\x9a\\x99\\x33\\x3f\\xcd\\xcc\\x66\\x3e\\xcd\\xcc\\xcc\\x3d\\xcd\\xcc\\x4c\\x3e" ' +
        'SORTBY score ' +
        'RETURN 3 title plot score ' +
        'DIALECT 2',
    },
    {
      name: 'Genre-filtered semantic search',
      description:
        'Combines a genre tag filter with vector similarity to find music-related movies matching "A feel-good film about music and students." Pre-filters to the Music genre before running KNN, showing how hybrid search improves relevance by narrowing candidates.',
      query:
        'FT.SEARCH idx:movies_vss "@genres:{Music} =>[KNN 5 @embedding $vec AS score]" ' +
        'PARAMS 2 vec "\\x9a\\x99\\x1d\\x3e\\xcd\\xcc\\x4c\\xbd\\x9a\\x99\\x99\\x3e\\x9a\\x99\\x19\\x3e\\x9a\\x99\\x19\\xbe\\x9a\\x99\\x1d\\x3e\\xcd\\xcc\\x0c\\x3e\\x9a\\x99\\xf1\\xbc" ' +
        'SORTBY score ' +
        'RETURN 4 title year genres score ' +
        'DIALECT 2',
    },
    {
      name: 'Retrieve document embedding',
      description:
        'Extracts the stored embedding vector from an existing movie document (Inception). This vector can then be used as input for a "more like this" recommendation query, enabling content-based recommendations without regenerating embeddings.',
      query:
        'FT.SEARCH idx:movies_vss "*=>[KNN 5 @embedding $vec AS score]" ' +
        'PARAMS 2 vec "\\xCD\\xCC\\x56\\x3E\\x9A\\x99\\xF3\\xBC\\xCD\\xCC\\x00\\x3F\\x66\\x66\\x34\\x3E\\xC6\\xF5\\x1B\\xBE\\x9A\\x99\\x4D\\x3E\\x9A\\x99\\x99\\x3D\\x9A\\x99\\xB5\\xBD" ' +
        'SORTBY score ' +
        'RETURN 2 title score ' +
        'DIALECT 2',
    },
    {
      name: 'Multi-filter hybrid search',
      description:
        "Combines multiple metadata filters (genre: Music, year: 1970–1979) with vector similarity search. Finds classic 70s music films matching the query's semantic intent, showing how numeric ranges and tag filters work seamlessly with KNN.",
      query:
        'FT.SEARCH idx:movies_vss "(@genres:{Music} @year:[1970 1979]) =>[KNN 5 @embedding $vec AS score]" ' +
        'PARAMS 2 vec "\\x9a\\x99\\x1d\\x3e\\xcd\\xcc\\x4c\\xbd\\x9a\\x99\\x99\\x3e\\x9a\\x99\\x19\\x3e\\x9a\\x99\\x19\\xbe\\x9a\\x99\\x1d\\x3e\\xcd\\xcc\\x0c\\x3e\\x9a\\x99\\xf1\\xbc" ' +
        'SORTBY score ' +
        'RETURN 4 title year genres score ' +
        'DIALECT 2',
    },
    {
      name: 'Personalized multi-genre search',
      description:
        'Filters results to user-preferred genres (Animated OR Sci-Fi) before running vector similarity. Demonstrates personalization—narrowing recommendations to categories the user enjoys while still ranking by semantic relevance.',
      query:
        'FT.SEARCH idx:movies_vss "@genres:{\\"Animated\\"|\\"Sci-Fi\\"} =>[KNN 5 @embedding $vec AS score]" ' +
        'PARAMS 2 vec "\\x9a\\x99\\x1d\\x3e\\xcd\\xcc\\x4c\\xbd\\x9a\\x99\\x99\\x3e\\x9a\\x99\\x19\\x3e\\x9a\\x99\\x19\\xbe\\x9a\\x99\\x1d\\x3e\\xcd\\xcc\\x0c\\x3e\\x9a\\x99\\xf1\\xbc" ' +
        'SORTBY score ' +
        'RETURN 3 title genres score ' +
        'DIALECT 2',
    },
  ],
}
