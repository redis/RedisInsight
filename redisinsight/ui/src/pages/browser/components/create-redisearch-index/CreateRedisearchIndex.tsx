import { EuiComboBoxOptionOption } from '@elastic/eui/src/components/combo_box/types'
import cx from 'classnames'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

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
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  IconButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { AutoTag } from 'uiSrc/components/base/forms/combo-box/AutoTag'
import { FormFieldset } from 'uiSrc/components/base/forms/fieldset'
import { InfoIcon } from 'uiSrc/components/base/icons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { HealthText, Text } from 'uiSrc/components/base/text'
import { Link } from 'uiSrc/components/base/link/Link'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { RiPopover } from 'uiSrc/components/base'
import { TextInput } from 'uiSrc/components/base/inputs'
import { CreateRedisearchIndexDto } from 'apiSrc/modules/browser/redisearch/dto'
import { Panel } from 'uiSrc/components/panel'

import { KEY_TYPE_OPTIONS, RedisearchIndexKeyType } from './constants'
import Divider from 'uiSrc/components/divider/Divider'
import styles from 'uiSrc/pages/browser/components/add-key/styles.module.scss'

export interface Props {
  onClosePanel?: () => void
  onCreateIndex?: () => void
}

const keyTypeOptions = KEY_TYPE_OPTIONS.map((item) => {
  const { value, color, text } = item
  return {
    value,
    inputDisplay: (
      <HealthText
        color={color}
        style={{ lineHeight: 'inherit' }}
        data-test-subj={value}
      >
        {text}
      </HealthText>
    ),
  }
})

const initialFieldValue = (fieldTypeOptions: any[], id = 0) => ({
  id,
  identifier: '',
  fieldType: fieldTypeOptions[0]?.value || '',
})

const StyledFooter = styled(Panel)`
  flex: 0 0 auto;
`

const StyledContent = styled(Col)`
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
`

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
      panelClassName={cx('popoverLikeTooltip')}
      closePopover={() => setIsInfoPopoverOpen(false)}
      button={
        <IconButton
          icon={InfoIcon}
          id="identifier-info-icon"
          aria-label="identifier info icon"
          data-testid="identifier-info-icon"
          onClick={() =>
            setIsInfoPopoverOpen((isPopoverOpen) => !isPopoverOpen)
          }
        />
      }
    >
      <>
        <Link
          variant="inline"
          size="S"
          href={getUtmExternalLink(
            'https://redis.io/commands/ft.create/#SCHEMA',
            {
              campaign: 'browser_search',
            },
          )}
          target="_blank"
        >
          Declares
        </Link>
        {' fields to index. '}
        {keyTypeSelected === RedisearchIndexKeyType.HASH
          ? 'Enter a hash field name.'
          : 'Enter a JSON path expression.'}
      </>
    </RiPopover>
  )

  return (
    <>
      <StyledContent gap="xl">
        <Row gap="m" grow={false}>
          <FlexItem grow>
            <FormField label="Index Name">
              <TextInput
                name="Index name"
                id="index-name"
                placeholder="Enter Index Name"
                value={indexName}
                onChange={setIndexName}
                autoComplete="off"
                data-testid="index-name"
              />
            </FormField>
          </FlexItem>
          <FlexItem grow>
            <FormFieldset
              legend={{ children: 'Select key type', display: 'hidden' }}
            >
              <FormField label="Key Type*">
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
              </FormField>
            </FormFieldset>
          </FlexItem>
        </Row>
        <Row grow={false}>
          <FlexItem grow>
            <AutoTag
              label="Key Prefixes"
              placeholder="Enter Prefix"
              selectedOptions={prefixes}
              onCreateOption={(searchValue) =>
                setPrefixes([...prefixes, { label: searchValue }])
              }
              onChange={(selectedOptions) => setPrefixes(selectedOptions)}
              data-testid="prefix-combobox"
            />
          </FlexItem>
        </Row>
        <Divider colorVariable="separatorColor" className={styles.divider} />
        <Col grow={false} gap="s">
          <Row align="center" gap="xs">
            <Text>Identifier</Text>
            {IdentifierInfo()}
          </Row>
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
                      name={`identifier-${item.id}`}
                      id={`identifier-${item.id}`}
                      placeholder="Enter Identifier"
                      value={item.identifier}
                      onChange={(value) =>
                        handleFieldChange('identifier', item.id, value)
                      }
                      ref={
                        index === fields.length - 1 ? lastAddedIdentifier : null
                      }
                      autoComplete="off"
                      data-testid={`identifier-${item.id}`}
                    />
                  </FormField>
                </FlexItem>
                <FlexItem grow>
                  <FormField>
                    <RiSelect
                      options={fieldTypeOptions}
                      value={item.fieldType}
                      onChange={(value: string) =>
                        handleFieldChange('fieldType', item.id, value)
                      }
                      data-testid={`field-type-${item.id}`}
                    />
                  </FormField>
                </FlexItem>
              </Row>
            )}
          </AddMultipleFields>
        </Col>
      </StyledContent>
      <Divider colorVariable="separatorColor" className={styles.divider} />{' '}
      <StyledFooter justify="end" gap="m">
        <FlexItem>
          <SecondaryButton
            color="secondary"
            onClick={() => onClosePanel?.()}
            data-testid="create-index-cancel-btn"
          >
            Cancel
          </SecondaryButton>
        </FlexItem>
        <FlexItem>
          <PrimaryButton
            size="m"
            loading={loading}
            disabled={loading}
            onClick={submitData}
            data-testid="create-index-btn"
          >
            Create Index
          </PrimaryButton>
        </FlexItem>
      </StyledFooter>
    </>
  )
}

export default CreateRedisearchIndex
