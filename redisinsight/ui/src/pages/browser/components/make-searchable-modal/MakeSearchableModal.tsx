import React from 'react'
import { useTheme } from '@redis-ui/styles'

import { Modal } from 'uiSrc/components/base/display'
import { Text } from 'uiSrc/components/base/text'
import {
  SecondaryButton,
  PrimaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { CancelIcon } from 'uiSrc/components/base/icons'
import { Row } from 'uiSrc/components/base/layout/flex'

import { Trans, useTranslation, escapeTrans } from 'uiSrc/i18n'

import MakeSearchableImg from 'uiSrc/assets/img/vector-search/make-searchable-modal-img.svg?react'
import MakeSearchableImgDark from 'uiSrc/assets/img/vector-search/make-searchable-modal-img-dark.svg?react'

import { MakeSearchableModalProps } from './MakeSearchableModal.types'
import * as S from './MakeSearchableModal.styles'

const TEST_ID = 'make-searchable-modal'

export const MakeSearchableModal = ({
  isOpen,
  prefix,
  onConfirm,
  onCancel,
}: MakeSearchableModalProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const Illustration =
    theme.name === 'dark' ? MakeSearchableImgDark : MakeSearchableImg

  if (!isOpen) return null

  return (
    <Modal.Compose open={isOpen}>
      <S.ModalContent persistent onCancel={onCancel}>
        <Modal.Content.Close
          icon={CancelIcon}
          onClick={onCancel}
          data-testid={`${TEST_ID}-close`}
        />

        <S.Header>
          <S.Illustration>
            <Illustration />
          </S.Illustration>

          <S.Heading
            size="XL"
            color="primary"
            data-testid={`${TEST_ID}-heading`}
          >
            {t('browser.makeSearchable.title')}
          </S.Heading>
        </S.Header>

        <S.Description color="secondary" data-testid={`${TEST_ID}-body`}>
          {t('browser.makeSearchable.description.intro')}
          {prefix != null && (
            <>
              {' '}
              <Trans
                i18nKey="browser.makeSearchable.description.prefix"
                values={{ prefix: escapeTrans(prefix) }}
                components={{
                  bold: (
                    <Text color="secondary" variant="semiBold" component="span">
                      {''}
                    </Text>
                  ),
                }}
              />
            </>
          )}{' '}
          {t('browser.makeSearchable.description.outro')}
        </S.Description>

        <Modal.Content.Footer.Compose>
          <Row gap="m" justify="end">
            <SecondaryButton
              size="large"
              onClick={onCancel}
              data-testid={`${TEST_ID}-cancel`}
            >
              {t('browser.makeSearchable.button.cancel')}
            </SecondaryButton>
            <PrimaryButton
              size="large"
              onClick={onConfirm}
              data-testid={`${TEST_ID}-confirm`}
            >
              {t('browser.makeSearchable.button.continue')}
            </PrimaryButton>
          </Row>
        </Modal.Content.Footer.Compose>
      </S.ModalContent>
    </Modal.Compose>
  )
}
