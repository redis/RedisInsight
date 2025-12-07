import { ApiEndpoints } from 'uiSrc/constants'

const getRdiUrl = (...path: string[]) =>
  `/${ApiEndpoints.RDI_INSTANCES}/${path.join('/')}`

export default getRdiUrl
