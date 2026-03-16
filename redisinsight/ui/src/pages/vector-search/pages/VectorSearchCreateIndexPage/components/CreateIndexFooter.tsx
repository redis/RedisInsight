import React from 'react'

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
              {skippedFields.length === 1
                ? `Field "${skippedFields[0]}" was removed — nested objects and arrays cannot be indexed directly.`
                : `${skippedFields.length} fields were removed (${skippedFields.join(', ')}) — nested objects and arrays cannot be indexed directly.`}
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
          Cancel
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
            Create index
          </PrimaryButton>
        </RiTooltip>
      </Row>
    </S.FooterRow>
  )
}
