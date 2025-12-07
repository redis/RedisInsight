import { ApiEndpoints } from 'uiSrc/constants'

const getUrl = (...path: string[]) =>
  `/${ApiEndpoints.DATABASES}/${path.join('/')}`

export default getUrl
