import React, { useState } from 'react'
import cx from 'classnames'
import jsonValidator from 'json-dup-key-validator'

import * as keys from 'uiSrc/constants/keys'
import { CancelSlimIcon, CheckThinIcon } from 'uiSrc/components/base/icons'
import FieldMessage from 'uiSrc/components/field-message/FieldMessage'
import { Nullable } from 'uiSrc/utils'
import { RiFlexItem } from 'uiSrc/components/base/layout'
import {
  RiWindowEvent,
  RiFocusTrap,
  RiOutsideClickDetector,
} from 'uiSrc/components/base/utils'
import { RiIconButton } from 'uiSrc/components/base/forms'
import { RiTextArea } from 'uiSrc/components/base/inputs'
import { isValidJSON } from '../../utils'
import { JSONErrors } from '../../constants'

import styles from '../../styles.module.scss'
import ConfirmOverwrite from '../add-item/ConfirmOverwrite'

export interface Props {
  initialValue: string
  onCancel?: () => void
  onSubmit: (value: string) => void
}

const EditEntireItemAction = (props: Props) => {
  const { initialValue, onCancel, onSubmit } = props
  const [value, setValue] = useState<string>(initialValue)
  const [error, setError] = useState<Nullable<string>>(null)
  const [isConfirmationVisible, setIsConfirmationVisible] =
    useState<boolean>(false)

  const handleOnEsc = (e: KeyboardEvent) => {
    if (e.code?.toLowerCase() === keys.ESCAPE) {
      e.stopPropagation()
      onCancel?.()
    }
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isValidJSON(value)) {
      setError(JSONErrors.valueJSONFormat)
      return
    }

    const validationError = jsonValidator.validate(value, false)

    if (validationError) {
      setIsConfirmationVisible(true)
      return
    }

    onSubmit(value)
  }

  const confirmApply = () => {
    onSubmit(value)
  }

  return (
    <div className={styles.row}>
      <div className={styles.fullWidthContainer}>
        <RiOutsideClickDetector onOutsideClick={() => onCancel?.()}>
          <div>
            <RiWindowEvent event="keydown" handler={(e) => handleOnEsc(e)} />
            <RiFocusTrap>
              <form
                className="relative"
                onSubmit={handleFormSubmit}
                data-testid="json-entire-form"
                noValidate
              >
                <RiFlexItem grow>
                  <RiTextArea
                    valid={!error}
                    className={styles.fullWidthTextArea}
                    value={value}
                    placeholder="Enter JSON value"
                    onChange={setValue}
                    data-testid="json-value"
                  />
                </RiFlexItem>
                <ConfirmOverwrite
                  isOpen={isConfirmationVisible}
                  onCancel={() => setIsConfirmationVisible(false)}
                  onConfirm={confirmApply}
                >
                  <div className={cx(styles.controls, styles.controlsBottom)}>
                    <RiIconButton
                      icon={CancelSlimIcon}
                      aria-label="Cancel add"
                      className={styles.declineBtn}
                      onClick={onCancel}
                      data-testid="cancel-edit-btn"
                    />
                    <RiIconButton
                      icon={CheckThinIcon}
                      color="primary"
                      type="submit"
                      aria-label="Apply"
                      className={styles.applyBtn}
                      data-testid="apply-edit-btn"
                    />
                  </div>
                </ConfirmOverwrite>
              </form>
              {error && (
                <div
                  className={cx(
                    styles.errorMessage,
                    styles.errorMessageForTextArea,
                  )}
                >
                  <FieldMessage
                    scrollViewOnAppear
                    icon="ToastDangerIcon"
                    testID="edit-json-error"
                  >
                    {error}
                  </FieldMessage>
                </div>
              )}
            </RiFocusTrap>
          </div>
        </RiOutsideClickDetector>
      </div>
    </div>
  )
}

export default EditEntireItemAction
