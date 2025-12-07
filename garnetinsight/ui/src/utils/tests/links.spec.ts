import {
  getUtmExternalLink,
  buildGarnetinsightUrl,
  UTMParams,
} from 'uiSrc/utils/links'
import { Instance } from 'uiSrc/slices/interfaces'

const addUtmToLinkTests: Array<{
  input: [string, UTMParams]
  expected: string
}> = [
  {
    input: ['http://www.google.com', { campaign: 'name' }],
    expected:
      'http://www.google.com/?utm_source=garnetinsight&utm_medium=app&utm_campaign=name',
  },
  {
    input: ['http://www.google.com', { campaign: 'name', medium: 'main' }],
    expected:
      'http://www.google.com/?utm_source=garnetinsight&utm_medium=main&utm_campaign=name',
  },
  {
    input: [
      'http://www.google.com',
      { campaign: 'name', medium: 'main', source: 'source' },
    ],
    expected:
      'http://www.google.com/?utm_source=source&utm_medium=main&utm_campaign=name',
  },
]

describe('getUtmExternalLink', () => {
  test.each(addUtmToLinkTests)('%j', ({ input, expected }) => {
    const result = getUtmExternalLink(...input)
    expect(result).toEqual(expected)
  })
})

const buildGarnetinsightUrlTests: Array<{
  input: Instance
  expected: string
}> = [
  {
    input: {
      id: '0',
      host: 'aws-instance.amazonaws.com',
      port: 6379,
      name: 'free aws instance',
      tls: false,
      tlsClientAuthRequired: false,
      modules: [],
      version: '1.0.0',
      cloudDetails: {
        subscriptionId: 1,
        cloudId: 1,
        subscriptionType: 'fixed',
        planMemoryLimit: 1024,
        memoryLimitMeasurementUnit: 'MB',
        free: true,
      },
    },
    expected:
      'garnetinsight://databases/connect?redisUrl=redis%3A%2F%2F%40aws-instance.amazonaws.com%3A6379&cloudBdbId=1&databaseAlias=free+aws+instance&subscriptionType=fixed&planMemoryLimit=1024&memoryLimitMeasurementUnit=MB&free=true',
  },
  {
    input: {
      id: '1',
      host: '127.0.0.1',
      port: 6380,
      name: 'cert localhost instance',
      tls: true,
      tlsClientAuthRequired: true,
      modules: [],
      version: '1.0.0',
    },
    expected:
      'garnetinsight://databases/connect?redisUrl=redis%3A%2F%2F%40127.0.0.1%3A6380&cloudBdbId=&databaseAlias=cert+localhost+instance&requiredTls=true&requiredCaCert=true&requiredClientCert=true',
  },
  {
    input: {
      id: '2',
      host: 'gcp-instance.example.com',
      port: 6379,
      name: 'mixed cert gcp instance',
      tls: true,
      tlsClientAuthRequired: false,
      modules: [],
      version: '1.0.0',
      cloudDetails: {
        subscriptionId: 2,
        cloudId: 2,
        subscriptionType: 'fixed',
        planMemoryLimit: 2048,
        memoryLimitMeasurementUnit: 'MB',
      },
    },
    expected:
      'garnetinsight://databases/connect?redisUrl=redis%3A%2F%2F%40gcp-instance.example.com%3A6379&cloudBdbId=2&databaseAlias=mixed+cert+gcp+instance&requiredTls=true&requiredCaCert=true&subscriptionType=fixed&planMemoryLimit=2048&memoryLimitMeasurementUnit=MB',
  },
]

describe('buildGarnetinsightUrl', () => {
  test.each(buildGarnetinsightUrlTests)('%j', ({ input, expected }) => {
    const result = buildGarnetinsightUrl(input)
    expect(result).toEqual(expected)
  })
})
