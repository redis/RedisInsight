import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { useSelector } from 'react-redux'

import * as keys from 'uiSrc/constants/keys'
import { rejsonDataSelector } from 'uiSrc/slices/browser/rejson'
import { checkExistingPath } from 'uiSrc/utils/rejson'
import FieldMessage from 'uiSrc/components/field-message/FieldMessage'
import { Nullable } from 'uiSrc/utils'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { WindowEvent } from 'uiSrc/components/base/utils/WindowEvent'
import { FocusTrap } from 'uiSrc/components/base/utils/FocusTrap'
import { OutsideClickDetector } from 'uiSrc/components/base/utils'
import { CancelSlimIcon, CheckThinIcon } from 'uiSrc/components/base/icons'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { TextInput } from 'uiSrc/components/base/inputs'
import ConfirmOverwrite from './ConfirmOverwrite'
import { isValidJSON, isValidKey, parseJsonData, wrapPath } from '../../utils'
import { JSONErrors } from '../../constants'

import styles from '../../styles.module.scss'

export interface Props {
  isPair: boolean
  onCancel: () => void
  onSubmit: (pair: { key?: string; value: string }) => void
  leftPadding?: number
  parentPath: string
}

const AddItem = (props: Props) => {
  const { isPair, leftPadding = 0, onCancel, onSubmit, parentPath } = props
  const [isConfirmationVisible, setIsConfirmationVisible] =
    useState<boolean>(false)

  const { data } = useSelector(rejsonDataSelector)
  const jsonContent = parseJsonData(data)

  const [key, setKey] = useState<string>('')
  const [value, setValue] = useState<string>('')
  const [error, setError] = useState<Nullable<string>>(null)

  useEffect(() => {
    setError(null)
  }, [key, value])

  const handleOnEsc = (e: KeyboardEvent) => {
    if (e.code?.toLowerCase() === keys.ESCAPE) {
      e.stopPropagation()
      onCancel?.()
    }
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isPair && !isValidKey(key)) {
      setError(JSONErrors.keyCorrectSyntax)
      return
    }

    if (!isValidJSON(value)) {
      setError(JSONErrors.valueJSONFormat)
      return
    }

    const wrappedKey = wrapPath(key, parentPath) || ''
    if (isPair && checkExistingPath(wrappedKey, jsonContent)) {
      setIsConfirmationVisible(true)
      return
    }

    onSubmit({ key, value })
  }

  const confirmApply = () => {
    onSubmit({ key, value })
  }

  return (
    <div
      className={styles.row}
      style={{
        display: 'flex',
        flexDirection: 'row',
        paddingLeft: `${leftPadding}em`,
      }}
    >
      <OutsideClickDetector onOutsideClick={() => {}}>
        <div>
          <WindowEvent event="keydown" handler={(e) => handleOnEsc(e)} />
          <FocusTrap>
            <form
              className="relative"
              onSubmit={(e) => handleFormSubmit(e)}
              style={{ display: 'flex' }}
              noValidate
            >
              {isPair && (
                <FlexItem grow>
                  <TextInput
                    name="newRootKey"
                    value={key}
                    error={error}
                    placeholder="Enter JSON key"
                    onChange={value =>
                      setKey(value)
                    }
                    data-testid="json-key"
                  />
                </FlexItem>
              )}
              <FlexItem grow>
                <TextInput
                  name="newValue"
                  value={value}
                  placeholder="Enter JSON value"
                  error={error}
                  onChange={value =>
                    setValue(value)
                  }
                  data-testid="json-value"
                />
              </FlexItem>
              <ConfirmOverwrite
                isOpen={isConfirmationVisible}
                onCancel={() => setIsConfirmationVisible(false)}
                onConfirm={confirmApply}
              >
                <div className={cx(styles.controls)}>
                  <IconButton
                    size="M"
                    icon={CancelSlimIcon}
                    color="primary"
                    aria-label="Cancel editing"
                    className={styles.declineBtn}
                    onClick={() => onCancel?.()}
                  />

                  <IconButton
                    size="M"
                    icon={CheckThinIcon}
                    color="primary"
                    type="submit"
                    aria-label="Apply"
                    className={styles.applyBtn}
                    data-testid="apply-btn"
                  />
                </div>
              </ConfirmOverwrite>
            </form>
            {!!error && (
              <div className={cx(styles.errorMessage)}>
                <FieldMessage
                  scrollViewOnAppear
                  icon="ToastDangerIcon"
                  testID="edit-json-error"
                >
                  {error}
                </FieldMessage>
              </div>
            )}
          </FocusTrap>
        </div>
      </OutsideClickDetector>
    </div>
  )
}

export default AddItem
