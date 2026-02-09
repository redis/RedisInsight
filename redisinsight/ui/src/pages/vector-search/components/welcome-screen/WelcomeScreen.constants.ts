import type { Feature } from './WelcomeScreen.types'

export const FEATURES: Feature[] = [
  {
    icon: 'VectorSearchIcon',
    title: 'Full-text search',
    description:
      'Find and filter your data instantly using powerful keyword and field-based queries.',
  },
  {
    icon: 'WorkbenchIcon',
    title: 'Vector search',
    description:
      'Retrieve results by meaning, not just words. Ideal for AI, semantic, and recommendation apps.',
  },
  {
    icon: 'MindmapIcon',
    title: 'Hybrid search',
    description:
      'Combine vector and keyword search for higher accuracy and more relevant results.',
  },
  {
    icon: 'RocketIcon',
    title: 'High performance, low effort',
    description:
      'Built-in quantization and compression deliver blazing speed and efficiency at any scale.',
  },
]

export const TITLE = 'Search your data at in-memory speed'
export const SUBTITLE =
  'Discover how Redis enables full-text and vector search. Fast, simple, and production-ready.'

export const TRY_SAMPLE_DATA_LABEL = 'Try with sample data'
export const USE_MY_DATABASE_LABEL = 'Use data from my database'
