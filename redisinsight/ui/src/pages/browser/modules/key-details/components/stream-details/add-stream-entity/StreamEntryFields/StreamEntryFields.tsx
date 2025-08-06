import React, { useEffect, useRef } from 'react'
import cx from 'classnames'
import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiSpacer } from 'uiBase/layout/spacer'
import { RiFormField } from 'uiBase/forms'
import { RiIcon } from 'uiBase/icons'
import { RiTextInput } from 'uiBase/inputs'
import { validateEntryId } from 'uiSrc/utils'
import { INITIAL_STREAM_FIELD_STATE } from 'uiSrc/pages/browser/components/add-key/AddKeyStream/AddKeyStream'
import { AddStreamFormConfig as config } from 'uiSrc/pages/browser/components/add-key/constants/fields-config'
import AddMultipleFields from 'uiSrc/pages/browser/components/add-multiple-fields'

import { RiTooltip } from 'uiSrc/components'
import styles from '../styles.module.scss'

export interface Props {
  entryIdError?: string
  entryID: string
  setEntryID: React.Dispatch<React.SetStateAction<string>>
  fields: any[]
  setFields: React.Dispatch<React.SetStateAction<any[]>>
}

const MIN_ENTRY_ID_VALUE = '0-1'

const StreamEntryFields = (props: Props) => {
  const { entryID, setEntryID, entryIdError, fields, setFields } = props

  const [isEntryIdFocused, setIsEntryIdFocused] = React.useState(false)
  const prevCountFields = useRef<number>(0)
  const lastAddedFieldName = useRef<HTMLInputElement>(null)
  const entryIdRef = useRef<HTMLInputElement>(null)

  const isClearDisabled = (item: any): boolean =>
    fields.length === 1 && !(item.name.length || item.value.length)

  useEffect(() => {
    if (
      prevCountFields.current !== 0 &&
      prevCountFields.current < fields.length
    ) {
      lastAddedFieldName.current?.focus()
    }
    prevCountFields.current = fields.length
  }, [fields.length])

  const addField = () => {
    const lastField = fields[fields.length - 1]
    const newState = [
      ...fields,
      {
        ...INITIAL_STREAM_FIELD_STATE,
        id: lastField.id + 1,
      },
    ]
    setFields(newState)
  }

  const removeField = (id: number) => {
    const newState = fields.filter((item) => item.id !== id)
    setFields(newState)
  }

  const clearFieldsValues = (id: number) => {
    const newState = fields.map((item) =>
      item.id === id
        ? {
            ...item,
            name: '',
            value: '',
          }
        : item,
    )
    setFields(newState)
  }

  const onClickRemove = ({ id }: any) => {
    if (fields.length === 1) {
      clearFieldsValues(id)
      return
    }

    removeField(id)
  }

  const handleEntryIdChange = (value: string) => {
    setEntryID(validateEntryId(value))
  }

  const handleFieldChange = (formField: string, id: number, value: any) => {
    const newState = fields.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          [formField]: value,
        }
      }
      return item
    })
    setFields(newState)
  }

  const onEntryIdBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.value === '0-0' && setEntryID(MIN_ENTRY_ID_VALUE)
    setIsEntryIdFocused(false)
  }

  const showEntryError = !isEntryIdFocused && entryIdError

  return (
    <div className={cx(styles.container)}>
      <div className={styles.entryIdContainer}>
        <RiFormField
          label={config.entryId.label}
          additionalText={
            <RiTooltip
              anchorClassName="inputAppendIcon"
              className={styles.entryIdTooltip}
              position="left"
              title="Enter Valid ID or *"
              content={
                <>
                  ID must be a timestamp and sequence number greater than the
                  last ID.
                  <RiSpacer size="xs" />
                  Otherwise, type * to auto-generate ID based on the database
                  current time.
                </>
              }
            >
              <RiIcon type="InfoIcon" style={{ cursor: 'pointer' }} />
            </RiTooltip>
          }
        >
          <RiTextInput
            ref={entryIdRef}
            name={config.entryId.name}
            id={config.entryId.id}
            placeholder={config.entryId.placeholder}
            value={entryID}
            onChange={handleEntryIdChange}
            onBlur={onEntryIdBlur}
            onFocus={() => setIsEntryIdFocused(true)}
            valid={!entryIdError}
            autoComplete="off"
            data-testid={config.entryId.id}
          />
        </RiFormField>
        {!showEntryError && (
          <span className={styles.timestampText}>
            Timestamp - Sequence Number or *
          </span>
        )}
        {showEntryError && (
          <span className={styles.error} data-testid="stream-entry-error">
            {entryIdError}
          </span>
        )}
      </div>

      <div className={styles.fieldsWrapper}>
        <div className={cx(styles.fieldsContainer)}>
          <AddMultipleFields
            items={fields}
            isClearDisabled={isClearDisabled}
            onClickRemove={onClickRemove}
            onClickAdd={addField}
          >
            {(item, index) => (
              <RiRow align="center" gap="m">
                <RiFlexItem className={styles.fieldItemWrapper} grow>
                  <RiFormField>
                    <RiTextInput
                      name={`fieldName-${item.id}`}
                      id={`fieldName-${item.id}`}
                      placeholder={config.name.placeholder}
                      value={item.name}
                      onChange={(value) =>
                        handleFieldChange('name', item.id, value)
                      }
                      ref={
                        index === fields.length - 1 ? lastAddedFieldName : null
                      }
                      autoComplete="off"
                      data-testid="field-name"
                    />
                  </RiFormField>
                </RiFlexItem>
                <RiFlexItem className={styles.valueItemWrapper} grow>
                  <RiFormField>
                    <RiTextInput
                      className={styles.fieldValue}
                      name={`fieldValue-${item.id}`}
                      id={`fieldValue-${item.id}`}
                      placeholder={config.value.placeholder}
                      value={item.value}
                      onChange={(value) =>
                        handleFieldChange('value', item.id, value)
                      }
                      autoComplete="off"
                      data-testid="field-value"
                    />
                  </RiFormField>
                </RiFlexItem>
              </RiRow>
            )}
          </AddMultipleFields>
        </div>
      </div>
    </div>
  )
}

export default StreamEntryFields
