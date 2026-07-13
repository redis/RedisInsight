import React from 'react'

import { Table } from 'uiSrc/components/base/layout/table'
import { Loader } from 'uiSrc/components/base/display'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { GroupBadge } from 'uiSrc/components'
import { useTranslation } from 'uiSrc/i18n'

import { IndexInfoProps } from './IndexInfo.types'
import { getTableColumns } from './IndexInfo.constants'
import {
  parseIndexAttributes,
  formatOptions,
  hasIndexOptions,
} from './IndexInfo.utils'
import { IndexInfoContainer } from './IndexInfo.styles'
import { formatPrefixes } from 'uiSrc/pages/vector-search/utils'

export const IndexInfo = ({ indexInfo, dataTestId }: IndexInfoProps) => {
  const { t } = useTranslation()

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
          {t('vectorSearch.indexInfo.indexing')}
        </Text>
        <GroupBadge type={keyType} />
        <Text size="s" color="secondary">
          {prefixes
            ? t('vectorSearch.indexInfo.documentsPrefixed', { prefixes })
            : t('vectorSearch.indexInfo.documents')}
        </Text>
      </Row>

      {/* Index Options */}
      <Text
        size="s"
        color="secondary"
        data-testid={`${dataTestId ?? 'index-info'}--options`}
      >
        {t('vectorSearch.indexInfo.options', {
          options: showOptions
            ? formatOptions(indexOptions!)
            : t('vectorSearch.indexInfo.noOptionsFound'),
        })}
      </Text>

      {/* Attributes Table */}
      <Table
        columns={getTableColumns()}
        data={parseIndexAttributes(indexInfo)}
        enableColumnResizing
      />

      {/* Summary Info */}
      <Text
        size="xs"
        color="secondary"
        data-testid={`${dataTestId ?? 'index-info'}--summary`}
      >
        {t('vectorSearch.indexInfo.summary', {
          numDocs: indexInfo.numDocs,
          maxDocId: indexInfo.maxDocId,
          numRecords: indexInfo.numRecords,
          numTerms: indexInfo.numTerms,
        })}
      </Text>
    </IndexInfoContainer>
  )
}
