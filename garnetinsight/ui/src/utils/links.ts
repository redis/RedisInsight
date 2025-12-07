import { UTM_MEDIUMS } from 'uiSrc/constants/links'
import { Instance } from 'uiSrc/slices/interfaces'

export interface UTMParams {
  source?: string
  medium?: string
  campaign: string
}

export const getUtmExternalLink = (baseUrl: string, params: UTMParams) => {
  const { source = 'garnetinsight', medium = UTM_MEDIUMS.App, campaign } = params
  try {
    const url = new URL(baseUrl)
    url.searchParams.append('utm_source', source)
    url.searchParams.append('utm_medium', medium)
    url.searchParams.append('utm_campaign', campaign)
    return url.toString()
  } catch (e) {
    return baseUrl
  }
}

const RI_PROTOCOL_SCHEMA = 'garnetinsight://'

export const buildGarnetinsightUrl = (instanceData: Instance) => {
  if (!instanceData) {
    return ''
  }

  const endpoint = `${instanceData.host}:${instanceData.port}`
  const dbUrl = `redis://@${endpoint}`

  const params: Record<string, string> = {
    redisUrl: dbUrl,
    cloudBdbId: instanceData.cloudDetails?.cloudId?.toString() || '',
    databaseAlias: instanceData.name || '',
  }

  if (instanceData.tls) {
    params.requiredTls = 'true'
    params.requiredCaCert = 'true'
  }

  if (instanceData.tlsClientAuthRequired) {
    params.requiredClientCert = 'true'
  }

  if (instanceData.cloudDetails) {
    params.subscriptionType = instanceData.cloudDetails.subscriptionType || ''
    params.planMemoryLimit =
      instanceData.cloudDetails?.planMemoryLimit?.toString() || ''
    params.memoryLimitMeasurementUnit =
      instanceData.cloudDetails?.memoryLimitMeasurementUnit || ''
    if (instanceData.cloudDetails.free) {
      params.free = 'true'
    }
  }

  return `${RI_PROTOCOL_SCHEMA}databases/connect${appendParams(params)}`
}

const appendParams = (params: Record<string, string>) => {
  const searchParams = new URLSearchParams(params)
  return `?${searchParams.toString()}`
}
