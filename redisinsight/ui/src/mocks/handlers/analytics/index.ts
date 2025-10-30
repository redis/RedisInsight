import { HttpHandler } from 'msw'

import clusterDetails from './clusterDetailsHandlers'
import dbAnalysisHistory from './dbAnalysisHistoryHandlers'

const handlers: HttpHandler[] = [...clusterDetails, ...dbAnalysisHistory]
export default handlers
