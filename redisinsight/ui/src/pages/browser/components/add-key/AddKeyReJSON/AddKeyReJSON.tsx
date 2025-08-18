import React, { FormEvent, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiFormField } from 'uiBase/forms'
import { Maybe, stringToBuffer } from 'uiSrc/utils'
import { addKeyStateSelector, addReJSONKey } from 'uiSrc/slices/browser/keys'

import { MonacoJson } from 'uiSrc/components/monaco-editor'
import UploadFile from 'uiSrc/components/upload-file'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { ActionFooter } from 'uiSrc/pages/browser/components/action-footer'
import { CreateRejsonRlWithExpireDto } from 'apiSrc/modules/browser/rejson-rl/dto'

import { AddJSONFormConfig as config } from '../constants/fields-config'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onCancel: (isCancelled?: boolean) => void
}

const AddKeyReJSON = (props: Props) => {
  const { keyName = '', keyTTL, onCancel } = props
  const { loading } = useSelector(addKeyStateSelector)
  const [ReJSONValue, setReJSONValue] = useState<string>('')
  const [isFormValid, setIsFormValid] = useState<boolean>(false)

  const dispatch = useDispatch()
  const { instanceId } = useParams<{ instanceId: string }>()

  useEffect(() => {
    try {
      JSON.parse(ReJSONValue)
      if (keyName.length > 0) {
        setIsFormValid(true)
        return
      }
    } catch (e) {
      setIsFormValid(false)
    }

    setIsFormValid(false)
  }, [keyName, ReJSONValue])

  const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (isFormValid) {
      submitData()
    }
  }

  const submitData = (): void => {
    const data: CreateRejsonRlWithExpireDto = {
      keyName: stringToBuffer(keyName),
      data: ReJSONValue,
    }
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    dispatch(addReJSONKey(data, onCancel))
  }

  const onClick = () => {
    sendEventTelemetry({
      event: TelemetryEvent.BROWSER_JSON_VALUE_IMPORT_CLICKED,
      eventData: {
        databaseId: instanceId,
      },
    })
  }

  return (
    <form onSubmit={onFormSubmit}>
      <RiFormField label={config.value.label}>
        <>
          <MonacoJson
            value={ReJSONValue}
            onChange={setReJSONValue}
            disabled={loading}
            data-testid="json-value"
          />
          <RiRow justify="end">
            <RiFlexItem>
              <UploadFile
                onClick={onClick}
                onFileChange={setReJSONValue}
                accept="application/json, text/plain"
              />
            </RiFlexItem>
          </RiRow>
        </>
      </RiFormField>

      <ActionFooter
        onCancel={() => onCancel(true)}
        onAction={submitData}
        actionText="Add Key"
        loading={loading}
        disabled={!isFormValid}
        actionTestId="add-key-json-btn"
      />
    </form>
  )
}

export default AddKeyReJSON
