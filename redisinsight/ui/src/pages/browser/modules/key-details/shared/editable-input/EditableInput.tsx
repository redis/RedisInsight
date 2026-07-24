import React, { useState } from 'react'
import cx from 'classnames'

import { RiTooltip } from 'uiSrc/components'
import { useTranslation } from 'uiSrc/i18n'
import { StopPropagation } from 'uiSrc/components/virtual-table'
import InlineItemEditor from 'uiSrc/components/inline-item-editor'
import { Props as InlineItemEditorProps } from 'uiSrc/components/inline-item-editor/InlineItemEditor'

import { Text } from 'uiSrc/components/base/text'
import { EditIcon } from 'uiSrc/components/base/icons'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import {
  BrowserConfirmationCommandId,
  useProductionWriteConfirmation,
} from 'uiSrc/components/production-write-confirmation'
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
  onApply: (value: string, event?: React.MouseEvent) => void
  testIdPrefix?: string
  variant?: InlineItemEditorProps['variant']
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
    variant,
  } = props

  const [isHovering, setIsHovering] = useState(false)
  const { t } = useTranslation()
  const { requestConfirmation } = useProductionWriteConfirmation()

  if (!isEditing) {
    return (
      <div
        className={styles.contentWrapper}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        data-testid={`${testIdPrefix}_content-value-${field}`}
      >
        <Text
          component="div"
          color="secondary"
          style={{ maxWidth: '100%', whiteSpace: 'break-spaces' }}
        >
          <div style={{ display: 'flex' }}>{children}</div>
        </Text>
        {isHovering && (
          <RiTooltip
            content={editToolTipContent}
            anchorClassName={styles.editBtnAnchor}
            data-testid={`${testIdPrefix}_edit-tooltip-${field}`}
          >
            <IconButton
              icon={EditIcon}
              aria-label={t('browser.keyDetails.editable.editAria')}
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
          onApply={(value) => {
            requestConfirmation({
              title: t('browser.keyDetails.editable.confirmTitle'),
              actionDescription: t(
                'browser.keyDetails.editable.confirmMessage',
              ),
              confirmButtonText: t('browser.keyDetails.editable.confirmButton'),
              commandId: BrowserConfirmationCommandId.EditValue,
              disableConfirmationInput: true,
              onConfirm: () => {
                onApply(value)
                onEdit?.(false)
              },
            })
          }}
          validation={validation}
          variant={variant}
        />
      </div>
    </StopPropagation>
  )
}

export default EditableInput
