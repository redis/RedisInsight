import React from 'react'

import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Section } from '@redis-ui/components'
import { Text } from 'uiSrc/components/base/text'
import { IStatisticsBlocksSection } from 'uiSrc/slices/interfaces'
import VerticalDivider from '../../components/vertical-divider'

import * as S from './StatisticsBlocks.styles'

interface Props {
  data: IStatisticsBlocksSection
}

const StatisticsBlocks = ({ data }: Props) => {
  const { name, data: blocks } = data

  // Split blocks into 3 columns, only showing columns that have items
  const itemsPerColumn = Math.ceil(blocks.length / 3)
  const columns = [
    blocks.slice(0, itemsPerColumn),
    blocks.slice(itemsPerColumn, itemsPerColumn * 2),
    blocks.slice(itemsPerColumn * 2),
  ].filter((col) => col.length > 0)

  return (
    <Section
      collapsible
      defaultOpen
      id={name.toLowerCase()}
      label={name}
      content={
        <Row responsive gap="s" align="start">
          {columns.flatMap((columnBlocks, columnIndex) => [
            columnIndex > 0 && <VerticalDivider key={`divider-${columnIndex}`} />,
            <FlexItem key={columnIndex} grow>
              <Col gap="s">
                {columnBlocks.map((block) => (
                  <S.InfoPanel key={block.label} grow>
                    <Row gap="m" responsive align="center">
                      <FlexItem grow>
                        <Text>{block.label}</Text>
                      </FlexItem>
                      <FlexItem>
                        <Text color="primary">{block.value}</Text>
                      </FlexItem>
                      <FlexItem style={{ minWidth: 40 }}>
                        <Text size="s" color="ghost">
                          {block.units}
                        </Text>
                      </FlexItem>
                    </Row>
                  </S.InfoPanel>
                ))}
              </Col>
            </FlexItem>,
          ])}
        </Row>
      }
    />
  )
}

export default StatisticsBlocks
