import React, { Ref, useRef, useState } from 'react'

import cx from 'classnames'
import { isModifiedEvent } from 'uiSrc/services'

import { RiPopover, RiTooltip } from 'uiSrc/components/base'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import { RiPrimaryButton } from 'uiSrc/components/base/forms'
import { SendIcon } from 'uiSrc/components/base/icons'
import { RiTitle } from 'uiSrc/components/base/text/RiTitle'
import { RiText } from 'uiSrc/components/base/text'
import { RiTextArea } from 'uiSrc/components/base/inputs'
import * as keys from 'uiSrc/constants/keys'
import styles from './styles.module.scss'

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
            <div className={styles.tooltipContent}>
              <div>
                {validation.title && (
                  <>
                    <RiTitle size="XS">{validation.title}</RiTitle>
                    <RiSpacer size="s" />
                  </>
                )}
                {validation.content && (
                  <RiText size="xs">{validation.content}</RiText>
                )}
              </div>
              {validation.icon}
            </div>
          ) : undefined
        }
        className={styles.validationTooltip}
      >
        <form
          className={cx(styles.wrapper, {
            [styles.isFormDisabled]: validation,
          })}
          onSubmit={handleSubmitForm}
          onKeyDown={handleKeyDown}
          role="presentation"
        >
          <RiTextArea
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
            panelClassName={cx('popoverLikeTooltip', styles.popover)}
            anchorClassName={styles.popoverAnchor}
            button={
              <RiPrimaryButton
                size="s"
                disabled={!value.length || isDisabled}
                className={styles.submitBtn}
                icon={SendIcon}
                type="submit"
                aria-label="submit"
                data-testid="ai-submit-message-btn"
              />
            }
          >
            <>
              {agreements}
              <RiSpacer size="m" />
              <RiPrimaryButton
                size="s"
                className={styles.agreementsAccept}
                onClick={submitMessage}
                onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
                type="button"
                data-testid="ai-accept-agreements"
              >
                I accept
              </RiPrimaryButton>
            </>
          </RiPopover>
        </form>
      </RiTooltip>
      <RiText textAlign="center" size="xs" className={styles.agreementText}>
        Verify the accuracy of any information provided by Redis Copilot before
        using it
      </RiText>
    </div>
  )
}

export default React.memo(ChatForm)
