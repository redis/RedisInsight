import React from 'react'

import { Table } from 'uiSrc/components/base/layout/table'
import { Loader } from 'uiSrc/components/base/display'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { GroupBadge } from 'uiSrc/components'

import { IndexInfoProps } from './IndexInfo.types'
import { TABLE_COLUMNS } from './IndexInfo.constants'
import {
  parseIndexAttributes,
  formatOptions,
  hasIndexOptions,
} from './IndexInfo.utils'
import { IndexInfoContainer } from './IndexInfo.styles'
import { formatPrefixes } from 'uiSrc/pages/vector-search/utils'

export const IndexInfo = ({ indexInfo, dataTestId }: IndexInfoProps) => {
  if (!indexInfo) {
    return (
      <Loader size="xl" data-testid={`${dataTestId ?? 'index-info'}--loader`} />
    )
  }

  const { indexDefinition, indexOptions } = indexInfo
  const prefixes = formatPrefixes(indexDefinition.prefixes)
  const keyType = indexDefinition.keyType
  const showOptions = hasIndexOptions(indexOptions)

  return (
    <IndexInfoContainer gap="s" data-testid={dataTestId ?? 'index-info'}>
      {/* Index Definition Header */}
      <Row
        gap="s"
        align="center"
        data-testid={`${dataTestId ?? 'index-info'}--definition`}
      >
        <Text size="s" color="secondary">
          Indexing
        </Text>
        <GroupBadge type={keyType} />
        <Text size="s" color="secondary">
          documents{prefixes && ` prefixed by ${prefixes}`}.
        </Text>
      </Row>

      {/* Index Options */}
      <Text
        size="s"
        color="secondary"
        data-testid={`${dataTestId ?? 'index-info'}--options`}
      >
        Options:{' '}
        {showOptions ? formatOptions(indexOptions!) : 'no options found'}
      </Text>

      {/* Attributes Table */}
      <Table columns={TABLE_COLUMNS} data={parseIndexAttributes(indexInfo)} />

      {/* Summary Info */}
      <Text
        size="xs"
        color="secondary"
        data-testid={`${dataTestId ?? 'index-info'}--summary`}
      >
        Number of docs: {indexInfo.numDocs} (max {indexInfo.maxDocId}) | Number
        of records: {indexInfo.numRecords} | Number of terms:{' '}
        {indexInfo.numTerms}
      </Text>
    </IndexInfoContainer>
  )
}
