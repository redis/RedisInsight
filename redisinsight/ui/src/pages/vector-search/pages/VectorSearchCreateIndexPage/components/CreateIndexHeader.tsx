import React from 'react'

import { Title } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components/base/tooltip'
import { RiIcon } from 'uiSrc/components/base/icons'
import { Row } from 'uiSrc/components/base/layout/flex'

import { CreateIndexMode } from '../VectorSearchCreateIndexPage.types'
import { useCreateIndexPage } from '../../../context/create-index-page'
import { IndexNameEditor } from './IndexNameEditor'
import * as S from '../VectorSearchCreateIndexPage.styles'

const INFO_TOOLTIP =
  'Select a key from the left panel to auto-detect the indexing schema.'

export const CreateIndexHeader = () => {
  const { mode, displayName, indexName, setIndexName, indexNameError, fields } =
    useCreateIndexPage()

  const isSampleData = mode === CreateIndexMode.SampleData
  const hasFields = fields.length > 0

  return (
    <S.TitleRow data-testid="vector-search--create-index--header">
      <Title
        size="M"
        color="primary"
        data-testid="vector-search--create-index--title"
      >
        {isSampleData
          ? `View sample data index: ${displayName}`
          : 'Define search index:'}
      </Title>

      {!isSampleData && !hasFields && (
        <RiTooltip
          position="bottom"
          content={INFO_TOOLTIP}
          data-testid="index-name-info-tooltip"
        >
          <Row align="center" grow={false}>
            <RiIcon
              type="InfoIcon"
              size="l"
              data-testid="index-name-info-icon"
            />
          </Row>
        </RiTooltip>
      )}

      {!isSampleData && hasFields && (
        <IndexNameEditor
          indexName={indexName}
          onNameChange={setIndexName}
          validationError={indexNameError}
        />
      )}
    </S.TitleRow>
  )
}
