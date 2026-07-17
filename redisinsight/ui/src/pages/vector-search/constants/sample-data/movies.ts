import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import i18n from 'uiSrc/i18n'
import { SampleDatasetConfig } from './types'

export const MOVIES_DATASET: SampleDatasetConfig = {
  displayName: i18n.t('vectorSearch.sampleData.content.label'),
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
      name: i18n.t('vectorSearch.sampleData.movies.query1.name'),
      description: i18n.t('vectorSearch.sampleData.movies.query1.description'),
      query:
        'FT.SEARCH idx:movies_vss "*=>[KNN 3 @embedding $vec AS score]" ' +
        'PARAMS 2 vec "\\x9a\\x99\\x19\\x3f\\xcd\\xcc\\xcc\\x3d\\x9a\\x99\\x4c\\x3f\\x9a\\x99\\x33\\x3e\\x9a\\x99\\x33\\x3f\\xcd\\xcc\\x66\\x3e\\xcd\\xcc\\xcc\\x3d\\xcd\\xcc\\x4c\\x3e" ' +
        'SORTBY score ' +
        'RETURN 3 title plot score ' +
        'DIALECT 2',
    },
    {
      name: i18n.t('vectorSearch.sampleData.movies.query2.name'),
      description: i18n.t('vectorSearch.sampleData.movies.query2.description'),
      query:
        'FT.SEARCH idx:movies_vss "@genres:{Music} =>[KNN 5 @embedding $vec AS score]" ' +
        'PARAMS 2 vec "\\x9a\\x99\\x1d\\x3e\\xcd\\xcc\\x4c\\xbd\\x9a\\x99\\x99\\x3e\\x9a\\x99\\x19\\x3e\\x9a\\x99\\x19\\xbe\\x9a\\x99\\x1d\\x3e\\xcd\\xcc\\x0c\\x3e\\x9a\\x99\\xf1\\xbc" ' +
        'SORTBY score ' +
        'RETURN 4 title year genres score ' +
        'DIALECT 2',
    },
    {
      name: i18n.t('vectorSearch.sampleData.movies.query3.name'),
      description: i18n.t('vectorSearch.sampleData.movies.query3.description'),
      query:
        'FT.SEARCH idx:movies_vss "*=>[KNN 5 @embedding $vec AS score]" ' +
        'PARAMS 2 vec "\\xCD\\xCC\\x56\\x3E\\x9A\\x99\\xF3\\xBC\\xCD\\xCC\\x00\\x3F\\x66\\x66\\x34\\x3E\\xC6\\xF5\\x1B\\xBE\\x9A\\x99\\x4D\\x3E\\x9A\\x99\\x99\\x3D\\x9A\\x99\\xB5\\xBD" ' +
        'SORTBY score ' +
        'RETURN 2 title score ' +
        'DIALECT 2',
    },
    {
      name: i18n.t('vectorSearch.sampleData.movies.query4.name'),
      description: i18n.t('vectorSearch.sampleData.movies.query4.description'),
      query:
        'FT.SEARCH idx:movies_vss "(@genres:{Music} @year:[1970 1979]) =>[KNN 5 @embedding $vec AS score]" ' +
        'PARAMS 2 vec "\\x9a\\x99\\x1d\\x3e\\xcd\\xcc\\x4c\\xbd\\x9a\\x99\\x99\\x3e\\x9a\\x99\\x19\\x3e\\x9a\\x99\\x19\\xbe\\x9a\\x99\\x1d\\x3e\\xcd\\xcc\\x0c\\x3e\\x9a\\x99\\xf1\\xbc" ' +
        'SORTBY score ' +
        'RETURN 4 title year genres score ' +
        'DIALECT 2',
    },
    {
      name: i18n.t('vectorSearch.sampleData.movies.query5.name'),
      description: i18n.t('vectorSearch.sampleData.movies.query5.description'),
      query:
        'FT.SEARCH idx:movies_vss "@genres:{\\"Animated\\"|\\"Sci-Fi\\"} =>[KNN 5 @embedding $vec AS score]" ' +
        'PARAMS 2 vec "\\x9a\\x99\\x1d\\x3e\\xcd\\xcc\\x4c\\xbd\\x9a\\x99\\x99\\x3e\\x9a\\x99\\x19\\x3e\\x9a\\x99\\x19\\xbe\\x9a\\x99\\x1d\\x3e\\xcd\\xcc\\x0c\\x3e\\x9a\\x99\\xf1\\xbc" ' +
        'SORTBY score ' +
        'RETURN 3 title genres score ' +
        'DIALECT 2',
    },
  ],
}
