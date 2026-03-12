import React from 'react'

import { Modal } from 'uiSrc/components/base/display'
import { Text } from 'uiSrc/components/base/text'
import {
  SecondaryButton,
  PrimaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { CancelIcon } from 'uiSrc/components/base/icons'
import { Row } from 'uiSrc/components/base/layout/flex'

import MakeSearchableImg from 'uiSrc/assets/img/vector-search/make-searchable-modal-img.svg?react'

import { MakeSearchableModalProps } from './MakeSearchableModal.types'
import * as S from './MakeSearchableModal.styles'

const TEST_ID = 'make-searchable-modal'

export const MakeSearchableModal = ({
  isOpen,
  prefix,
  onConfirm,
  onCancel,
}: MakeSearchableModalProps) => {
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
            <MakeSearchableImg />
          </S.Illustration>

          <S.Heading
            size="XL"
            color="primary"
            data-testid={`${TEST_ID}-heading`}
          >
            Make this data searchable
          </S.Heading>
        </S.Header>

        <S.Description color="secondary" data-testid={`${TEST_ID}-body`}>
          We&rsquo;ll take you to the Search workspace to set up the index.
          {prefix && (
            <>
              {' '}
              All keys starting with{' '}
              <Text color="secondary" variant="semiBold" component="span">
                {prefix}
              </Text>{' '}
              will be included.
            </>
          )}{' '}
          You can review and adjust the schema before creating the index.
        </S.Description>

        <Modal.Content.Footer.Compose>
          <Row gap="m" justify="end">
            <SecondaryButton
              size="large"
              onClick={onCancel}
              data-testid={`${TEST_ID}-cancel`}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              size="large"
              onClick={onConfirm}
              data-testid={`${TEST_ID}-confirm`}
            >
              Continue
            </PrimaryButton>
          </Row>
        </Modal.Content.Footer.Compose>
      </S.ModalContent>
    </Modal.Compose>
  )
}
