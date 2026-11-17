import { WhatsNewVersion, WhatsNewVersionType } from '../types'

export const version360: WhatsNewVersion = {
  version: '3.6.0',
  releaseDate: '2026-06-15',
  type: WhatsNewVersionType.Minor,
  cards: [
    {
      id: 'vector-sets',
      title: 'Vector Sets support',
      body: 'Create Vector Sets (Redis 8) manually or from the bundled vec2word sample, add elements with attributes, and run similarity search in the GUI. Handy for prototyping semantic search.',
      location: 'Browser — add a key of type Vector Set',
    },
    {
      id: 'dev-vs-prod-mode',
      title: 'Dev vs Production database mode',
      body: 'Tag connections as dev or production. Production shows a PROD badge and requires type-to-confirm before destructive actions. Makes it harder to run destructive actions against the wrong database.',
      location: "Database list — edit a database's connection settings",
    },
    {
      id: 'geodata-workbench',
      title: 'Geodata Workbench plugin',
      body: 'GEO results render as a map, heatmap, or details card, auto-selected per command. Verify GEOSEARCH output visually instead of reading raw coordinates.',
      location: 'Workbench — run a GEO command (e.g. GEOSEARCH)',
    },
  ],
}
