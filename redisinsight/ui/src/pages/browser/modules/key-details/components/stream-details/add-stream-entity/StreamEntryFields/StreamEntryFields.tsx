import React, { useEffect, useRef } from 'react'
import { validateEntryId } from 'uiSrc/utils'
import { INITIAL_STREAM_FIELD_STATE } from 'uiSrc/pages/browser/components/add-key/AddKeyStream/AddKeyStream'
import { AddStreamFormConfig as config } from 'uiSrc/pages/browser/components/add-key/constants/fields-config'
import AddMultipleFields from 'uiSrc/pages/browser/components/add-multiple-fields'

import { RiTooltip } from 'uiSrc/components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { Text } from 'uiSrc/components/base/text'
import { TextInput } from 'uiSrc/components/base/inputs'
import { streamIDTooltipText } from 'uiSrc/constants/texts'
import { EntryIdContainer, FieldsWrapper } from '../AddStreamEntries.styles'
import { InlineRow } from './StreamEntryFields.styles'
import {
  StreamGroupContent,
  TimeStampInfoIcon,
} from '../../add-stream-group/AddStreamGroup.styles'
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
    <StreamGroupContent>
      <EntryIdContainer>
        <FormField
          label={config.entryId.label}
          additionalText={
            <InlineRow align="center" gap="s">
              <RiTooltip
                anchorClassName="inputAppendIcon"
                className={styles.entryIdTooltip}
                position="left"
                title="Enter Valid ID or *"
                content={streamIDTooltipText}
              >
                <TimeStampInfoIcon />
              </RiTooltip>
              {!showEntryError && (
                <Text component="span" size="XS" color="primary">
                  Timestamp - Sequence Number or *
                </Text>
              )}
              {showEntryError && (
                <Text
                  component="span"
                  size="XS"
                  color="danger"
                  data-testid="stream-entry-error"
                >
                  {entryIdError}
                </Text>
              )}
            </InlineRow>
          }
        >
          <TextInput
            ref={entryIdRef}
            name={config.entryId.name}
            id={config.entryId.id}
            placeholder={config.entryId.placeholder}
            value={entryID}
            onChange={handleEntryIdChange}
            onBlur={onEntryIdBlur}
            onFocus={() => setIsEntryIdFocused(true)}
            autoComplete="off"
            data-testid={config.entryId.id}
          />
        </FormField>
      </EntryIdContainer>

      <FieldsWrapper>
        <AddMultipleFields
          items={fields}
          isClearDisabled={isClearDisabled}
          onClickRemove={onClickRemove}
          onClickAdd={addField}
        >
          {(item, index) => (
            <Row align="center" gap="m">
              <FlexItem grow>
                <FormField>
                  <TextInput
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
                </FormField>
              </FlexItem>
              <FlexItem grow={2}>
                <FormField>
                  <TextInput
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
                </FormField>
              </FlexItem>
            </Row>
          )}
        </AddMultipleFields>
      </FieldsWrapper>
    </StreamGroupContent>
  )
}

export default StreamEntryFields
