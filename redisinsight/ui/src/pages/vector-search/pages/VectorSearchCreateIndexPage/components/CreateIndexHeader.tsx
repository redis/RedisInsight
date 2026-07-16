import React, { useEffect, useRef } from 'react'

import { useTranslation } from 'uiSrc/i18n'
import { Title } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components/base/tooltip'
import { RiIcon } from 'uiSrc/components/base/icons'
import { Row } from 'uiSrc/components/base/layout/flex'

import { CreateIndexMode } from '../VectorSearchCreateIndexPage.types'
import { useCreateIndexPage } from '../../../context/create-index-page'
import { useCreateIndexOnboarding } from '../../../context/create-index-onboarding'
import { CreateIndexOnboardingPopover } from '../../../components/create-index-onboarding'
import { CreateIndexOnboardingStep } from '../../../components/create-index-onboarding/CreateIndexOnboarding.constants'
import { IndexNameEditor } from './IndexNameEditor'
import * as S from '../VectorSearchCreateIndexPage.styles'

export const CreateIndexHeader = () => {
  const { t } = useTranslation()
  const {
    mode,
    displayName,
    indexName,
    setIndexName,
    indexNameError,
    fields,
    isManualCreation,
  } = useCreateIndexPage()
  const { startOnboarding } = useCreateIndexOnboarding()
  const onboardingTriggeredRef = useRef(false)

  const isSampleData = mode === CreateIndexMode.SampleData
  const hasFields = fields.length > 0

  useEffect(() => {
    if (onboardingTriggeredRef.current) return
    if (!isSampleData && hasFields) {
      onboardingTriggeredRef.current = true
      startOnboarding()
    }
  }, [isSampleData, hasFields, startOnboarding])

  return (
    <S.TitleRow data-testid="vector-search--create-index--header">
      <CreateIndexOnboardingPopover
        step={CreateIndexOnboardingStep.DefineIndex}
        anchorPosition="rightCenter"
      >
        <Row align="center" gap="s" grow={false}>
          <Title
            size="M"
            color="primary"
            data-testid="vector-search--create-index--title"
          >
            {isSampleData
              ? t('vectorSearch.createIndex.header.sampleTitle', {
                  name: displayName,
                })
              : t('vectorSearch.createIndex.header.defineTitle')}
          </Title>

          {!isSampleData && !hasFields && !isManualCreation && (
            <RiTooltip
              position="bottom"
              content={t('vectorSearch.createIndex.header.infoTooltip')}
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
        </Row>
      </CreateIndexOnboardingPopover>

      {!isSampleData && (hasFields || isManualCreation) && (
        <IndexNameEditor
          indexName={indexName}
          onNameChange={setIndexName}
          validationError={indexNameError}
        />
      )}
    </S.TitleRow>
  )
}
