import React from 'react'

import { Modal } from 'uiSrc/components/base/display'
import { CancelIcon } from 'uiSrc/components/base/icons'
import {
  RiRadioGroupRoot,
  RiRadioGroupItemRoot,
  RiRadioGroupItemIndicator,
} from 'uiSrc/components/base/forms/radio-group/RadioGroup'
import {
  PrimaryButton,
  SecondaryButton,
  EmptyButton,
} from 'uiSrc/components/base/forms/buttons'

import SampleDataModalImg from 'uiSrc/assets/img/vector-search/sample-data-modal-img.svg?react'

import {
  PickSampleDataModalProps,
  SampleDataContent,
} from './PickSampleDataModal.types'
import {
  SAMPLE_DATA_OPTIONS,
  MODAL_TITLE,
  MODAL_SUBTITLE_LINE_1,
  MODAL_SUBTITLE_LINE_2,
  CANCEL_BUTTON_TEXT,
  SEE_INDEX_DEFINITION_BUTTON_TEXT,
  START_QUERYING_BUTTON_TEXT,
} from './PickSampleDataModal.constants'
import * as S from './PickSampleDataModal.styles'

const PickSampleDataModal = ({
  isOpen,
  selectedDataset,
  onSelectDataset,
  onCancel,
  onSeeIndexDefinition,
  onStartQuerying,
}: PickSampleDataModalProps) => {
  if (!isOpen) return null

  const hasSelection = selectedDataset !== null

  return (
    <Modal.Compose open={isOpen}>
      <S.ModalContent persistent onCancel={onCancel}>
        <S.VisuallyHiddenTitle>{MODAL_TITLE}</S.VisuallyHiddenTitle>
        <Modal.Content.Close
          icon={CancelIcon}
          onClick={onCancel}
          data-testid="pick-sample-data-modal--close"
        />
        <S.ModalBody align="center" gap="xxl">
          <S.Illustration data-testid="pick-sample-data-modal--illustration">
            <SampleDataModalImg />
          </S.Illustration>

          <S.ContentSection gap="xxl">
            <S.Heading
              size="XL"
              color="primary"
              data-testid="pick-sample-data-modal--heading"
            >
              {MODAL_TITLE}
            </S.Heading>

            <S.DatasetSection gap="l">
              <S.Subtitle
                size="M"
                color="primary"
                data-testid="pick-sample-data-modal--subtitle"
              >
                {MODAL_SUBTITLE_LINE_1}
                <br />
                {MODAL_SUBTITLE_LINE_2}
              </S.Subtitle>

              <RiRadioGroupRoot
                value={selectedDataset ?? ''}
                onChange={(value) =>
                  onSelectDataset(value as SampleDataContent)
                }
                data-testid="pick-sample-data-modal--radio-group"
              >
                <S.RadioCardList gap="m">
                  {SAMPLE_DATA_OPTIONS.map((option) => (
                    <S.RadioCard
                      key={option.value}
                      $selected={selectedDataset === option.value}
                      data-testid={`pick-sample-data-modal--option-${option.value}`}
                    >
                      <RiRadioGroupItemRoot value={option.value}>
                        <RiRadioGroupItemIndicator />
                      </RiRadioGroupItemRoot>
                      <S.RadioCardContent gap="xs">
                        <S.RadioCardTitle size="M" color="primary">
                          {option.label}
                        </S.RadioCardTitle>
                        <S.RadioCardDescription size="XS" color="secondary">
                          {option.description}
                        </S.RadioCardDescription>
                      </S.RadioCardContent>
                    </S.RadioCard>
                  ))}
                </S.RadioCardList>
              </RiRadioGroupRoot>
            </S.DatasetSection>
          </S.ContentSection>
        </S.ModalBody>

        <S.Footer align="center" justify="between">
          <EmptyButton
            onClick={onCancel}
            data-testid="pick-sample-data-modal--cancel"
          >
            {CANCEL_BUTTON_TEXT}
          </EmptyButton>

          <S.FooterActions align="center" gap="m" justify="end" grow={false}>
            <SecondaryButton
              size="large"
              disabled={!hasSelection}
              onClick={() =>
                hasSelection && onSeeIndexDefinition(selectedDataset)
              }
              data-testid="pick-sample-data-modal--see-index-definition"
            >
              {SEE_INDEX_DEFINITION_BUTTON_TEXT}
            </SecondaryButton>

            <PrimaryButton
              size="large"
              disabled={!hasSelection}
              onClick={() => hasSelection && onStartQuerying(selectedDataset)}
              data-testid="pick-sample-data-modal--start-querying"
            >
              {START_QUERYING_BUTTON_TEXT}
            </PrimaryButton>
          </S.FooterActions>
        </S.Footer>
      </S.ModalContent>
    </Modal.Compose>
  )
}

export { PickSampleDataModal }
