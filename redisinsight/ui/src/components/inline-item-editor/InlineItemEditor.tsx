import React, { ChangeEvent, Ref, useEffect, useRef, useState } from 'react'
import cx from 'classnames'
import { useTheme } from '@redis-ui/styles'
import { EuiFieldText } from '@elastic/eui'

import * as keys from 'uiSrc/constants/keys'
import { RiPopover, RiTooltip } from 'uiSrc/components/base'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { WindowEvent } from 'uiSrc/components/base/utils/WindowEvent'
import { FocusTrap } from 'uiSrc/components/base/utils/FocusTrap'
import { OutsideClickDetector } from 'uiSrc/components/base/utils'
import { DestructiveButton } from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import {
  ActionsContainer,
  ActionsWrapper,
  ApplyButton,
  DeclineButton,
  IIEContainer,
} from './InlineItemEditor.styles'

import styles from './styles.module.scss'

type Positions = 'top' | 'bottom' | 'left' | 'right' | 'inside'
type Design = 'default' | 'separate'

export interface Props {
  onDecline: (event?: React.MouseEvent<HTMLElement>) => void
  onApply: (value: string, event: React.MouseEvent) => void
  onChange?: (value: string) => void
  fieldName?: string
  initialValue?: string
  placeholder?: string
  controlsPosition?: Positions
  controlsDesign?: Design
  maxLength?: number
  expandable?: boolean
  isLoading?: boolean
  isDisabled?: boolean
  isInvalid?: boolean
  disableEmpty?: boolean
  disableByValidation?: (value: string) => boolean
  children?: React.ReactElement
  validation?: (value: string) => string
  getError?: (
    value: string,
  ) => { title: string; content: string | React.ReactNode } | undefined
  declineOnUnmount?: boolean
  iconSize?: 'S' | 'M' | 'L'
  viewChildrenMode?: boolean
  autoComplete?: string
  controlsClassName?: string
  disabledTooltipText?: { title: string; content: string | React.ReactNode }
  preventOutsideClick?: boolean
  disableFocusTrap?: boolean
  approveByValidation?: (value: string) => boolean
  approveText?: { title: string; text: string }
  textFiledClassName?: string
}

const InlineItemEditor = (props: Props) => {
  const {
    initialValue = '',
    placeholder = '',
    controlsPosition = 'bottom',
    controlsDesign = 'default',
    onDecline,
    onApply,
    onChange,
    fieldName,
    maxLength,
    children,
    expandable,
    isLoading,
    isInvalid,
    disableEmpty,
    disableByValidation,
    validation,
    getError,
    declineOnUnmount = true,
    viewChildrenMode,
    iconSize,
    isDisabled,
    autoComplete = 'off',
    controlsClassName,
    disabledTooltipText,
    preventOutsideClick = false,
    disableFocusTrap = false,
    approveByValidation,
    approveText,
    textFiledClassName,
  } = props
  const containerEl: Ref<HTMLDivElement> = useRef(null)
  const [value, setValue] = useState<string>(initialValue)
  const [isError, setIsError] = useState<boolean>(false)
  const [isShowApprovePopover, setIsShowApprovePopover] = useState(false)
  const theme = useTheme()

  const size = theme.components.iconButton.sizes[iconSize ?? 'M']

  const inputRef: Ref<HTMLInputElement> = useRef(null)

  useEffect(
    () =>
      // componentWillUnmount
      () => {
        declineOnUnmount && onDecline()
      },
    [],
  )

  useEffect(() => {
    setTimeout(() => {
      inputRef?.current?.focus()
      inputRef?.current?.select()
    }, 100)
  }, [])

  const handleChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value

    if (validation) {
      newValue = validation(newValue)
    }
    if (disableByValidation) {
      setIsError(disableByValidation(newValue))
    }

    setValue(newValue)
    onChange?.(newValue)
  }

  const handleClickOutside = (event: any) => {
    if (preventOutsideClick) return
    if (!containerEl?.current?.contains(event.target)) {
      if (!isLoading) {
        onDecline(event)
      } else {
        event.stopPropagation()
        event.preventDefault()
      }
    }
  }

  const handleOnEsc = (e: KeyboardEvent) => {
    if (e.key === keys.ESCAPE) {
      e.stopPropagation()
      onDecline()
    }
  }

  const handleApplyClick = (event: React.MouseEvent<HTMLElement>) => {
    if (approveByValidation && !approveByValidation?.(value)) {
      setIsShowApprovePopover(true)
    } else {
      handleFormSubmit(event)
    }
  }

  const handleFormSubmit = (event: React.MouseEvent<HTMLElement>): void => {
    event.preventDefault()
    event.stopPropagation()
    if (!isDisabledApply()) {
      onApply(value, event)
    }
  }

  const isDisabledApply = (): boolean =>
    !!(isLoading || isError || isDisabled || (disableEmpty && !value.length))

  const ApplyBtn = (
    <RiTooltip
      anchorClassName={cx(styles.tooltip, 'tooltip')}
      position="bottom"
      title={
        (isDisabled && disabledTooltipText?.title) ||
        (getError && getError?.(value)?.title)
      }
      content={
        (isDisabled && disabledTooltipText?.content) ||
        (getError && getError?.(value)?.content)
      }
      data-testid="apply-tooltip"
    >
      <ApplyButton
        size={iconSize ?? 'M'}
        disabled={isDisabledApply()}
        onClick={handleApplyClick}
        data-testid="apply-btn"
      />
    </RiTooltip>
  )

  return (
    <>
      {viewChildrenMode ? (
        children
      ) : (
        <OutsideClickDetector onOutsideClick={handleClickOutside}>
          <IIEContainer ref={containerEl}>
            <WindowEvent event="keydown" handler={handleOnEsc} />
            <FocusTrap disabled={disableFocusTrap}>
              <form
                className="relative"
                onSubmit={(e: unknown) =>
                  handleFormSubmit(e as React.MouseEvent<HTMLElement>)
                }
              >
                <FlexItem grow>
                  {children || (
                    <>
                      <EuiFieldText
                        name={fieldName}
                        id={fieldName}
                        className={cx(styles.field, textFiledClassName)}
                        maxLength={maxLength || undefined}
                        placeholder={placeholder}
                        value={value}
                        fullWidth={false}
                        compressed
                        onChange={handleChangeValue}
                        isLoading={isLoading}
                        isInvalid={isInvalid}
                        data-testid="inline-item-editor"
                        autoComplete={autoComplete}
                        inputRef={inputRef}
                      />
                      {expandable && (
                        <p className={styles.keyHiddenText}>{value}</p>
                      )}
                    </>
                  )}
                </FlexItem>
                <ActionsContainer
                  justify="around"
                  gap="m"
                  $position={controlsPosition}
                  $design={controlsDesign}
                  grow={false}
                  className={cx(
                    'inlineItemEditor__controls',
                    styles.controls,
                    controlsClassName,
                  )}
                >
                  <ActionsWrapper $size={size}>
                    <DeclineButton
                      onClick={onDecline}
                      disabled={isLoading}
                      data-testid="cancel-btn"
                    />
                  </ActionsWrapper>
                  {!approveByValidation && (
                    <ActionsWrapper $size={size}>{ApplyBtn}</ActionsWrapper>
                  )}
                  {approveByValidation && (
                    <ActionsWrapper $size={size}>
                      <RiPopover
                        anchorPosition="leftCenter"
                        isOpen={isShowApprovePopover}
                        closePopover={() => setIsShowApprovePopover(false)}
                        anchorClassName={cx(
                          styles.popoverAnchor,
                          'popoverAnchor',
                        )}
                        panelClassName={cx(styles.popoverPanel)}
                        button={ApplyBtn}
                      >
                        <div
                          className={styles.popover}
                          data-testid="approve-popover"
                        >
                          <Text size="m" component="div">
                            {!!approveText?.title && (
                              <h4>
                                <b>{approveText?.title}</b>
                              </h4>
                            )}
                            <Text
                              size="s"
                              color="subdued"
                              className={styles.approveText}
                            >
                              {approveText?.text}
                            </Text>
                          </Text>
                          <div className={styles.popoverFooter}>
                            <DestructiveButton
                              aria-label="Save"
                              className={cx(styles.btn, styles.saveBtn)}
                              disabled={isDisabledApply()}
                              onClick={handleFormSubmit}
                              data-testid="save-btn"
                            >
                              Save
                            </DestructiveButton>
                          </div>
                        </div>
                      </RiPopover>
                    </ActionsWrapper>
                  )}
                </ActionsContainer>
              </form>
            </FocusTrap>
          </IIEContainer>
        </OutsideClickDetector>
      )}
    </>
  )
}

export default InlineItemEditor
