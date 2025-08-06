import { EuiComboBoxOptionOption } from '@elastic/eui/src/components/combo_box/types'
import cx from 'classnames'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { RiFlexItem, RiRow } from 'uiBase/layout'
import {
  RiIconButton,
  RiPrimaryButton,
  RiSecondaryButton,
  RiFormField,
  RiAutoTag,
  RiFormFieldset,
  RiSelect,
} from 'uiBase/forms'
import { InfoIcon } from 'uiBase/icons'
import { RiHealthText, RiText } from 'uiBase/text'
import { RiLink } from 'uiBase/display'
import { RiPopover } from 'uiBase/index'
import { RiTextInput } from 'uiBase/inputs'
import Divider from 'uiSrc/components/divider/Divider'
import {
  createIndexStateSelector,
  createRedisearchIndexAction,
} from 'uiSrc/slices/browser/redisearch'
import { stringToBuffer } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { keysSelector } from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { getFieldTypeOptions } from 'uiSrc/utils/redisearch'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import AddMultipleFields from 'uiSrc/pages/browser/components/add-multiple-fields'
import { CreateRedisearchIndexDto } from 'apiSrc/modules/browser/redisearch/dto'

import { KEY_TYPE_OPTIONS, RedisearchIndexKeyType } from './constants'

import styles from './styles.module.scss'

export interface Props {
  onClosePanel?: () => void
  onCreateIndex?: () => void
}

const keyTypeOptions = KEY_TYPE_OPTIONS.map((item) => {
  const { value, color, text } = item
  return {
    value,
    inputDisplay: (
      <RiHealthText
        color={color}
        style={{ lineHeight: 'inherit' }}
        data-test-subj={value}
      >
        {text}
      </RiHealthText>
    ),
  }
})

const initialFieldValue = (fieldTypeOptions: any[], id = 0) => ({
  id,
  identifier: '',
  fieldType: fieldTypeOptions[0]?.value || '',
})

const CreateRedisearchIndex = ({ onClosePanel, onCreateIndex }: Props) => {
  const { viewType } = useSelector(keysSelector)
  const { loading } = useSelector(createIndexStateSelector)
  const { id: instanceId, modules } = useSelector(connectedInstanceSelector)

  const [keyTypeSelected, setKeyTypeSelected] =
    useState<RedisearchIndexKeyType>(keyTypeOptions[0].value)
  const [prefixes, setPrefixes] = useState<EuiComboBoxOptionOption[]>([])
  const [indexName, setIndexName] = useState<string>('')
  const [fieldTypeOptions, setFieldTypeOptions] =
    useState<ReturnType<typeof getFieldTypeOptions>>(getFieldTypeOptions)
  const [fields, setFields] = useState<any[]>([
    initialFieldValue(fieldTypeOptions),
  ])

  const [isInfoPopoverOpen, setIsInfoPopoverOpen] = useState<boolean>(false)

  const lastAddedIdentifier = useRef<HTMLInputElement>(null)
  const prevCountFields = useRef<number>(0)

  const dispatch = useDispatch()

  useEffect(() => {
    if (
      prevCountFields.current !== 0 &&
      prevCountFields.current < fields.length
    ) {
      lastAddedIdentifier.current?.focus()
    }
    prevCountFields.current = fields.length
  }, [fields.length])

  useEffect(() => {
    setFieldTypeOptions(getFieldTypeOptions)
  }, [modules])

  const addField = () => {
    const lastFieldId = fields[fields.length - 1].id
    setFields([...fields, initialFieldValue(fieldTypeOptions, lastFieldId + 1)])
  }

  const removeField = (id: number) => {
    setFields((fields) => fields.filter((item) => item.id !== id))
  }

  const clearFieldsValues = (id: number) => {
    setFields((fields) =>
      fields.map((item) =>
        item.id === id ? initialFieldValue(fieldTypeOptions, id) : item,
      ),
    )
  }

  const onClickRemove = ({ id }: any) => {
    if (fields.length === 1) {
      clearFieldsValues(id)
      return
    }

    removeField(id)
  }

  const handleFieldChange = (formField: string, id: number, value: string) => {
    setFields((fields) =>
      fields.map((item) =>
        item.id === id ? { ...item, [formField]: value } : item,
      ),
    )
  }

  const submitData = () => {
    const data: CreateRedisearchIndexDto = {
      index: stringToBuffer(indexName),
      type: keyTypeSelected,
      prefixes: prefixes.map((p) => stringToBuffer(p.label as string)),
      fields: fields.map((item) => ({
        name: stringToBuffer(item.identifier),
        type: item.fieldType,
      })),
    }

    dispatch(createRedisearchIndexAction(data, onSuccess))
  }

  const onSuccess = (data: CreateRedisearchIndexDto) => {
    sendEventTelemetry({
      event: TelemetryEvent.SEARCH_INDEX_ADDED,
      eventData: {
        databaseId: instanceId,
        view: viewType,
        dataType: data.type,
        countOfPrefixes: data.prefixes?.length || 0,
        countOfFieldNames: data.fields?.length || 0,
      },
    })

    onCreateIndex?.()
  }

  const isClearDisabled = (item: any): boolean =>
    fields.length === 1 && !item.identifier.length

  const IdentifierInfo = () => (
    <RiPopover
      anchorPosition="upCenter"
      isOpen={isInfoPopoverOpen}
      anchorClassName={styles.unsupportedInfo}
      panelClassName={cx('popoverLikeTooltip')}
      closePopover={() => setIsInfoPopoverOpen(false)}
      button={
        <RiIconButton
          icon={InfoIcon}
          id="identifier-info-icon"
          aria-label="identifier info icon"
          data-testid="identifier-info-icon"
          className={styles.infoIcon}
          onClick={() =>
            setIsInfoPopoverOpen((isPopoverOpen) => !isPopoverOpen)
          }
        />
      }
    >
      <>
        <RiLink
          href={getUtmExternalLink(
            'https://redis.io/commands/ft.create/#SCHEMA',
            {
              campaign: 'browser_search',
            },
          )}
          target="_blank"
        >
          Declares
        </RiLink>
        {' fields to index. '}
        {keyTypeSelected === RedisearchIndexKeyType.HASH
          ? 'Enter a hash field name.'
          : 'Enter a JSON path expression.'}
      </>
    </RiPopover>
  )

  return (
    <>
      <div className="eui-yScroll">
        <div className={styles.contentFields}>
          <div className={styles.fieldsContainer}>
            <RiRow className={styles.row}>
              <RiFlexItem grow>
                <RiFormField label="Index Name">
                  <RiTextInput
                    name="Index name"
                    id="index-name"
                    placeholder="Enter Index Name"
                    value={indexName}
                    onChange={setIndexName}
                    autoComplete="off"
                    data-testid="index-name"
                  />
                </RiFormField>
              </RiFlexItem>
              <RiFlexItem grow>
                <RiFormFieldset
                  legend={{ children: 'Select key type', display: 'hidden' }}
                >
                  <RiFormField label="Key Type*">
                    <RiSelect
                      options={keyTypeOptions}
                      valueRender={({ option }) =>
                        option.inputDisplay || option.value
                      }
                      value={keyTypeSelected}
                      onChange={(value: RedisearchIndexKeyType) =>
                        setKeyTypeSelected(value)
                      }
                      data-testid="key-type"
                    />
                  </RiFormField>
                </RiFormFieldset>
              </RiFlexItem>
            </RiRow>
            <RiRow className={styles.row} style={{ maxWidth: '100%' }}>
              <RiFlexItem grow style={{ minWidth: '100%', maxWidth: '100%' }}>
                <RiAutoTag
                  label="Key Prefixes"
                  placeholder="Enter Prefix"
                  selectedOptions={prefixes}
                  onCreateOption={(searchValue) =>
                    setPrefixes([...prefixes, { label: searchValue }])
                  }
                  onChange={(selectedOptions) => setPrefixes(selectedOptions)}
                  className={styles.combobox}
                  data-testid="prefix-combobox"
                />
              </RiFlexItem>
            </RiRow>
            <Divider
              colorVariable="separatorColor"
              className={styles.controlsDivider}
            />
            <RiText color="subdued">
              Identifier
              {IdentifierInfo()}
            </RiText>

            <AddMultipleFields
              items={fields}
              isClearDisabled={isClearDisabled}
              onClickRemove={onClickRemove}
              onClickAdd={addField}
            >
              {(item, index) => (
                <RiRow align="center">
                  <RiFlexItem grow>
                    <RiFormField>
                      <RiTextInput
                        name={`identifier-${item.id}`}
                        id={`identifier-${item.id}`}
                        placeholder="Enter Identifier"
                        value={item.identifier}
                        onChange={(value) =>
                          handleFieldChange('identifier', item.id, value)
                        }
                        ref={
                          index === fields.length - 1
                            ? lastAddedIdentifier
                            : null
                        }
                        autoComplete="off"
                        data-testid={`identifier-${item.id}`}
                      />
                    </RiFormField>
                  </RiFlexItem>
                  <RiFlexItem grow>
                    <RiFormField>
                      <RiSelect
                        options={fieldTypeOptions}
                        value={item.fieldType}
                        onChange={(value: string) =>
                          handleFieldChange('fieldType', item.id, value)
                        }
                        data-testid={`field-type-${item.id}`}
                      />
                    </RiFormField>
                  </RiFlexItem>
                </RiRow>
              )}
            </AddMultipleFields>
          </div>
        </div>
      </div>
      <>
        <RiRow justify="end" gap="m" style={{ padding: 18 }}>
          <RiFlexItem>
            <RiSecondaryButton
              color="secondary"
              onClick={() => onClosePanel?.()}
              className="btn-cancel btn-back"
              data-testid="create-index-cancel-btn"
            >
              Cancel
            </RiSecondaryButton>
          </RiFlexItem>
          <RiFlexItem>
            <RiPrimaryButton
              size="m"
              loading={loading}
              disabled={loading}
              onClick={submitData}
              data-testid="create-index-btn"
            >
              Create Index
            </RiPrimaryButton>
          </RiFlexItem>
        </RiRow>
      </>
    </>
  )
}

export default CreateRedisearchIndex
