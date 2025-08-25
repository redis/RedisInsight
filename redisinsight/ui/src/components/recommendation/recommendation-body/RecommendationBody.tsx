import React from 'react'
import { IRecommendationContent } from 'uiSrc/slices/interfaces/recommendations'
import ContentElement from '../content-element'

export interface Props {
  elements: IRecommendationContent[]
  telemetryName: string
  params?: any
  onLinkClick?: () => void
  insights?: boolean
}

const RecommendationBody = ({ elements = [], ...rest }: Props) => (
  <div>
    {// eslint-disable-next-line react/no-array-index-key
    elements?.map((item, idx) => (
      <ContentElement key={idx} content={item} idx={idx} {...rest} />
    ))}
  </div>
)

export default RecommendationBody
