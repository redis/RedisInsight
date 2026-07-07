import { FeatureFlags } from 'uiSrc/constants/featureFlags'
import { WhatsNewVersion, WhatsNewVersionType } from './types'

export const version360: WhatsNewVersion = {
  version: '3.6.0',
  releaseDate: '2026-06-15',
  type: WhatsNewVersionType.Minor,
  cards: [
    {
      id: 'vector-sets',
      title: 'Vector Sets support',
      body: 'Full support for Vector Sets, the Redis 8 vector-native data type: create them manually or from a bundled sample dataset, add elements, and run similarity search end-to-end.',
      location: 'Browser — add a key of type Vector Set',
      featureFlag: FeatureFlags.vectorSet,
    },
    {
      id: 'dev-vs-prod-mode',
      title: 'Dev vs Production database mode',
      body: 'Classify databases by environment with clear visual indicators, and require type-to-confirm for destructive actions on production databases.',
      location: "Database list — edit a database's connection settings",
      featureFlag: FeatureFlags.prodMode,
    },
    {
      id: 'geodata-workbench',
      title: 'Geodata Workbench plugin',
      body: 'Renders Redis GEO command results as an interactive map, density heatmap, or details card — auto-selected per command.',
      location: 'Workbench — run a GEO command (e.g. GEOSEARCH)',
    },
  ],
}
