import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import AddStreamGroup, { Props } from './AddStreamGroup'

const GROUP_NAME_FIELD = 'group-name-field'
const ID_FIELD = 'id-field'

const mockedProps = mock<Props>()

describe('AddStreamGroup', () => {
  it('should render', () => {
    expect(render(<AddStreamGroup {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should set member value properly', () => {
    render(<AddStreamGroup {...instance(mockedProps)} />)
    const groupNameInput = screen.getByTestId(GROUP_NAME_FIELD)
    fireEvent.change(groupNameInput, { target: { value: 'group name' } })
    expect(groupNameInput).toHaveValue('group name')
  })

  it('should set score value properly if input wrong value', () => {
    render(<AddStreamGroup {...instance(mockedProps)} />)
    const idInput = screen.getByTestId(ID_FIELD)
    fireEvent.change(idInput, { target: { value: 'aa1x-5' } })
    expect(idInput).toHaveValue('1-5')
  })

  it('should able to save with valid data', () => {
    render(<AddStreamGroup {...instance(mockedProps)} />)
    const groupNameInput = screen.getByTestId(GROUP_NAME_FIELD)
    const idInput = screen.getByTestId(ID_FIELD)
    fireEvent.change(groupNameInput, { target: { value: 'name' } })
    fireEvent.change(idInput, { target: { value: '11111-3' } })
    expect(screen.getByTestId('save-groups-btn')).not.toBeDisabled()
  })

  it('should not able to save with valid data', () => {
    render(<AddStreamGroup {...instance(mockedProps)} />)
    const groupNameInput = screen.getByTestId(GROUP_NAME_FIELD)
    const idInput = screen.getByTestId(ID_FIELD)
    fireEvent.change(groupNameInput, { target: { value: 'name' } })
    fireEvent.change(idInput, { target: { value: '11111----' } })
    expect(screen.getByTestId('save-groups-btn')).toBeDisabled()
  })
})
