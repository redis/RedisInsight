import React, { useState } from 'react'
import cx from 'classnames'
import jsonValidator from 'json-dup-key-validator'

import * as keys from 'uiSrc/constants/keys'
import { CancelSlimIcon, CheckThinIcon } from 'uiSrc/components/base/icons'
import FieldMessage from 'uiSrc/components/field-message/FieldMessage'
import { Nullable } from 'uiSrc/utils'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { WindowEvent } from 'uiSrc/components/base/utils/WindowEvent'
import { FocusTrap } from 'uiSrc/components/base/utils/FocusTrap'
import { OutsideClickDetector } from 'uiSrc/components/base/utils'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { TextArea } from 'uiSrc/components/base/inputs'
import { isValidJSON } from '../../utils'
import { JSONErrors } from '../../constants'

import * as S from '../../Rejson.styles'
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
    <S.Row>
      <S.FullWidthContainer>
        <OutsideClickDetector onOutsideClick={() => onCancel?.()}>
          <div>
            <WindowEvent event="keydown" handler={(e) => handleOnEsc(e)} />
            <FocusTrap>
              <form
                className="relative"
                onSubmit={handleFormSubmit}
                data-testid="json-entire-form"
                noValidate
              >
                <FlexItem grow>
                  <TextArea
                    valid={!error}
                    className={S.fullWidthTextAreaClassName}
                    value={value}
                    placeholder="Enter JSON value"
                    onChange={setValue}
                    data-testid="json-value"
                  />
                </FlexItem>
                <ConfirmOverwrite
                  isOpen={isConfirmationVisible}
                  onCancel={() => setIsConfirmationVisible(false)}
                  onConfirm={confirmApply}
                >
                  <S.ControlsBottom>
                    <IconButton
                      icon={CancelSlimIcon}
                      aria-label="Cancel add"
                      className="rejson-decline-btn"
                      onClick={onCancel}
                      data-testid="cancel-edit-btn"
                    />
                    <IconButton
                      icon={CheckThinIcon}
                      color="primary"
                      type="submit"
                      aria-label="Apply"
                      className="rejson-apply-btn"
                      data-testid="apply-edit-btn"
                    />
                  </S.ControlsBottom>
                </ConfirmOverwrite>
              </form>
              {error && (
                <S.ErrorMessage>
                  <FieldMessage
                    scrollViewOnAppear
                    icon="ToastDangerIcon"
                    testID="edit-json-error"
                  >
                    {error}
                  </FieldMessage>
                </S.ErrorMessage>
              )}
            </FocusTrap>
          </div>
        </OutsideClickDetector>
      </S.FullWidthContainer>
    </S.Row>
  )
}

export default EditEntireItemAction
