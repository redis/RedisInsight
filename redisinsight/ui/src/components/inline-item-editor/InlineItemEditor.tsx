import React, { Ref, useEffect, useRef, useState } from 'react'
import cx from 'classnames'

import { useTheme } from '@redis-ui/styles'

import * as keys from 'uiSrc/constants/keys'
import { RiTooltip } from 'uiSrc/components/base'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { WindowEvent } from 'uiSrc/components/base/utils/WindowEvent'
import { FocusTrap } from 'uiSrc/components/base/utils/FocusTrap'
import { OutsideClickDetector } from 'uiSrc/components/base/utils'
import { DestructiveButton } from 'uiSrc/components/base/forms/buttons'
import ConfirmationPopover from 'uiSrc/components/confirmation-popover'

import type { InlineItemEditorProps } from './InlineItemEditor.types'
import { usePositionStyles } from './InlineItemEditor.styles'
import * as S from './InlineItemEditor.styles'

const POPOVER_PANEL_WIDTH = '296px'

const InlineItemEditor = (props: InlineItemEditorProps) => {
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
    variant,
    styles: customStyles,
  } = props
  const containerEl: Ref<HTMLDivElement> = useRef(null)
  const [value, setValue] = useState<string>(initialValue)
  const [isError, setIsError] = useState<boolean>(false)
  const [isShowApprovePopover, setIsShowApprovePopover] = useState(false)
  const theme = useTheme()
  const positionStyles = usePositionStyles(controlsPosition ?? 'bottom')

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

  const handleChangeValue = (value: string) => {
    let newValue = value

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
      anchorClassName="tooltip"
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
      <S.ApplyButton
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
        <OutsideClickDetector
          onOutsideClick={handleClickOutside}
          isDisabled={isShowApprovePopover}
        >
          <S.StyledContainer ref={containerEl}>
            <WindowEvent event="keydown" handler={handleOnEsc} />
            <FocusTrap disabled={disableFocusTrap}>
              <form
                className="relative"
                onSubmit={(e: unknown) =>
                  handleFormSubmit(e as React.MouseEvent<HTMLElement>)
                }
                style={{
                  ...customStyles?.inputContainer,
                }}
              >
                <FlexItem grow>
                  {children || (
                    <>
                      <S.StyledTextInput
                        $width={customStyles?.input?.width}
                        $height={customStyles?.input?.height}
                        name={fieldName}
                        id={fieldName}
                        className={textFiledClassName}
                        maxLength={maxLength || undefined}
                        placeholder={placeholder}
                        value={value}
                        onChange={handleChangeValue}
                        loading={isLoading}
                        data-testid="inline-item-editor"
                        autoComplete={autoComplete}
                        variant={variant}
                        ref={inputRef}
                      />
                      {expandable && <S.KeyHiddenText>{value}</S.KeyHiddenText>}
                    </>
                  )}
                </FlexItem>
                <S.ActionsContainer
                  justify="around"
                  gap="m"
                  $positionStyles={positionStyles}
                  $design={controlsDesign}
                  $width={customStyles?.actionsContainer?.width}
                  $height={customStyles?.actionsContainer?.height}
                  grow={false}
                  className={cx(
                    'inlineItemEditor__controls',
                    controlsClassName,
                  )}
                >
                  <S.ActionsWrapper $size={size}>
                    <S.DeclineButton
                      onClick={onDecline}
                      disabled={isLoading}
                      data-testid="cancel-btn"
                    />
                  </S.ActionsWrapper>
                  {!approveByValidation && (
                    <S.ActionsWrapper $size={size}>{ApplyBtn}</S.ActionsWrapper>
                  )}
                  {approveByValidation && (
                    <S.ActionsWrapper $size={size}>
                      <ConfirmationPopover
                        anchorPosition="leftCenter"
                        isOpen={isShowApprovePopover}
                        closePopover={() => setIsShowApprovePopover(false)}
                        anchorClassName="popoverAnchor"
                        maxWidth={POPOVER_PANEL_WIDTH}
                        button={ApplyBtn}
                        title={approveText?.title}
                        message={approveText?.text}
                        confirmButton={
                          <DestructiveButton
                            aria-label="Save"
                            size="small"
                            disabled={isDisabledApply()}
                            onClick={handleFormSubmit}
                            data-testid="save-btn"
                          >
                            Save
                          </DestructiveButton>
                        }
                      />
                    </S.ActionsWrapper>
                  )}
                </S.ActionsContainer>
              </form>
            </FocusTrap>
          </S.StyledContainer>
        </OutsideClickDetector>
      )}
    </>
  )
}

export default InlineItemEditor
