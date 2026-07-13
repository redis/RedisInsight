import React from 'react'

import { useTranslation } from 'uiSrc/i18n'
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
import { getSampleDataOptions } from './PickSampleDataModal.constants'
import * as S from './PickSampleDataModal.styles'

const PickSampleDataModal = ({
  isOpen,
  loading,
  selectedDataset,
  onSelectDataset,
  onCancel,
  onSeeIndexDefinition,
  onStartQuerying,
}: PickSampleDataModalProps) => {
  const { t } = useTranslation()

  if (!isOpen) return null

  const hasSelection = selectedDataset !== null
  const sampleDataOptions = getSampleDataOptions()

  return (
    <Modal.Compose open={isOpen}>
      <S.ModalContent persistent onCancel={onCancel}>
        <S.VisuallyHiddenTitle>
          {t('vectorSearch.sampleData.title')}
        </S.VisuallyHiddenTitle>
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
              {t('vectorSearch.sampleData.title')}
            </S.Heading>

            <S.DatasetSection gap="l">
              <S.Subtitle
                size="M"
                color="primary"
                data-testid="pick-sample-data-modal--subtitle"
              >
                {t('vectorSearch.sampleData.subtitle1')}
                <br />
                {t('vectorSearch.sampleData.subtitle2')}
              </S.Subtitle>

              <RiRadioGroupRoot
                value={selectedDataset ?? ''}
                onChange={(value) =>
                  onSelectDataset(value as SampleDataContent)
                }
                data-testid="pick-sample-data-modal--radio-group"
              >
                <S.RadioCardList gap="m">
                  {sampleDataOptions.map((option) => (
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
            {t('vectorSearch.sampleData.cancel')}
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
              {t('vectorSearch.sampleData.seeIndexDefinition')}
            </SecondaryButton>

            <PrimaryButton
              size="large"
              loading={loading}
              disabled={!hasSelection}
              onClick={() => hasSelection && onStartQuerying(selectedDataset)}
              data-testid="pick-sample-data-modal--start-querying"
            >
              {t('vectorSearch.sampleData.startQuerying')}
            </PrimaryButton>
          </S.FooterActions>
        </S.Footer>
      </S.ModalContent>
    </Modal.Compose>
  )
}

export { PickSampleDataModal }
