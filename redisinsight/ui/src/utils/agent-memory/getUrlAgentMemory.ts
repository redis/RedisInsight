import { ApiEndpoints } from 'uiSrc/constants'

export const getAgentMemoryUrl = (...path: string[]) =>
  `/${ApiEndpoints.AGENT_MEMORY_ENDPOINTS}/${path.join('/')}`
