import React, { useState } from 'react'
import cx from 'classnames'

import { RiText } from 'uiBase/text'
import { EditIcon } from 'uiBase/icons'
import { RiIconButton } from 'uiBase/forms'
import { RiTooltip } from 'uiBase/display'
import { StopPropagation } from 'uiSrc/components/virtual-table'
import InlineItemEditor from 'uiSrc/components/inline-item-editor'

import styles from './styles.module.scss'

export interface Props {
  children: React.ReactNode
  initialValue?: string
  field?: string
  placeholder?: string
  isEditing: boolean
  isEditDisabled?: boolean
  onEdit: (isEditing: boolean) => void
  validation?: (value: string) => string
  editToolTipContent?: React.ReactNode
  onDecline: (event?: React.MouseEvent<HTMLElement>) => void
  onApply: (value: string, event: React.MouseEvent) => void
  testIdPrefix?: string
}

const EditableInput = (props: Props) => {
  const {
    children,
    initialValue = '',
    field,
    placeholder,
    isEditing,
    isEditDisabled,
    editToolTipContent,
    validation,
    onEdit,
    onDecline,
    onApply,
    testIdPrefix = '',
  } = props

  const [isHovering, setIsHovering] = useState(false)

  if (!isEditing) {
    return (
      <div
        className={styles.contentWrapper}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        data-testid={`${testIdPrefix}_content-value-${field}`}
      >
        <RiText
          color="subdued"
          size="s"
          style={{ maxWidth: '100%', whiteSpace: 'break-spaces' }}
        >
          <div style={{ display: 'flex' }}>{children}</div>
        </RiText>
        {isHovering && (
          <RiTooltip
            content={editToolTipContent}
            anchorClassName={styles.editBtnAnchor}
            data-testid={`${testIdPrefix}_edit-tooltip-${field}`}
          >
            <RiIconButton
              icon={EditIcon}
              aria-label="Edit field"
              className={cx('editFieldBtn', styles.editBtn)}
              disabled={isEditDisabled}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                onEdit?.(true)
                setIsHovering(false)
              }}
              data-testid={`${testIdPrefix}_edit-btn-${field}`}
            />
          </RiTooltip>
        )}
      </div>
    )
  }

  return (
    <StopPropagation>
      <div className={styles.inputWrapper}>
        <InlineItemEditor
          initialValue={initialValue}
          controlsPosition="right"
          controlsClassName={styles.controls}
          placeholder={placeholder}
          fieldName={field}
          expandable
          iconSize="M"
          onDecline={(event) => {
            onDecline(event)
            onEdit?.(false)
          }}
          onApply={(value, event) => {
            onApply(value, event)
            onEdit?.(false)
          }}
          validation={validation}
        />
      </div>
    </StopPropagation>
  )
}

export default EditableInput
