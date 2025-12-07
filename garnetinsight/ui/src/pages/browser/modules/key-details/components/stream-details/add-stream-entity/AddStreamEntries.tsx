import { toNumber } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { entryIdRegex, stringToBuffer } from 'uiSrc/utils'
import {
  keysSelector,
  selectedKeyDataSelector,
} from 'uiSrc/slices/browser/keys'
import {
  addNewEntriesAction,
  streamDataSelector,
} from 'uiSrc/slices/browser/stream'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { AddStreamFormConfig as config } from 'uiSrc/pages/browser/components/add-key/constants/fields-config'
import { INITIAL_STREAM_FIELD_STATE } from 'uiSrc/pages/browser/components/add-key/AddKeyStream/AddKeyStream'
import { KeyTypes } from 'uiSrc/constants'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { Col } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { AddStreamEntriesDto } from 'apiSrc/modules/browser/stream/dto'

import StreamEntryFields from './StreamEntryFields/StreamEntryFields'
import { Panel } from 'uiSrc/components/panel'

import { EntryContent } from '../../common/AddKeysContainer.styled'

export interface Props {
  closePanel: (isCancelled?: boolean) => void
}

const AddStreamEntries = (props: Props) => {
  const { closePanel } = props
  const { lastGeneratedId } = useSelector(streamDataSelector)
  const { name: keyName = '' } = useSelector(selectedKeyDataSelector) ?? {
    name: undefined,
  }
  const { viewType } = useSelector(keysSelector)
  const { id: instanceId } = useSelector(connectedInstanceSelector)

  const [entryID, setEntryID] = useState<string>('*')
  const [entryIdError, setEntryIdError] = useState('')
  const [fields, setFields] = useState<any[]>([
    { ...INITIAL_STREAM_FIELD_STATE },
  ])
  const [isFormValid, setIsFormValid] = useState<boolean>(false)

  const dispatch = useDispatch()

  useEffect(() => {
    const isValid = !entryIdError
    setIsFormValid(isValid)
  }, [fields, entryIdError])

  useEffect(() => {
    validateEntryID()
  }, [entryID])

  const validateEntryID = () => {
    if (!entryIdRegex.test(entryID)) {
      setEntryIdError(`${config.entryId.name} format is incorrect`)
      return
    }

    if (!lastGeneratedId) {
      setEntryIdError('')
      return
    }

    if (entryID === '*') {
      setEntryIdError('')
      return
    }

    const [lastIdTimestamp, lastId] = lastGeneratedId.split('-')
    const [idTimestamp, id] = entryID?.split('-')

    if (toNumber(idTimestamp) > toNumber(lastIdTimestamp)) {
      setEntryIdError('')
      return
    }

    if (
      toNumber(lastIdTimestamp) === toNumber(idTimestamp) &&
      (id === '*' || toNumber(id) > toNumber(lastId))
    ) {
      setEntryIdError('')
      return
    }
    setEntryIdError('Must be greater than the last ID')
  }

  const onSuccessAdded = () => {
    closePanel()
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_VALUE_ADDED,
        TelemetryEvent.TREE_VIEW_KEY_VALUE_ADDED,
      ),
      eventData: {
        databaseId: instanceId,
        keyType: KeyTypes.Stream,
        numberOfAdded: fields.length,
      },
    })
  }

  const submitData = (): void => {
    if (isFormValid) {
      const data: AddStreamEntriesDto = {
        keyName,
        entries: [
          {
            id: entryID,
            fields: [
              ...fields.map(({ name, value }) => ({
                name: stringToBuffer(name),
                value: stringToBuffer(value),
              })),
            ],
          },
        ],
      }
      dispatch(addNewEntriesAction(data, onSuccessAdded))
    }
  }

  return (
    <Col gap="m">
      <EntryContent data-test-subj="add-stream-field-panel">
        <StreamEntryFields
          entryIdError={entryIdError}
          entryID={entryID}
          setEntryID={setEntryID}
          fields={fields}
          setFields={setFields}
        />
      </EntryContent>
      <Panel justify="end" gap="m">
        <SecondaryButton
          onClick={() => closePanel(true)}
          data-testid="cancel-members-btn"
        >
          Cancel
        </SecondaryButton>
        <PrimaryButton
          size="m"
          color="secondary"
          onClick={submitData}
          disabled={!isFormValid}
          data-testid="save-elements-btn"
        >
          Save
        </PrimaryButton>
      </Panel>
    </Col>
  )
}

export default AddStreamEntries
