import { HttpHandler } from 'msw'

import recommendations from './recommendationsHandler'
import readRecommendations from './recommendationsReadHandler'

const handlers: HttpHandler[] = [...recommendations, ...readRecommendations]
export default handlers
