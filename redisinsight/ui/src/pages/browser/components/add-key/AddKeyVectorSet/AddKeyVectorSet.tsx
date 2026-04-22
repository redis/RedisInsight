import React, { FormEvent, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toNumber } from 'lodash'

import { stringToBuffer } from 'uiSrc/utils'
import { addKeyStateSelector, addVectorSetKey } from 'uiSrc/slices/browser/keys'
import { CreateVectorSetWithExpireDto } from 'uiSrc/slices/interfaces/vectorSet'
import { ActionFooter } from 'uiSrc/pages/browser/components/action-footer'
import {
  RiRadioGroupItemIndicator,
  RiRadioGroupItemRoot,
  RiRadioGroupRoot,
} from 'uiSrc/components/base/forms/radio-group/RadioGroup'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

import {
  SubmitElement,
  VectorSetElementFormFields,
} from 'uiSrc/pages/browser/modules/key-details/components/vector-set-details/vector-set-element-form'
import { useVectorSetElementForm } from 'uiSrc/pages/browser/modules/key-details/components/vector-set-details/hooks'

import { POPULATE_LABEL, POPULATE_OPTIONS, PopulateMode } from './constants'
import { Props } from './AddKeyVectorSet.types'
import * as S from './AddKeyVectorSet.styles'

const AddKeyVectorSet = ({ keyName = '', keyTTL, onCancel }: Props) => {
  const dispatch = useDispatch()
  const { loading } = useSelector(addKeyStateSelector)

  const [populateMode, setPopulateMode] = useState<string>(PopulateMode.Manual)

  const handleSubmit = (elements: SubmitElement[]) => {
    const data: CreateVectorSetWithExpireDto = {
      keyName: stringToBuffer(keyName),
      elements: elements.map((el) => ({
        ...el,
        name: stringToBuffer(el.name),
      })),
      ...(keyTTL !== undefined ? { expire: toNumber(keyTTL) } : {}),
    }
    dispatch(addVectorSetKey(data, () => onCancel()))
  }

  const formApi = useVectorSetElementForm({ onSubmit: handleSubmit })

  const [isKeyNameValid, setIsKeyNameValid] = useState<boolean>(false)
  useEffect(() => {
    setIsKeyNameValid(`${keyName}`.length > 0)
  }, [keyName])

  const isFormValid = isKeyNameValid && formApi.isFormValid

  const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (isFormValid) {
      formApi.submitData()
    }
  }

  return (
    <form onSubmit={onFormSubmit}>
      <Col gap="m">
        <FormField label={POPULATE_LABEL}>
          <RiRadioGroupRoot
            value={populateMode}
            onChange={(value) => setPopulateMode(value)}
            data-testid="add-key-vector-set-populate"
          >
            <S.RadioCardList gap="m">
              {POPULATE_OPTIONS.map((option) => (
                <S.RadioCard
                  key={option.value}
                  $disabled={option.disabled}
                  data-testid={`add-key-vector-set-populate-${option.value}`}
                  align="center"
                  gap="s"
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

        <VectorSetElementFormFields {...formApi} loading={loading} />
      </Col>

      <ActionFooter
        onCancel={() => onCancel(true)}
        onAction={formApi.submitData}
        actionText="Add Key"
        loading={loading}
        disabled={!isFormValid}
        actionTestId="add-key-vector-set-btn"
      />
    </form>
  )
}

export default AddKeyVectorSet
