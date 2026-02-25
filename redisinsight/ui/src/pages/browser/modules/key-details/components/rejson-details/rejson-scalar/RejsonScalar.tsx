import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import { setReJSONDataAction } from 'uiSrc/slices/browser/rejson'
import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import {
  bufferToString,
  createDeleteFieldHeader,
  createDeleteFieldMessage,
  isTruncatedString,
  Nullable,
} from 'uiSrc/utils'
import FieldMessage from 'uiSrc/components/field-message/FieldMessage'

import { JSONScalarProps } from '../interfaces'
import {
  generatePath,
  getClassNameByValue,
  isValidJSON,
  stringifyScalarValue,
} from '../utils'
import { JSONErrors } from '../constants'

import * as S from '../Rejson.styles'

const RejsonScalar = (props: JSONScalarProps) => {
  const {
    keyName = '',
    value,
    isRoot,
    parentPath,
    leftPadding,
    selectedKey,
    path: currentFullPath,
    handleSubmitRemoveKey,
  } = props
  const [changedValue, setChangedValue] = useState<any>('')
  const [path] = useState<string>(
    currentFullPath || generatePath(parentPath, keyName),
  )
  const [error, setError] = useState<Nullable<string>>(null)
  const [editing, setEditing] = useState<boolean>(false)
  const [deleting, setDeleting] = useState<string>('')

  const dispatch = useDispatch()

  useEffect(() => {
    setChangedValue(stringifyScalarValue(value))
  }, [value])

  const onDeclineChanges = () => {
    setEditing(false)
    setError(null)
  }

  const onApplyValue = (value: string) => {
    if (!isValidJSON(value)) {
      setError(JSONErrors.valueJSONFormat)
      return
    }

    dispatch<any>(
      setReJSONDataAction(
        selectedKey,
        path,
        String(value),
        true,
        undefined,
        () => setEditing(false),
      ),
    )
  }

  return (
    <>
      {isRoot ? (
        <p className={getClassNameByValue(value)}>{`${changedValue}`}</p>
      ) : (
        <S.Row>
          <S.RowContainer>
            <div
              style={{ display: 'flex', alignItems: 'flex-start', flexGrow: 1 }}
            >
              <S.Quoted
                as={S.KeyName}
                style={{ paddingLeft: `${leftPadding}em` }}
              >
                {keyName}
              </S.Quoted>
              <div style={{ paddingLeft: '0.2em', display: 'inline-block' }}>
                :
              </div>
              {editing ? (
                <div className="jsonItemEditor">
                  <InlineItemEditor
                    styles={{
                      inputContainer: {
                        height: `24px`,
                      },
                      input: {
                        height: `24px !important`,
                      },
                      actionsContainer: {
                        height: `24px`,
                      },
                    }}
                    initialValue={changedValue}
                    controlsPosition="right"
                    placeholder="Enter JSON value"
                    fieldName="stringValue"
                    expandable
                    isInvalid={!!error}
                    onDecline={onDeclineChanges}
                    onChange={() => setError('')}
                    onApply={(value) => onApplyValue(value)}
                    iconSize="M"
                  />
                  {!!error && (
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
                </div>
              ) : (
                <S.JsonValue
                  className={getClassNameByValue(value)}
                  onClick={() => setEditing(!isTruncatedString(changedValue))}
                  style={{ flexGrow: 1 }}
                  data-testid="json-scalar-value"
                  role="presentation"
                >
                  {String(changedValue)}
                </S.JsonValue>
              )}
            </div>
            <S.DeleteBtn>
              <PopoverDelete
                header={createDeleteFieldHeader(keyName.toString())}
                text={createDeleteFieldMessage(bufferToString(selectedKey))}
                item={keyName.toString()}
                suffix="scalar"
                deleting={deleting}
                closePopover={() => setDeleting('')}
                updateLoading={false}
                showPopover={(item) => setDeleting(`${item}scalar`)}
                handleDeleteItem={() =>
                  handleSubmitRemoveKey(path, keyName.toString())
                }
              />
            </S.DeleteBtn>
          </S.RowContainer>
        </S.Row>
      )}
    </>
  )
}

export default RejsonScalar
