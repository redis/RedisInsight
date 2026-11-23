import { WhatsNewVersion, WhatsNewVersionType } from '../types'

export const version3102: WhatsNewVersion = {
  version: '3.10.2',
  releaseDate: '2026-11-17',
  type: WhatsNewVersionType.Patch,
  cards: [
    {
      id: 'tls-cluster-hostnames',
      tag: 'Improved',
      title: 'TLS cluster connections',
      body: 'Fixed connecting to TLS clusters with hostname-only certificates.',
    },
  ],
}
