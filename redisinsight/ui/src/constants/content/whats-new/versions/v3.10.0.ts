import { FeatureFlags } from 'uiSrc/constants/featureFlags'
import { WhatsNewVersion, WhatsNewVersionType } from '../types'

export const version3100: WhatsNewVersion = {
  version: '3.10.0',
  releaseDate: '2026-11-17',
  type: WhatsNewVersionType.Minor,
  cards: [
    {
      id: 'redis-tools',
      title: 'Copilot is retired, try Redis tools',
      body: 'Your own coding agent replaces the Redis Copilot. Run one command, npx @redis/redisctl init, and Redis tools detects your stack and agents, connects your database, teaches your agent Redis, and adds the MCP server.',
      location: 'Page header - Redis tools',
      featureFlag: FeatureFlags.redisTools,
    },
    {
      id: 'security-updates',
      tag: 'Improved',
      title: 'Security updates',
      body: 'Node.js and Electron are updated, including the Docker image, along with a round of dependency updates that pick up the latest security fixes.',
    },
    {
      id: 'more-improvements',
      tag: 'Improved',
      title: 'More improvements and fixes',
      body: 'Search the list of indexes, choose between automatic and notify-only updates, get a warning before editing values in a non-Unicode format, and connect to IPv6 hosts, plus a number of smaller fixes.',
    },
  ],
}
