import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EuiFieldText } from '@elastic/eui'
import { Maybe, stringToBuffer } from 'uiSrc/utils'
import { addKeyStateSelector, addSetKey } from 'uiSrc/slices/browser/keys'

import AddMultipleFields from 'uiSrc/pages/browser/components/add-multiple-fields'
import { ActionFooter } from 'uiSrc/pages/browser/components/action-footer'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { CreateSetWithExpireDto } from 'apiSrc/modules/browser/set/dto'

import { INITIAL_SET_MEMBER_STATE, ISetMemberState } from './interfaces'
import { AddSetFormConfig as config } from '../constants/fields-config'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onCancel: (isCancelled?: boolean) => void
}

const AddKeySet = (props: Props) => {
  const { keyName = '', keyTTL, onCancel } = props
  const { loading } = useSelector(addKeyStateSelector)
  const [members, setMembers] = useState<ISetMemberState[]>([
    { ...INITIAL_SET_MEMBER_STATE },
  ])
  const [isFormValid, setIsFormValid] = useState<boolean>(false)
  const lastAddedMemberName = useRef<HTMLInputElement>(null)
  const prevCountMembers = useRef<number>(0)

  const dispatch = useDispatch()

  useEffect(() => {
    setIsFormValid(keyName.length > 0)
  }, [keyName])

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
        ...INITIAL_SET_MEMBER_STATE,
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

  const handleMemberChange = (formField: string, id: number, value: string) => {
    const newState = members.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          [formField]: value,
        }
      }
      return item
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
    const data: CreateSetWithExpireDto = {
      keyName: stringToBuffer(keyName),
      members: members.map((item) => stringToBuffer(item.name)),
    }
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    dispatch(addSetKey(data, onCancel))
  }

  const isClearDisabled = (item: ISetMemberState): boolean =>
    members.length === 1 && !item.name.length

  return (
    <form onSubmit={onFormSubmit}>
      <AddMultipleFields
        items={members}
        isClearDisabled={isClearDisabled}
        onClickRemove={onClickRemove}
        onClickAdd={addMember}
      >
        {(item, index) => (
          <Row align="center">
            <FlexItem grow>
              <FormField>
                <EuiFieldText
                  fullWidth
                  name={`member-${item.id}`}
                  id={`member-${item.id}`}
                  placeholder={config.member.placeholder}
                  value={item.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleMemberChange('name', item.id, e.target.value)
                  }
                  inputRef={
                    index === members.length - 1 ? lastAddedMemberName : null
                  }
                  disabled={loading}
                  data-testid="member-name"
                />
              </FormField>
            </FlexItem>
          </Row>
        )}
      </AddMultipleFields>
      <ActionFooter
        onCancel={() => onCancel(true)}
        onAction={submitData}
        actionText="Add Key"
        loading={loading}
        disabled={!isFormValid}
        actionTestId="add-key-set-btn"
      />
    </form>
  )
}

export default AddKeySet
