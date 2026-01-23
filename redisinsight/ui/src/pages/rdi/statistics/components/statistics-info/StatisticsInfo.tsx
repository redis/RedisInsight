import React from 'react'

import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Text, Title } from 'uiSrc/components/base/text'
import { IStatisticsInfoSection } from 'uiSrc/slices/interfaces'
import VerticalDivider from '../../components/vertical-divider'

import * as S from './StatisticsInfo.styles'

interface Props {
  data: IStatisticsInfoSection
}

const StatisticsInfo = ({ data }: Props) => {
  const { name, data: items } = data

  return (
    <S.Panel>
      <Col gap="l">
        <Title size="S" color="primary">
          {name}
        </Title>
        <Row gap="m" responsive>
          {items.map((item, index) => (
            <React.Fragment key={item.label}>
              {index > 0 && <VerticalDivider />}
              <Row gap="m" responsive>
                <FlexItem>
                  <Text>{item.label}</Text>
                </FlexItem>
                <FlexItem>
                  <Text color="primary">{item.value}</Text>
                </FlexItem>
              </Row>
            </React.Fragment>
          ))}
        </Row>
      </Col>
    </S.Panel>
  )
}

export default StatisticsInfo
