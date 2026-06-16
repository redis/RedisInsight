import React, { FormEvent, useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'

import { stringToBuffer } from 'uiSrc/utils'
import { addKeyIntoList, addKeyStateSelector } from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { addMessageNotification } from 'uiSrc/slices/app/notifications'
import { ApiEndpoints, KeyTypes } from 'uiSrc/constants'
import { useLoadData } from 'uiSrc/services/hooks'
import { ActionFooter } from 'uiSrc/pages/browser/components/action-footer'
import {
  RiRadioGroupItemIndicator,
  RiRadioGroupItemRoot,
  RiRadioGroupRoot,
} from 'uiSrc/components/base/forms/radio-group/RadioGroup'
import { Spacer } from 'uiSrc/components/base/layout'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { useDatabaseEnvironment } from 'uiSrc/components/hooks/useDatabaseEnvironment'
import { Environment } from 'apiClient'

import LoadSampleDataset, {
  DEFAULT_SAMPLE_DATASET,
  SampleArrayDataset,
  applyKeyTtl,
  checkArrayKeyExists,
  keyAlreadyExistsNotification,
  loadSampleDatasetFailedNotification,
  sampleDatasetLoadedNotification,
  sampleDatasetTtlFailedNotification,
} from './LoadSampleDataset'
import { POPULATE_LABEL, POPULATE_OPTIONS, PopulateMode } from './constants'
import * as S from './AddKeyArray.styles'

import { Props } from './AddKeyArray.types'

const AddKeyArray = (props: Props) => {
  const { keyTTL, onCancel, setKeyName, setKeyNameDisabled } = props
  const [populateMode, setPopulateMode] = useState<PopulateMode>(
    PopulateMode.Manual,
  )
  const isSampleMode = populateMode === PopulateMode.Sample
  const [dataset, setDataset] = useState<SampleArrayDataset>(
    DEFAULT_SAMPLE_DATASET,
  )

  const { loading } = useAppSelector(addKeyStateSelector)
  const { id: instanceId } = useAppSelector(connectedInstanceSelector)

  // Mirrors the Browser's "Load sample data" production guard.
  const { environment } = useDatabaseEnvironment()
  const isProductionDatabase = environment === Environment.Production

  const dispatch = useAppDispatch()

  // The ref short-circuits synchronous double-clicks before React flushes the
  // state update; the state drives the button's disabled/loading.
  const [isSubmittingSampleDataset, setIsSubmittingSampleDataset] =
    useState(false)
  const isSubmittingSampleDatasetRef = useRef(false)

  const { load } = useLoadData(
    ApiEndpoints.BULK_ACTIONS_IMPORT_ARRAY_COLLECTION,
  )

  // Sample mode locks the parent key-name input to the dataset's fixed key; the
  // cleanup (Manual toggle or unmount) clears it so it doesn't bleed into the
  // next subform.
  useEffect(() => {
    setKeyName?.(isSampleMode ? dataset.keyName : '')
    setKeyNameDisabled?.(isSampleMode)
    return () => {
      if (isSampleMode) {
        setKeyName?.('')
        setKeyNameDisabled?.(false)
      }
    }
  }, [isSampleMode, dataset, setKeyName, setKeyNameDisabled])

  const submitSampleDataset = async () => {
    if (isProductionDatabase || isSubmittingSampleDatasetRef.current) return
    isSubmittingSampleDatasetRef.current = true
    setIsSubmittingSampleDataset(true)
    try {
      if (await checkArrayKeyExists(instanceId, dataset.keyName)) {
        dispatch(
          addMessageNotification(keyAlreadyExistsNotification(dataset.keyName)),
        )
        onCancel()
        return
      }
      const overview = await load(instanceId, dataset.collectionName)
      // Bulk-import returns 200 even when commands fail; a sample is one
      // ARSET/ARMSET, so fewer than one succeeded means the key wasn't created.
      if (
        !overview?.summary ||
        overview.summary.failed > 0 ||
        overview.summary.succeed < 1
      ) {
        throw new Error('Sample dataset import reported failures')
      }
      // Apply the optional TTL best-effort: the import sets no expiration, and
      // if this fails the key still exists — so register it with a
      // partial-success notice rather than a total failure.
      let ttlApplied = true
      if (keyTTL !== undefined && keyTTL !== null) {
        try {
          await applyKeyTtl(instanceId, dataset.keyName, keyTTL)
        } catch {
          ttlApplied = false
        }
      }
      dispatch(
        addKeyIntoList({
          key: stringToBuffer(dataset.keyName),
          keyType: KeyTypes.Array,
        }),
      )
      dispatch(
        addMessageNotification(
          ttlApplied
            ? sampleDatasetLoadedNotification(dataset.keyName)
            : sampleDatasetTtlFailedNotification(dataset.keyName),
        ),
      )
      onCancel()
    } catch {
      dispatch(addMessageNotification(loadSampleDatasetFailedNotification()))
    } finally {
      isSubmittingSampleDatasetRef.current = false
      setIsSubmittingSampleDataset(false)
    }
  }

  const onClickAction = () => {
    if (isSampleMode) {
      submitSampleDataset()
    }
  }

  const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    onClickAction()
  }

  return (
    <form onSubmit={onFormSubmit}>
      <FormField label={POPULATE_LABEL}>
        <RiRadioGroupRoot
          value={populateMode}
          onChange={(value: PopulateMode) => setPopulateMode(value)}
          disabled={isSubmittingSampleDataset}
          data-testid="add-key-array-populate"
        >
          <S.RadioCardList gap="m">
            {POPULATE_OPTIONS.map((option) => (
              <S.RadioCard
                key={option.value}
                $disabled={option.disabled}
                data-testid={`add-key-array-populate-${option.value}`}
              >
                <RiRadioGroupItemRoot
                  value={option.value}
                  disabled={option.disabled}
                >
                  <RiRadioGroupItemIndicator />
                </RiRadioGroupItemRoot>
                <Col gap="xs">
                  <Text size="M" color="primary">
                    {option.label}
                  </Text>
                  {option.description && (
                    <Text size="XS" color="secondary">
                      {option.description}
                    </Text>
                  )}
                </Col>
              </S.RadioCard>
            ))}
          </S.RadioCardList>
        </RiRadioGroupRoot>
      </FormField>
      <Spacer size="l" />
      {isSampleMode ? (
        <>
          <LoadSampleDataset
            dataset={dataset}
            onDatasetChange={setDataset}
            disabled={isSubmittingSampleDataset}
          />
          {isProductionDatabase && (
            <>
              <Spacer size="m" />
              <Text
                size="XS"
                color="danger"
                data-testid="add-key-array-prod-warning"
              >
                Loading sample data is disabled for your production database to
                avoid accidental data modifications.
              </Text>
            </>
          )}
        </>
      ) : (
        <Text
          size="M"
          color="secondary"
          data-testid="add-key-array-placeholder"
        >
          Array creation options are coming soon.
        </Text>
      )}
      <ActionFooter
        onCancel={() => onCancel(true)}
        onAction={onClickAction}
        actionText="Add Key"
        loading={loading || isSubmittingSampleDataset}
        disabled={
          !isSampleMode || isSubmittingSampleDataset || isProductionDatabase
        }
        actionTestId="add-key-array-btn"
      />
    </form>
  )
}

export default AddKeyArray
