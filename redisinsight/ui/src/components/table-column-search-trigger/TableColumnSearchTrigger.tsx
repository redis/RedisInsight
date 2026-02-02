import React, { useState, useEffect } from 'react'

import * as keys from 'uiSrc/constants/keys'
import { SearchInput } from 'uiSrc/components/base/inputs'
import { Maybe, Nullable } from 'uiSrc/utils'
import { SearchIcon } from 'uiSrc/components/base/icons'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import * as S from './TableColumnSearchTrigger.styles'

export interface Props {
  isOpen: boolean
  appliedValue: string
  initialValue?: string
  handleOpenState: (isOpen: boolean) => void
  fieldName: string
  onApply?: (value: string) => void
  searchValidation?: Maybe<(value: string) => string>
}

const TableColumnSearchTrigger = (props: Props) => {
  const {
    isOpen,
    handleOpenState,
    fieldName,
    appliedValue,
    initialValue = '',
    onApply = () => {},
    searchValidation,
  } = props
  const [inputEl, setInputEl] = useState<Nullable<HTMLInputElement>>(null)
  const [value, setValue] = useState<string>(initialValue)

  useEffect(() => {
    if (isOpen && !!inputEl) {
      inputEl.focus()
    }
  }, [isOpen])

  const handleChangeValue = (initValue: string) => {
    const value = searchValidation ? searchValidation(initValue) : initValue
    setValue(value)
  }

  const handleOpen = () => {
    handleOpenState(true)
  }

  const handleApply = (_value: string): void => {
    if (appliedValue !== _value) {
      onApply(_value)
    }
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === keys.ENTER) {
      handleApply(value)
    } else if (event.key === keys.ESCAPE) {
      handleOpenState(false)
    }
  }

  const handleOnBlur = (event?: React.FocusEvent<HTMLInputElement>) => {
    const target = event?.target as HTMLInputElement

    if (!target.value) {
      handleOpenState(false)
    }
  }

  return (
    <div style={{ paddingRight: 10 }}>
      <IconButton
        icon={SearchIcon}
        aria-label={`Search ${fieldName}`}
        onClick={handleOpen}
        data-testid="search-button"
      />
      <S.Search style={{ display: isOpen ? 'flex' : 'none' }}>
        <SearchInput
          onKeyDown={onKeyDown}
          onBlur={handleOnBlur}
          ref={setInputEl}
          name={fieldName}
          placeholder="Search"
          value={value || ''}
          onChange={handleChangeValue}
          data-testid="search"
          style={{ width: '100%' }}
        />
      </S.Search>
    </div>
  )
}

export default TableColumnSearchTrigger
