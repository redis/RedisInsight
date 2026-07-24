import React, { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import { toNumber } from 'lodash'

import { stringToBuffer, validateScoreNumber } from 'uiSrc/utils'
import { isNaNConvertedString } from 'uiSrc/utils/numbers'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import {
  fetchAddZSetMembers,
  resetUpdateScore,
  updateZsetScoreStateSelector,
} from 'uiSrc/slices/browser/zset'

import { AddZsetFormConfig as config } from 'uiSrc/pages/browser/components/add-key/constants/fields-config'
import {
  INITIAL_ZSET_MEMBER_STATE,
  IZsetMemberState,
} from 'uiSrc/pages/browser/components/add-key/AddKeyZset/interfaces'
import AddMultipleFields from 'uiSrc/pages/browser/components/add-multiple-fields'
import { ISetMemberState } from 'uiSrc/pages/browser/components/add-key/AddKeySet/interfaces'

import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { TextInput } from 'uiSrc/components/base/inputs'
import {
  BrowserConfirmationCommandId,
  useProductionWriteConfirmation,
} from 'uiSrc/components/production-write-confirmation'
import { useTranslation } from 'uiSrc/i18n'

import { EntryContent } from '../../common/AddKeysContainer.styled'

export interface Props {
  closePanel: (isCancelled?: boolean) => void
}

const AddZsetMembers = (props: Props) => {
  const { closePanel } = props
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const [isFormValid, setIsFormValid] = useState<boolean>(false)
  const [members, setMembers] = useState<IZsetMemberState[]>([
    { ...INITIAL_ZSET_MEMBER_STATE },
  ])
  const { loading } = useAppSelector(updateZsetScoreStateSelector)
  const { name: selectedKey = '' } = useAppSelector(
    selectedKeyDataSelector,
  ) ?? {
    name: undefined,
  }
  const lastAddedMemberName = useRef<HTMLInputElement>(null)
  const { requestConfirmation } = useProductionWriteConfirmation()

  useEffect(
    () =>
      // componentWillUnmount
      () => {
        dispatch(resetUpdateScore())
      },
    [],
  )

  useEffect(() => {
    members.every((member) => {
      if (!member.score?.toString().length) {
        setIsFormValid(false)
        return false
      }

      if (!isNaNConvertedString(member.score)) {
        setIsFormValid(true)
        return true
      }

      setIsFormValid(false)
      return false
    })
  }, [members])

  useEffect(() => {
    lastAddedMemberName.current?.focus()
  }, [members.length])

  const addMember = () => {
    const lastField = members[members.length - 1]
    const newState = [
      ...members,
      {
        ...INITIAL_ZSET_MEMBER_STATE,
        id: lastField.id + 1,
      },
    ]
    setMembers(newState)
  }

  const removeMember = (id: number) => {
    const newState = members.filter((item) => item.id !== id)
    setMembers(newState)
  }

  const clearMemberValues = (id: number) => {
    const newState = members.map((item) =>
      item.id === id
        ? {
            ...item,
            name: '',
            score: '',
          }
        : item,
    )
    setMembers(newState)
  }

  const onClickRemove = ({ id }: ISetMemberState) => {
    if (members.length === 1) {
      clearMemberValues(id)
      return
    }

    removeMember(id)
  }

  const validateScore = (value: any) => {
    const validatedValue = validateScoreNumber(value)
    return validatedValue.toString().length ? validatedValue : ''
  }

  const handleScoreBlur = (item: IZsetMemberState) => {
    const { score } = item
    const newState = members.map((currentItem) => {
      if (currentItem.id !== item.id) {
        return currentItem
      }
      if (isNaNConvertedString(score)) {
        return {
          ...currentItem,
          score: '',
        }
      }
      if (score.length) {
        return {
          ...currentItem,
          score: toNumber(score).toString(),
        }
      }
      return currentItem
    })
    setMembers(newState)
  }

  const handleMemberChange = (formField: string, id: number, value: any) => {
    let validatedValue = value
    if (formField === 'score') {
      validatedValue = validateScore(value)
    }

    const newState = members.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          [formField]: validatedValue,
        }
      }
      return item
    })
    setMembers(newState)
  }

  const submitData = (): void => {
    const data = {
      keyName: selectedKey,
      members: members.map((item) => ({
        name: stringToBuffer(item.name),
        score: toNumber(item.score),
      })),
    }
    dispatch(fetchAddZSetMembers(data, closePanel))
  }

  const handleSubmit = () => {
    requestConfirmation({
      title: t('browser.zset.add.confirmTitle'),
      actionDescription: t('browser.zset.add.confirmMessage', {
        count: members.length,
      }),
      confirmButtonText: t('browser.zset.add.confirmButton'),
      commandId: BrowserConfirmationCommandId.AddZsetMembers,
      disableConfirmationInput: true,
      onConfirm: submitData,
    })
  }

  const isClearDisabled = (item: IZsetMemberState): boolean =>
    members.length === 1 && !(item.name.length || item.score.length)

  return (
    <Col gap="m">
      <EntryContent>
        <AddMultipleFields
          items={members}
          isClearDisabled={isClearDisabled}
          onClickRemove={onClickRemove}
          onClickAdd={addMember}
        >
          {(item, index) => (
            <Row align="center" gap="m">
              <FlexItem grow>
                <FormField>
                  <TextInput
                    name={`member-${item.id}`}
                    id={`member-${item.id}`}
                    placeholder={config.member.placeholder}
                    value={item.name}
                    onChange={(value) =>
                      handleMemberChange('name', item.id, value)
                    }
                    ref={
                      index === members.length - 1 ? lastAddedMemberName : null
                    }
                    disabled={loading}
                    data-testid="member-name"
                  />
                </FormField>
              </FlexItem>
              <FlexItem grow>
                <FormField>
                  <TextInput
                    name={`score-${item.id}`}
                    id={`score-${item.id}`}
                    maxLength={200}
                    placeholder={config.score.placeholder}
                    value={item.score}
                    onChange={(value) =>
                      handleMemberChange('score', item.id, value)
                    }
                    onBlur={() => {
                      handleScoreBlur(item)
                    }}
                    disabled={loading}
                    data-testid="member-score"
                  />
                </FormField>
              </FlexItem>
            </Row>
          )}
        </AddMultipleFields>
      </EntryContent>
      <Row justify="end" gap="l">
        <FlexItem>
          <div>
            <SecondaryButton
              onClick={() => closePanel(true)}
              data-testid="cancel-members-btn"
            >
              {t('browser.zset.add.cancel')}
            </SecondaryButton>
          </div>
        </FlexItem>
        <FlexItem>
          <div>
            <PrimaryButton
              disabled={loading || !isFormValid}
              loading={loading}
              onClick={handleSubmit}
              data-testid="save-members-btn"
            >
              {t('browser.zset.add.save')}
            </PrimaryButton>
          </div>
        </FlexItem>
      </Row>
    </Col>
  )
}

export default AddZsetMembers
