import React, { FormEvent, useEffect, useState } from 'react'
import { useAppDispatch } from 'uiSrc/slices/hooks'
import { addStreamKey } from 'uiSrc/slices/browser/keys'
import {
  entryIdRegex,
  isRequiredStringsValid,
  Maybe,
  stringToBuffer,
} from 'uiSrc/utils'
import { useTranslation } from 'uiSrc/i18n'
import { StreamEntryFields } from 'uiSrc/pages/browser/modules/key-details/components/stream-details/add-stream-entity'
import { ActionFooter } from 'uiSrc/pages/browser/components/action-footer'
import { CreateStreamDto } from 'apiClient'

import styles from './styles.module.scss'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onCancel: (isCancelled?: boolean) => void
}

export const INITIAL_STREAM_FIELD_STATE = {
  name: '',
  value: '',
  id: 0,
}

const AddKeyStream = (props: Props) => {
  const { keyName = '', keyTTL, onCancel } = props
  const { t } = useTranslation()

  const [entryIdError, setEntryIdError] = useState('')
  const [entryID, setEntryID] = useState<string>('*')
  const [fields, setFields] = useState<any[]>([
    { ...INITIAL_STREAM_FIELD_STATE },
  ])
  const [isFormValid, setIsFormValid] = useState<boolean>(false)

  const dispatch = useAppDispatch()

  useEffect(() => {
    const isValid = isRequiredStringsValid(keyName) && !entryIdError
    setIsFormValid(isValid)
  }, [keyName, fields, entryIdError])

  useEffect(() => {
    validateEntryID()
  }, [entryID])

  const validateEntryID = () => {
    setEntryIdError(
      entryIdRegex.test(entryID) ? '' : t('browser.addKey.stream.entryIdError'),
    )
  }

  const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (isFormValid) {
      submitData()
    }
  }

  const submitData = (): void => {
    const data: CreateStreamDto = {
      keyName: stringToBuffer(keyName),
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
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    dispatch(addStreamKey(data, onCancel))
  }

  return (
    <form className={styles.container} onSubmit={onFormSubmit}>
      <StreamEntryFields
        entryID={entryID}
        entryIdError={entryIdError}
        fields={fields}
        setFields={setFields}
        setEntryID={setEntryID}
      />
      <ActionFooter
        onCancel={() => onCancel(true)}
        onAction={submitData}
        actionText={t('browser.addKey.button.submit')}
        disabled={!isFormValid}
        actionTestId="add-key-hash-btn"
      />
    </form>
  )
}

export default AddKeyStream
