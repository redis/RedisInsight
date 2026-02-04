import React, { ChangeEvent, Ref, useEffect, useRef, useState } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'

import { StopPropagation } from 'uiSrc/components/virtual-table'
import InlineItemEditor from 'uiSrc/components/inline-item-editor'
import { RiTooltip } from 'uiSrc/components'
import { Text } from 'uiSrc/components/base/text'
import { EditIcon } from 'uiSrc/components/base/icons'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { TextArea } from 'uiSrc/components/base/inputs'
import * as S from './EditableTextArea.styles'

export interface Props {
  children: React.ReactNode
  initialValue?: string
  field?: string
  isEditing: boolean
  isLoading?: boolean
  isDisabled?: boolean
  isInvalid?: boolean
  isEditDisabled?: boolean
  textAreaMaxHeight?: number
  disabledTooltipText?: { title: string; content: string }
  approveText?: { title: string; text: string }
  editToolTipContent?: React.ReactNode
  approveByValidation?: (value: string) => boolean
  onEdit: (isEditing: boolean) => void
  onUpdateTextAreaHeight?: () => void
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void
  onDecline: (event?: React.MouseEvent<HTMLElement>) => void
  onApply: (value: string, event: React.MouseEvent) => void
  testIdPrefix?: string
}

const EditableTextArea = (props: Props) => {
  const {
    children,
    initialValue = '',
    field = '',
    textAreaMaxHeight = 300,
    isEditing,
    isEditDisabled,
    isLoading,
    isDisabled,
    isInvalid,
    disabledTooltipText,
    approveText,
    editToolTipContent,
    approveByValidation = () => true,
    onEdit,
    onUpdateTextAreaHeight,
    onChange,
    onDecline,
    onApply,
    testIdPrefix = '',
  } = props

  const [value, setValue] = useState('')
  const [isHovering, setIsHovering] = useState(false)
  const textAreaRef: Ref<HTMLTextAreaElement> = useRef(null)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const updateTextAreaHeight = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = '0px'
      textAreaRef.current.style.height = `${textAreaRef.current?.scrollHeight || 0}px`
      onUpdateTextAreaHeight?.()
    }
  }

  useEffect(() => {
    if (isEditing) {
      updateTextAreaHeight()
      setTimeout(() => textAreaRef?.current?.focus(), 0)
    }
  }, [isEditing])

  const handleOnChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    updateTextAreaHeight()
    onChange?.(e)
  }

  if (!isEditing) {
    return (
      <S.ContentWrapper
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        data-testid={`${testIdPrefix}_content-value-${field}`}
      >
        <Text
          component="div"
          color="secondary"
          style={{ maxWidth: '100%', whiteSpace: 'break-spaces' }}
        >
          {children}
        </Text>
        {isHovering && (
          <S.EditBtnAnchor>
            <RiTooltip
              content={editToolTipContent}
              data-testid={`${testIdPrefix}_edit-tooltip-${field}`}
            >
              <IconButton
                icon={EditIcon}
                aria-label="Edit field"
                className="editFieldBtn"
                disabled={isEditDisabled}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  onEdit?.(true)
                  setIsHovering(false)
                }}
                data-testid={`${testIdPrefix}_edit-btn-${field}`}
              />
            </RiTooltip>
          </S.EditBtnAnchor>
        )}
      </S.ContentWrapper>
    )
  }

  return (
    <AutoSizer
      disableHeight
      onResize={() => setTimeout(updateTextAreaHeight, 0)}
    >
      {({ width }) => (
        <div style={{ width }}>
          <StopPropagation>
            <InlineItemEditor
              expandable
              preventOutsideClick
              disableFocusTrap
              declineOnUnmount={false}
              initialValue={initialValue}
              controlsPosition="inside"
              controlsDesign="separate"
              fieldName="fieldValue"
              isLoading={isLoading}
              isDisabled={isDisabled}
              isInvalid={isInvalid}
              disabledTooltipText={disabledTooltipText}
              onDecline={(event) => {
                onDecline(event)
                setValue(initialValue)
                onEdit(false)
              }}
              onApply={(_, event) => {
                onApply(value, event)
                setValue(initialValue)
                onEdit(false)
              }}
              approveText={approveText}
              approveByValidation={() => approveByValidation?.(value)}
            >
              <TextArea
                name="value"
                id="value"
                placeholder="Enter Value"
                value={value}
                onChangeCapture={handleOnChange}
                disabled={isLoading}
                ref={textAreaRef}
                spellCheck={false}
                style={{
                  height: textAreaRef.current?.scrollHeight || 0,
                  maxHeight: textAreaMaxHeight,
                }}
                data-testid={`${testIdPrefix}_value-editor-${field}`}
              />
            </InlineItemEditor>
          </StopPropagation>
        </div>
      )}
    </AutoSizer>
  )
}

export default EditableTextArea
