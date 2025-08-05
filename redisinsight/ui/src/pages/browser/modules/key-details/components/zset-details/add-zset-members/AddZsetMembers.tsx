import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  RiPrimaryButton,
  RiSecondaryButton,
  RiFormField,
} from 'uiSrc/components/base/forms'
import { RiTextInput } from 'uiSrc/components/base/inputs'
import styles from './styles.module.scss'

export interface Props {
  closePanel: (isCancelled?: boolean) => void
}

const AddZsetMembers = (props: Props) => {
  const { closePanel } = props
  const dispatch = useDispatch()
  const [isFormValid, setIsFormValid] = useState<boolean>(false)
  const [members, setMembers] = useState<IZsetMemberState[]>([
    { ...INITIAL_ZSET_MEMBER_STATE },
  ])
  const { loading } = useSelector(updateZsetScoreStateSelector)
  const { name: selectedKey = '' } = useSelector(selectedKeyDataSelector) ?? {
    name: undefined,
  }
  const lastAddedMemberName = useRef<HTMLInputElement>(null)

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

  const isClearDisabled = (item: IZsetMemberState): boolean =>
    members.length === 1 && !(item.name.length || item.score.length)

  return (
    <>
      <div className={styles.container}>
        <AddMultipleFields
          items={members}
          isClearDisabled={isClearDisabled}
          onClickRemove={onClickRemove}
          onClickAdd={addMember}
        >
          {(item, index) => (
            <Row align="center">
              <FlexItem grow>
                <RiFormField>
                  <RiTextInput
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
                </RiFormField>
              </FlexItem>
              <FlexItem grow>
                <RiFormField>
                  <RiTextInput
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
                </RiFormField>
              </FlexItem>
            </Row>
          )}
        </AddMultipleFields>
      </div>
      <>
        <Row justify="end" gap="l" style={{ padding: 18 }}>
          <FlexItem>
            <div>
              <RiSecondaryButton
                onClick={() => closePanel(true)}
                data-testid="cancel-members-btn"
              >
                Cancel
              </RiSecondaryButton>
            </div>
          </FlexItem>
          <FlexItem>
            <div>
              <RiPrimaryButton
                disabled={loading || !isFormValid}
                loading={loading}
                onClick={submitData}
                data-testid="save-members-btn"
              >
                Save
              </RiPrimaryButton>
            </div>
          </FlexItem>
        </Row>
      </>
    </>
  )
}

export default AddZsetMembers
