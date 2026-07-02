import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Modal } from 'uiSrc/components/base/display'
import { Text } from 'uiSrc/components/base/text'
import { PrimaryButton, SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { CancelIcon } from 'uiSrc/components/base/icons'
import { Row, Col } from 'uiSrc/components/base/layout/flex'
import { TooltipProvider } from '@redis-ui/components'

import { createEmptyDecoder, VALUE_DECODER_TEST_ID } from './constants'
import { DecoderEditor } from './DecoderEditor'
import {
  areDecodersValid,
  getDecoderLabel,
  normalizeRule,
} from './schemaUtils'
import { ValueDecoderRule } from './types'
import { findMatchingDecoderRule, getDefaultKeyPattern, matchKeyPattern } from './utils'
import * as S from './ValueDecoderModal.styles'

export interface ValueDecoderModalConfig {
  keyName: string
}

export interface ValueDecoderModalProps {
  isOpen: boolean
  decoders: ValueDecoderRule[]
  config: ValueDecoderModalConfig | null
  onSave: (decoders: ValueDecoderRule[]) => void
  onCancel: () => void
}

const buildInitialDecoders = (
  decoders: ValueDecoderRule[],
  keyName: string,
): ValueDecoderRule[] => {
  const normalized = decoders.map(normalizeRule)
  if (normalized.length > 0) {
    return normalized
  }
  return [createEmptyDecoder(keyName ? getDefaultKeyPattern(keyName) : '')]
}

export const ValueDecoderModal = ({
  isOpen,
  decoders,
  config,
  onSave,
  onCancel,
}: ValueDecoderModalProps) => {
  const keyName = config?.keyName ?? ''
  const [localDecoders, setLocalDecoders] = useState<ValueDecoderRule[]>(() =>
    buildInitialDecoders(decoders, keyName),
  )
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const initial = buildInitialDecoders(decoders, keyName)
    setLocalDecoders(initial)

    const matched = keyName ? findMatchingDecoderRule(initial, keyName) : null
    setExpandedId(matched?.id ?? initial[0]?.id ?? null)
  }, [decoders, isOpen, keyName])

  const isValid = useMemo(
    () => areDecodersValid(localDecoders),
    [localDecoders],
  )

  const handleAddDecoder = useCallback(() => {
    const nextDecoder = createEmptyDecoder(
      keyName ? getDefaultKeyPattern(keyName) : '',
    )
    setLocalDecoders((current) => [...current, nextDecoder])
    setExpandedId(nextDecoder.id)
  }, [keyName])

  const handleUpdateDecoder = useCallback(
    (decoderId: string, nextDecoder: ValueDecoderRule) => {
      setLocalDecoders((current) =>
        current.map((decoder) =>
          decoder.id === decoderId ? nextDecoder : decoder,
        ),
      )
    },
    [],
  )

  const handleRemoveDecoder = useCallback((decoderId: string) => {
    setLocalDecoders((current) => {
      const next = current.filter((decoder) => decoder.id !== decoderId)
      return next.length > 0 ? next : [createEmptyDecoder()]
    })
    setExpandedId((current) => (current === decoderId ? null : current))
  }, [])

  const handleSave = useCallback(() => {
    if (!isValid) {
      return
    }

    onSave(localDecoders.map(normalizeRule))
  }, [isValid, localDecoders, onSave])

  if (!isOpen) {
    return null
  }

  return (
    <Modal.Compose open={isOpen}>
      <S.ModalContent persistent onCancel={onCancel}>
        <Modal.Content.Close
          icon={CancelIcon}
          onClick={onCancel}
          data-testid={`${VALUE_DECODER_TEST_ID}-modal-close`}
        />

        <Modal.Content.Header.Compose>
          <Modal.Content.Header.Title>
            Value Decoders
          </Modal.Content.Header.Title>
        </Modal.Content.Header.Compose>

        <S.ModalBody
          content={
            <TooltipProvider>
              <Col gap="l" data-testid={`${VALUE_DECODER_TEST_ID}-modal-form`}>
                <Text color="secondary">
                  Decoders are shared across all hash keys. Add multiple decoders
                  and key patterns; matching hash values can be decoded in the
                  Value Preview.
                </Text>

                <Row justify="between" align="center">
                  <Text variant="semiBold">Decoders</Text>
                  <SecondaryButton
                    size="s"
                    onClick={handleAddDecoder}
                    data-testid={`${VALUE_DECODER_TEST_ID}-add-decoder`}
                  >
                    Add Decoder
                  </SecondaryButton>
                </Row>

                <Col gap="m">
                  {localDecoders.map((decoder) => {
                    const normalized = normalizeRule(decoder)
                    const patternCount = normalized.keyPatterns.length
                    const summary = `${getDecoderLabel(decoder)} · ${patternCount} pattern${patternCount === 1 ? '' : 's'}`

                    return (
                      <DecoderEditor
                        key={decoder.id}
                        decoder={decoder}
                        isExpanded={expandedId === decoder.id}
                        onToggle={() =>
                          setExpandedId((current) =>
                            current === decoder.id ? null : decoder.id,
                          )
                        }
                        onChange={(nextDecoder) =>
                          handleUpdateDecoder(decoder.id, nextDecoder)
                        }
                        onRemove={() => handleRemoveDecoder(decoder.id)}
                        canRemove={localDecoders.length > 1}
                        summary={summary}
                        matchesCurrentKey={Boolean(
                          keyName &&
                            normalized.keyPatterns.some((pattern) =>
                              matchKeyPattern(pattern, keyName),
                            ),
                        )}
                      />
                    )
                  })}
                </Col>
              </Col>
            </TooltipProvider>
          }
        />

        <Modal.Content.Footer.Compose>
          <Row gap="m" justify="end">
            <SecondaryButton
              size="l"
              onClick={onCancel}
              data-testid={`${VALUE_DECODER_TEST_ID}-modal-cancel`}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              size="l"
              onClick={handleSave}
              disabled={!isValid}
              data-testid={`${VALUE_DECODER_TEST_ID}-modal-save`}
            >
              Save
            </PrimaryButton>
          </Row>
        </Modal.Content.Footer.Compose>
      </S.ModalContent>
    </Modal.Compose>
  )
}
