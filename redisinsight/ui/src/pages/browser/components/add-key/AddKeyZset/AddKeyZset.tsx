import React, { FormEvent, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toNumber } from 'lodash'
import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiFormField } from 'uiBase/forms'
import { RiTextInput } from 'uiBase/inputs'
import { Maybe, stringToBuffer, validateScoreNumber } from 'uiSrc/utils'
import { isNaNConvertedString } from 'uiSrc/utils/numbers'
import { addKeyStateSelector, addZsetKey } from 'uiSrc/slices/browser/keys'

import AddMultipleFields from 'uiSrc/pages/browser/components/add-multiple-fields'
import { ISetMemberState } from 'uiSrc/pages/browser/components/add-key/AddKeySet/interfaces'
import {
  INITIAL_ZSET_MEMBER_STATE,
  IZsetMemberState,
} from 'uiSrc/pages/browser/components/add-key/AddKeyZset/interfaces'
import { ActionFooter } from 'uiSrc/pages/browser/components/action-footer'
import { CreateZSetWithExpireDto } from 'apiSrc/modules/browser/z-set/dto'
import { AddZsetFormConfig as config } from '../constants/fields-config'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onCancel: (isCancelled?: boolean) => void
}

const AddKeyZset = (props: Props) => {
  const { keyName = '', keyTTL, onCancel } = props
  const { loading } = useSelector(addKeyStateSelector)
  const [members, setMembers] = useState<IZsetMemberState[]>([
    { ...INITIAL_ZSET_MEMBER_STATE },
  ])
  const [isFormValid, setIsFormValid] = useState<boolean>(false)
  const lastAddedMemberName = useRef<HTMLInputElement>(null)
  const prevCountMembers = useRef<number>(0)

  const dispatch = useDispatch()

  useEffect(() => {
    members.every((member) => {
      if (!(keyName.length && member.score?.toString().length)) {
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
  }, [keyName, members])

  useEffect(() => {
    if (
      prevCountMembers.current !== 0 &&
      prevCountMembers.current < members.length
    ) {
      lastAddedMemberName.current?.focus()
    }
    prevCountMembers.current = members.length
  }, [members.length])

  const addMember = () => {
    const lastMember = members[members.length - 1]
    const newState = [
      ...members,
      {
        ...INITIAL_ZSET_MEMBER_STATE,
        id: lastMember.id + 1,
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

  const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (isFormValid) {
      submitData()
    }
  }

  const submitData = (): void => {
    const data: CreateZSetWithExpireDto = {
      keyName: stringToBuffer(keyName),
      members: members.map((item) => ({
        name: stringToBuffer(item.name),
        score: toNumber(item.score),
      })),
    }
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    dispatch(addZsetKey(data, onCancel))
  }

  const isClearDisabled = (item: IZsetMemberState): boolean =>
    members.length === 1 && !(item.name.length || item.score.length)

  return (
    <form onSubmit={onFormSubmit}>
      <AddMultipleFields
        items={members}
        isClearDisabled={isClearDisabled}
        onClickRemove={onClickRemove}
        onClickAdd={addMember}
      >
        {(item, index) => (
          <RiRow align="center" gap="m">
            <RiFlexItem grow>
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
            </RiFlexItem>
            <RiFlexItem grow>
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
            </RiFlexItem>
          </RiRow>
        )}
      </AddMultipleFields>

      <ActionFooter
        onCancel={() => onCancel(true)}
        onAction={submitData}
        actionText="Add Key"
        loading={loading}
        disabled={!isFormValid}
        actionTestId="add-key-zset-btn"
      />
    </form>
  )
}

export default AddKeyZset
