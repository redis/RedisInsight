import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Modal } from 'uiSrc/components/base/display'
import { Text } from 'uiSrc/components/base/text'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { CancelIcon } from 'uiSrc/components/base/icons'
import { Row, Col } from 'uiSrc/components/base/layout/flex'
import { CopyButton } from 'uiSrc/components/copy-button/CopyButton'

import { createEmptyDecoder, VALUE_DECODER_TEST_ID } from './constants'
import { DecoderEditor } from './DecoderEditor'
import {
  parseDecodersFromClipboard,
  serializeDecodersForClipboard,
} from './decoderClipboard'
import { areDecodersValid, getDecoderLabel, normalizeRule } from './schemaUtils'
import { ValueDecoderRule } from './types'
import {
  findMatchingDecoderRule,
  getDefaultKeyPattern,
  matchKeyPattern,
} from './utils'
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
  const [pasteMessage, setPasteMessage] = useState<string | null>(null)

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
    setLocalDecoders((current) =>
      current.filter((decoder) => decoder.id !== decoderId),
    )
    setExpandedId((current) => (current === decoderId ? null : current))
  }, [])

  const importDecodersFromText = useCallback((text: string): boolean => {
    const imported = parseDecodersFromClipboard(text)

    if (!imported?.length) {
      setPasteMessage('No decoder configuration found in clipboard')
      return false
    }

    setLocalDecoders((current) => [...current, ...imported])
    setExpandedId(imported[imported.length - 1].id)
    setPasteMessage(
      imported.length === 1
        ? 'Pasted 1 decoder'
        : `Pasted ${imported.length} decoders`,
    )
    return true
  }, [])

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      importDecodersFromText(text)
    } catch {
      setPasteMessage('Unable to read clipboard')
    }
  }, [importDecodersFromText])

  useEffect(() => {
    if (!pasteMessage) {
      return undefined
    }

    const timeout = setTimeout(() => {
      setPasteMessage(null)
    }, 2500)

    return () => clearTimeout(timeout)
  }, [pasteMessage])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handlePaste = (event: ClipboardEvent) => {
      const target = event.target

      if (
        target instanceof HTMLElement &&
        target.closest('input, textarea, [contenteditable="true"]')
      ) {
        return
      }

      const text = event.clipboardData?.getData('text/plain') ?? ''

      if (importDecodersFromText(text)) {
        event.preventDefault()
      }
    }

    document.addEventListener('paste', handlePaste)

    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [importDecodersFromText, isOpen])

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
            <Col gap="l" data-testid={`${VALUE_DECODER_TEST_ID}-modal-form`}>
              <Text color="secondary">
                Decoders are shared across all hash keys in this database. Add
                multiple decoders and key patterns; matching hash values can be
                decoded in the Value Preview. Copy decoders as JSON and paste
                them here or into another Redis Insight connection.
              </Text>

              <Row justify="between" align="center" gap="m">
                <Text variant="semiBold">Decoders</Text>
                <Row gap="s" align="center">
                  {pasteMessage && (
                    <Text color="secondary" size="s">
                      {pasteMessage}
                    </Text>
                  )}
                  <CopyButton
                    copy={serializeDecodersForClipboard(localDecoders)}
                    aria-label="Copy all decoders"
                    tooltipConfig={{ content: 'Copy all decoders' }}
                    data-testid={`${VALUE_DECODER_TEST_ID}-copy-all`}
                  />
                  <SecondaryButton
                    size="s"
                    onClick={handlePasteFromClipboard}
                    data-testid={`${VALUE_DECODER_TEST_ID}-paste-decoders`}
                  >
                    Paste
                  </SecondaryButton>
                  <SecondaryButton
                    size="s"
                    onClick={handleAddDecoder}
                    data-testid={`${VALUE_DECODER_TEST_ID}-add-decoder`}
                  >
                    Add Decoder
                  </SecondaryButton>
                </Row>
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
                      canRemove
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
