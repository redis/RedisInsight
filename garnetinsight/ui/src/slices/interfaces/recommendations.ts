import { Vote } from 'uiSrc/constants/recommendations'
import { Nullable } from 'uiSrc/utils'

export interface IRecommendation {
  id: string
  name: string
  read: boolean
  hide: boolean
  tutorial: string
  vote: Nullable<Vote>
  params: IRecommendationParams
}

export interface IRecommendations {
  recommendations: IRecommendation[]
  totalUnread: number
}

export interface StateRecommendations {
  data: IRecommendations
  loading: boolean
  error: string
  isHighlighted: boolean
  content: IRecommendationsStatic
}

export interface IRecommendationContent {
  type?: string
  value?: any
  parameter?: any
}

export interface IRecommendationsStatic {
  [key: string]: {
    id: string
    title: string
    liveTitle?: string
    telemetryEvent?: string
    redisStack?: boolean
    tutorialId?: string
    content?: IRecommendationContent[]
    badges?: string[]
    deprecated?: boolean
  }
}

export interface IRecommendationParams {
  keys: string[]
}
