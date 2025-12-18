import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import cx from 'classnames'

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

import styles from '../styles.module.scss'
import '../styles.scss'

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
        <div className={styles.row}>
          <div className={styles.rowContainer}>
            <div
              style={{ display: 'flex', alignItems: 'flex-start', flexGrow: 1 }}
            >
              <span
                className={cx(styles.quoted, styles.keyName)}
                style={{ paddingLeft: `${leftPadding}em` }}
              >
                {keyName}
              </span>
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
                </div>
              ) : (
                <span
                  className={cx(styles.jsonValue, getClassNameByValue(value))}
                  onClick={() => setEditing(!isTruncatedString(changedValue))}
                  style={{ flexGrow: 1 }}
                  data-testid="json-scalar-value"
                  role="presentation"
                >
                  {String(changedValue)}
                </span>
              )}
            </div>
            <div className={styles.deleteBtn}>
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
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default RejsonScalar
