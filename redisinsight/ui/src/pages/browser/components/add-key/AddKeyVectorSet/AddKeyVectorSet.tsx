import React, { FormEvent, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toNumber } from 'lodash'

import { stringToBuffer } from 'uiSrc/utils'
import {
  addKeyIntoList,
  addKeyStateSelector,
  addVectorSetKey,
} from 'uiSrc/slices/browser/keys'
import { KeyTypes } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { addMessageNotification } from 'uiSrc/slices/app/notifications'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  VectorSetCreationSource,
  VectorSetVectorFormat,
} from 'uiSrc/pages/browser/modules/key-details/components/vector-set-details/telemetry.constants'
import { CreateVectorSetWithExpireDto } from 'uiSrc/slices/interfaces/vectorSet'
import { useLoadData } from 'uiSrc/services/hooks'
import { ActionFooter } from 'uiSrc/pages/browser/components/action-footer'
import {
  RiRadioGroupItemIndicator,
  RiRadioGroupItemRoot,
  RiRadioGroupRoot,
} from 'uiSrc/components/base/forms/radio-group/RadioGroup'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { Spacer } from 'uiSrc/components/base/layout/spacer'

import {
  SubmitElement,
  VectorSetElementFormFields,
} from 'uiSrc/pages/browser/modules/key-details/components/vector-set-details/vector-set-element-form'
import { useVectorSetElementForm } from 'uiSrc/pages/browser/modules/key-details/components/vector-set-details/hooks'

import LoadSampleDataset, {
  VEC2WORD_COLLECTION_NAME,
  checkVec2WordExists,
  keyAlreadyExistsNotification,
  loadSampleDatasetFailedNotification,
  sampleDatasetLoadedNotification,
} from './LoadSampleDataset'
import { POPULATE_LABEL, POPULATE_OPTIONS, PopulateMode } from './constants'
import { Props } from './AddKeyVectorSet.types'
import * as S from './AddKeyVectorSet.styles'

const AddKeyVectorSet = ({
  keyName = '',
  keyTTL,
  onCancel,
  setKeyName,
  setKeyNameDisabled,
}: Props) => {
  const dispatch = useDispatch()
  const { loading } = useSelector(addKeyStateSelector)
  const { id: instanceId } = useSelector(connectedInstanceSelector)

  const [populateMode, setPopulateMode] = useState<PopulateMode>(
    PopulateMode.Manual,
  )
  const isSampleMode = populateMode === PopulateMode.Sample
  // Local gate covering the *entire* sample-dataset submit flow — including
  // the `checkVec2WordExists` preflight, which runs before `useLoadData`'s
  // own `loading` flag flips. The state drives the button's `disabled` /
  // `loading` props for rendering; the ref short-circuits synchronous
  // double-clicks that fire before React flushes the state update.
  const [isSubmittingSampleDataset, setIsSubmittingSampleDataset] =
    useState(false)
  const isSubmittingSampleDatasetRef = useRef(false)

  // Drive the parent-owned key-name input from the populate-mode toggle:
  // Sample → fixed `vec2word` (the bundled-file key), input locked; Manual →
  // clear and unlock so the user can pick their own.
  //
  // The cleanup branch fires on Sample → Manual toggle **and** on unmount
  // (e.g. the user switches the key type away from Vector Set while Sample is
  // active). In both cases we want to wipe the auto-populated `vec2word`
  // value so it doesn't bleed into the next subform.
  useEffect(() => {
    setKeyName?.(isSampleMode ? VEC2WORD_COLLECTION_NAME : '')
    setKeyNameDisabled?.(isSampleMode)
    return () => {
      if (isSampleMode) {
        setKeyName?.('')
        setKeyNameDisabled?.(false)
      }
    }
  }, [isSampleMode, setKeyName, setKeyNameDisabled])

  const { load: loadSampleDataset } = useLoadData()

  const handleSubmit = (elements: SubmitElement[]) => {
    const data: CreateVectorSetWithExpireDto = {
      keyName: stringToBuffer(keyName),
      elements: elements.map((el) => ({
        ...el,
        name: stringToBuffer(el.name),
      })),
      ...(keyTTL !== undefined ? { expire: toNumber(keyTTL) } : {}),
    }
    const vectorFormat = elements.some((el) => el.vectorFp32 !== undefined)
      ? VectorSetVectorFormat.Fp32
      : VectorSetVectorFormat.Values
    const hasAttributes = elements.some(
      (el) => typeof el.attributes === 'string' && el.attributes.length > 0,
    )
    dispatch(
      addVectorSetKey(data, () => {
        sendEventTelemetry({
          event: TelemetryEvent.VECTOR_SET_CREATED,
          eventData: {
            databaseId: instanceId,
            source: VectorSetCreationSource.Scratch,
            vectorFormat,
            hasAttributes,
          },
        })
        onCancel()
      }),
    )
  }

  const formApi = useVectorSetElementForm({ onSubmit: handleSubmit })

  const isKeyNameValid = `${keyName}`.length > 0

  // Sample mode bypasses the manual-entry form fields entirely — the keyName
  // and per-element values are dictated by the bundled data file.
  const isFormValid = isSampleMode
    ? true
    : isKeyNameValid && formApi.isFormValid

  const submitSampleDataset = async () => {
    if (isSubmittingSampleDatasetRef.current) return
    isSubmittingSampleDatasetRef.current = true
    setIsSubmittingSampleDataset(true)
    try {
      // Mirror vector-search's "already exists" branch: if `vec2word` is
      // already in the database, skip the bulk-import and surface an info
      // toast instead of silently re-running VADD on the existing key.
      if (await checkVec2WordExists(instanceId)) {
        dispatch(addMessageNotification(keyAlreadyExistsNotification()))
        onCancel()
        return
      }
      await loadSampleDataset(instanceId, VEC2WORD_COLLECTION_NAME)
      // Splice the new key into the Browser keys list — same pattern as the
      // manual addTypedKey flow — so it shows up immediately without
      // triggering a full refetch (and the loading spinner that comes with it).
      dispatch(
        addKeyIntoList({
          key: stringToBuffer(VEC2WORD_COLLECTION_NAME),
          keyType: KeyTypes.VectorSet,
        }),
      )
      sendEventTelemetry({
        event: TelemetryEvent.VECTOR_SET_SAMPLE_DATASET_LOADED,
        eventData: { databaseId: instanceId },
      })
      // The bundled vec2word dataset uses raw numeric vectors with no
      // attributes — values fixed at bundle time.
      sendEventTelemetry({
        event: TelemetryEvent.VECTOR_SET_CREATED,
        eventData: {
          databaseId: instanceId,
          source: VectorSetCreationSource.SampleDataset,
          vectorFormat: VectorSetVectorFormat.Values,
          hasAttributes: false,
        },
      })
      dispatch(addMessageNotification(sampleDatasetLoadedNotification()))
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
    } else {
      formApi.submitData()
    }
  }

  const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (isFormValid) {
      onClickAction()
    }
  }

  return (
    <form onSubmit={onFormSubmit}>
      <Col gap="m">
        <FormField label={POPULATE_LABEL}>
          <RiRadioGroupRoot
            value={populateMode}
            onChange={(value: PopulateMode) => setPopulateMode(value)}
            data-testid="add-key-vector-set-populate"
          >
            <S.RadioCardList gap="m">
              {POPULATE_OPTIONS.map((option) => (
                <S.RadioCard
                  key={option.value}
                  $disabled={option.disabled}
                  data-testid={`add-key-vector-set-populate-${option.value}`}
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

        {isSampleMode ? (
          <>
            <Spacer size="l" />
            <LoadSampleDataset />
          </>
        ) : (
          <VectorSetElementFormFields {...formApi} loading={loading} />
        )}
      </Col>

      <ActionFooter
        onCancel={() => onCancel(true)}
        onAction={onClickAction}
        actionText="Add Key"
        loading={loading || isSubmittingSampleDataset}
        disabled={!isFormValid || isSubmittingSampleDataset}
        actionTestId="add-key-vector-set-btn"
      />
    </form>
  )
}

export default AddKeyVectorSet
