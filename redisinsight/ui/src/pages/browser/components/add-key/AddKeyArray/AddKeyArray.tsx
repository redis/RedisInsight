import React, { FormEvent, useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'

import {
  ARRAY_INDEX_MAX,
  isValidArrayIndex,
  parseArrayIndex,
  stringToBuffer,
} from 'uiSrc/utils'
import {
  addArrayKey,
  addKeyIntoList,
  addKeyStateSelector,
} from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { addMessageNotification } from 'uiSrc/slices/app/notifications'
import { ApiEndpoints, KeyTypes } from 'uiSrc/constants'
import { useLoadData } from 'uiSrc/services/hooks'
import { ActionFooter } from 'uiSrc/pages/browser/components/action-footer'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
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
import { CreateArrayWithExpireDto, Environment } from 'apiClient'

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
import {
  ArrayCreationMode,
  CONTIGUOUS_MODE,
  CREATION_MODE_OPTIONS,
  DEFAULT_START_INDEX,
  POPULATE_LABEL,
  POPULATE_OPTIONS,
  PopulateMode,
} from './constants'
import {
  transformToContiguousMode,
  transformToSparseMode,
} from './AddKeyArray.transforms'
import AddKeyArrayContiguous from './AddKeyArrayContiguous'
import AddKeyArraySparse from './AddKeyArraySparse'
import * as S from './AddKeyArray.styles'

import {
  ContiguousValue,
  INITIAL_SPARSE_ELEMENT,
  Props,
  SparseValue,
} from './AddKeyArray.types'

// Contiguous mode writes values to consecutive indexes, so the last one
// (start + count - 1) must also stay within the u64 range.
const isValidContiguousRange = (startIndex: string, count: number): boolean => {
  const start = parseArrayIndex(startIndex)
  if (start === null) return false
  return BigInt(start) + BigInt(Math.max(count - 1, 0)) <= ARRAY_INDEX_MAX
}

const AddKeyArray = (props: Props) => {
  const {
    keyName = '',
    keyTTL,
    onCancel,
    setKeyName,
    setKeyNameDisabled,
  } = props
  const [populateMode, setPopulateMode] = useState<PopulateMode>(
    PopulateMode.Manual,
  )
  const isSampleMode = populateMode === PopulateMode.Sample
  const [dataset, setDataset] = useState<SampleArrayDataset>(
    DEFAULT_SAMPLE_DATASET,
  )

  const [mode, setMode] = useState<ArrayCreationMode>(CONTIGUOUS_MODE)
  const [contiguous, setContiguous] = useState<ContiguousValue>({
    startIndex: DEFAULT_START_INDEX,
    values: [''],
  })
  const [sparse, setSparse] = useState<SparseValue>({
    elements: [{ ...INITIAL_SPARSE_ELEMENT }],
  })

  const { loading } = useAppSelector(addKeyStateSelector)
  const { id: instanceId } = useAppSelector(connectedInstanceSelector)

  // Mirrors the Browser's "Load sample data" production guard.
  const { environment } = useDatabaseEnvironment()
  const isProductionDatabase = environment === Environment.Production

  const dispatch = useAppDispatch()

  // Mirror AddKeyList: values may stay empty strings — only the key name and
  // the indexes gate submission.
  const isManualFormValid =
    keyName.length > 0 &&
    (mode === CONTIGUOUS_MODE
      ? isValidContiguousRange(contiguous.startIndex, contiguous.values.length)
      : sparse.elements.every(({ index }) => isValidArrayIndex(index)))

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

  const submitManualData = (): void => {
    const data: CreateArrayWithExpireDto =
      mode === CONTIGUOUS_MODE
        ? transformToContiguousMode({
            keyName,
            startIndex: contiguous.startIndex,
            values: contiguous.values,
          })
        : transformToSparseMode({ keyName, elements: sparse.elements })
    if (keyTTL !== undefined && keyTTL !== null) {
      data.expire = keyTTL
    }
    dispatch(addArrayKey(data, onCancel))
  }

  const onClickAction = () => {
    if (isSampleMode) {
      submitSampleDataset()
    } else if (isManualFormValid) {
      submitManualData()
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
        <>
          <RiSelect
            value={mode}
            options={CREATION_MODE_OPTIONS}
            onChange={(value) => setMode(value as ArrayCreationMode)}
            data-testid="creation-mode-select"
          />
          <Spacer size="m" />
          {mode === CONTIGUOUS_MODE ? (
            <AddKeyArrayContiguous
              disabled={loading}
              value={contiguous}
              onChange={setContiguous}
            />
          ) : (
            <AddKeyArraySparse
              disabled={loading}
              value={sparse}
              onChange={setSparse}
            />
          )}
        </>
      )}
      <ActionFooter
        onCancel={() => onCancel(true)}
        onAction={onClickAction}
        actionText="Add Key"
        loading={loading || isSubmittingSampleDataset}
        disabled={
          isSampleMode
            ? isSubmittingSampleDataset || isProductionDatabase
            : !isManualFormValid
        }
        actionTestId="add-key-array-btn"
      />
    </form>
  )
}

export default AddKeyArray
