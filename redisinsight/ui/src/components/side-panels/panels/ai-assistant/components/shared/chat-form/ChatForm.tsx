import React, { Ref, useRef, useState } from 'react'

import { isModifiedEvent } from 'uiSrc/services'

import { Row } from 'uiSrc/components/base/layout/flex'
import { RiPopover, RiTooltip } from 'uiSrc/components/base'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { SendIcon } from 'uiSrc/components/base/icons'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { TextArea } from 'uiSrc/components/base/inputs'
import * as keys from 'uiSrc/constants/keys'
import * as S from './ChatForm.styles'

export interface Props {
  validation?: {
    title?: React.ReactNode
    content?: React.ReactNode
    icon?: React.ReactNode
  }
  agreements?: React.ReactNode
  onAgreementsDisplayed?: () => void
  isDisabled?: boolean
  placeholder?: string
  onSubmit: (value: string) => void
}

const INDENT_TEXTAREA_SPACE = 2

const ChatForm = (props: Props) => {
  const {
    validation,
    agreements,
    onAgreementsDisplayed,
    isDisabled,
    placeholder,
    onSubmit,
  } = props
  const [value, setValue] = useState('')
  const [isAgreementsPopoverOpen, setIsAgreementsPopoverOpen] = useState(false)
  const textAreaRef: Ref<HTMLTextAreaElement> = useRef(null)

  const updateTextAreaHeight = (initialState = false) => {
    if (!textAreaRef.current) return

    textAreaRef.current.style.height = '0px'

    if (initialState) return

    textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight + INDENT_TEXTAREA_SPACE}px`
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isModifiedEvent(e)) return

    if (e.key === keys.ENTER) {
      e.preventDefault()
      handleSubmitMessage()
    }
  }

  const handleChange = (value: string) => {
    setValue(value)
    updateTextAreaHeight()
  }

  const handleSubmitForm = (e: React.MouseEvent<HTMLFormElement>) => {
    e?.preventDefault()
    handleSubmitMessage()
  }

  const handleSubmitMessage = () => {
    if (!value || isDisabled) return

    if (agreements) {
      setIsAgreementsPopoverOpen(true)
      onAgreementsDisplayed?.()
      return
    }

    submitMessage()
  }

  const submitMessage = () => {
    setIsAgreementsPopoverOpen(false)

    onSubmit?.(value)
    setValue('')
    updateTextAreaHeight(true)
  }

  return (
    <div>
      <RiTooltip
        content={
          validation ? (
            <S.TooltipContent>
              <div>
                {validation.title && (
                  <>
                    <Title size="S">{validation.title}</Title>
                    <Spacer size="s" />
                  </>
                )}
                {validation.content && (
                  <Text size="m">{validation.content}</Text>
                )}
              </div>
              {validation.icon}
            </S.TooltipContent>
          ) : undefined
        }
        maxWidth={S.TOOLTIP_MAX_WIDTH}
      >
        <S.Wrapper
          as="form"
          $isFormDisabled={!!validation}
          onSubmit={handleSubmitForm}
          onKeyDown={handleKeyDown}
          role="presentation"
        >
          <TextArea
            ref={textAreaRef}
            placeholder={placeholder || 'Ask me about Redis'}
            value={value}
            onChange={handleChange}
            disabled={!!validation}
            data-testid="ai-message-textarea"
          />
          <RiPopover
            ownFocus
            isOpen={isAgreementsPopoverOpen}
            anchorPosition="downRight"
            closePopover={() => setIsAgreementsPopoverOpen(false)}
            panelClassName="popoverLikeTooltip"
            maxWidth={S.POPOVER_MAX_WIDTH}
            button={
              <S.PopoverAnchor>
                <S.SubmitBtn>
                  <PrimaryButton
                    size="s"
                    disabled={!value.length || isDisabled}
                    icon={SendIcon}
                    type="submit"
                    aria-label="submit"
                    data-testid="ai-submit-message-btn"
                  />
                </S.SubmitBtn>
              </S.PopoverAnchor>
            }
          >
            <>
              {agreements}
              <Spacer size="l" />
              <Row justify="end">
                <S.AgreementsAccept>
                  <PrimaryButton
                    size="s"
                    onClick={submitMessage}
                    onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
                    type="button"
                    data-testid="ai-accept-agreements"
                  >
                    I accept
                  </PrimaryButton>
                </S.AgreementsAccept>
              </Row>
            </>
          </RiPopover>
        </S.Wrapper>
      </RiTooltip>
      <Spacer size="xs" />
      <Text textAlign="center" size="xs">
        <S.AgreementText>
          Verify the accuracy of any information provided by Redis Copilot
          before using it
        </S.AgreementText>
      </Text>
    </div>
  )
}

export default React.memo(ChatForm)
