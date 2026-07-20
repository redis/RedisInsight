import { FeatureFlags } from 'uiSrc/constants/featureFlags'
import { WhatsNewVersion, WhatsNewVersionType } from '../types'

export const version380: WhatsNewVersion = {
  version: '3.8.0',
  releaseDate: '2026-07-21',
  type: WhatsNewVersionType.Major,
  cards: [
    {
      id: 'arrays',
      title: 'Support for new Array data type',
      body: "Arrays are a new indexed type in Redis 8.8 where each element's position is meaningful: sensor readings by time, calendar slots by interval, workflow steps by stage. Sparse data stays memory-cheap, and you can search and aggregate server-side instead of pulling everything client-side. In Redis Insight, create Arrays manually or from a sample, then browse, edit, search with AND/OR queries, and aggregate.",
      location: 'Browser — add a key of type Array',
      featureFlag: FeatureFlags.array,
    },
    {
      id: 'ipv4-ipv6-selection',
      tag: 'Improved',
      title: 'IPv4 / IPv6 selection on connection',
      body: 'Pick IPv4 or IPv6 explicitly when connecting to a database. Gives you a reliable connection in environments where one protocol does not resolve correctly.',
      location: 'Database list — add or edit a database connection',
    },
    {
      id: 'markdown-format',
      tag: 'Improved',
      title: 'Markdown value format',
      body: 'View stored values rendered as formatted Markdown, for any key type. Makes documents, notes, and generated content readable without copying them out to another tool.',
      location: 'Key details — switch the value format to Markdown',
    },
  ],
}
