import React from 'react'

import { useTranslation } from 'uiSrc/i18n'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { RiTooltip } from 'uiSrc/components/base/tooltip'
import { CallOut } from 'uiSrc/components/base/display'
import { RiIcon } from 'uiSrc/components/base/icons'
import { Row } from 'uiSrc/components/base/layout/flex'

import { useCreateIndexPage } from '../../../context/create-index-page'
import * as S from '../VectorSearchCreateIndexPage.styles'

export const CreateIndexFooter = () => {
  const { t } = useTranslation()
  const {
    loading,
    isCreateDisabled,
    createDisabledReason,
    skippedFields,
    handleCreateIndex,
    handleCancel,
  } = useCreateIndexPage()

  return (
    <S.FooterRow
      align="center"
      justify="between"
      data-testid="vector-search--create-index--footer"
    >
      {skippedFields.length > 0 ? (
        <CallOut
          variant="notice"
          data-testid="vector-search--create-index--skipped-fields-banner"
        >
          <Row align="center" gap="s">
            <RiIcon type="InfoIcon" size="s" />
            <span>
              {t('vectorSearch.createIndex.footer.skippedFields', {
                count: skippedFields.length,
                name: skippedFields[0],
                list: skippedFields.join(', '),
              })}
            </span>
          </Row>
        </CallOut>
      ) : (
        <span />
      )}

      <Row gap="s" grow={false}>
        <SecondaryButton
          onClick={handleCancel}
          data-testid="vector-search--create-index--cancel-btn"
        >
          {t('vectorSearch.createIndex.footer.cancel')}
        </SecondaryButton>

        <RiTooltip
          content={createDisabledReason}
          data-testid="vector-search--create-index--submit-tooltip"
        >
          <PrimaryButton
            loading={loading}
            disabled={isCreateDisabled}
            onClick={handleCreateIndex}
            data-testid="vector-search--create-index--submit-btn"
          >
            {t('vectorSearch.createIndex.footer.createIndex')}
          </PrimaryButton>
        </RiTooltip>
      </Row>
    </S.FooterRow>
  )
}
