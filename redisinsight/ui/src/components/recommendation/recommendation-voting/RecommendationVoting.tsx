import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { userSettingsConfigSelector } from 'uiSrc/slices/user/user-settings'
import { Vote } from 'uiSrc/constants/recommendations'
import { Nullable } from 'uiSrc/utils'

import { Text } from 'uiSrc/components/base/text'
import { Row } from 'uiSrc/components/base/layout/flex'
import VoteOption from './components/vote-option'
import * as S from './RecommendationVoting.styles'

export interface Props {
  vote?: Nullable<Vote>
  name: string
  id?: string
  live?: boolean
  containerClass?: string
}

const RecommendationVoting = ({
  vote,
  name,
  id = '',
  live = false,
  containerClass = '',
}: Props) => {
  const config = useSelector(userSettingsConfigSelector)
  const [popover, setPopover] = useState<string>('')

  return (
    <Row
      align="center"
      className={containerClass}
      gap={live ? 'none' : 'l'}
      data-testid="recommendation-voting"
    >
      <Text size="m">Is this useful?</Text>
      <S.VoteContent>
        {Object.values(Vote).map((option) => (
          <VoteOption
            key={option}
            voteOption={option}
            vote={vote}
            popover={popover}
            isAnalyticsEnable={config?.agreements?.analytics}
            setPopover={setPopover}
            name={name}
            id={id}
            live={live}
          />
        ))}
      </S.VoteContent>
    </Row>
  )
}

export default RecommendationVoting
