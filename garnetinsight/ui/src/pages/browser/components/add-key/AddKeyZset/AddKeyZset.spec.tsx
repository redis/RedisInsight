import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import AddKeyZset, { Props } from './AddKeyZset'

const MEMBER_SCORE = 'member-score'
const MEMBER_NAME = 'member-name'

const mockedProps = mock<Props>()

describe('AddKeyZset', () => {
  it('should render', () => {
    expect(render(<AddKeyZset {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should set member value properly', () => {
    render(<AddKeyZset {...instance(mockedProps)} />)
    const memberInput = screen.getByTestId(MEMBER_NAME)
    fireEvent.change(memberInput, { target: { value: 'member name' } })
    expect(memberInput).toHaveValue('member name')
  })

  it('should set score value properly if input wrong value', () => {
    render(<AddKeyZset {...instance(mockedProps)} />)
    const scoreInput = screen.getByTestId(MEMBER_SCORE)
    fireEvent.change(scoreInput, { target: { value: '100q' } })
    expect(scoreInput).toHaveValue('100')
  })

  it('should set by blur score value properly if input wrong value', () => {
    render(<AddKeyZset {...instance(mockedProps)} />)
    const scoreInput = screen.getByTestId(MEMBER_SCORE)
    fireEvent.change(scoreInput, { target: { value: '.1' } })
    fireEvent.focusOut(scoreInput)
    expect(scoreInput).toHaveValue('0.1')
  })

  it('should render add button after input score', () => {
    render(<AddKeyZset {...instance(mockedProps)} />)
    const scoreInput = screen.getByTestId(MEMBER_SCORE)
    fireEvent.change(scoreInput, { target: { value: '100q' } })
    expect(screen.getByTestId('add-item')).toBeTruthy()
  })

  it('should render one more member & score inputs after click add item', () => {
    render(<AddKeyZset {...instance(mockedProps)} />)
    const scoreInput = screen.getByTestId(MEMBER_SCORE)
    fireEvent.change(scoreInput, { target: { value: '100q' } })
    fireEvent.click(screen.getByTestId('add-item'))

    expect(screen.getAllByTestId(MEMBER_NAME)).toHaveLength(2)
    expect(screen.getAllByTestId(MEMBER_SCORE)).toHaveLength(2)
  })

  it('should clear member & score after click clear button', () => {
    render(<AddKeyZset {...instance(mockedProps)} />)
    const memberInput = screen.getByTestId(MEMBER_NAME)
    const scoreInput = screen.getByTestId(MEMBER_SCORE)
    fireEvent.change(memberInput, { target: { value: 'member' } })
    fireEvent.change(scoreInput, { target: { value: '100q' } })
    fireEvent.click(screen.getByTestId('remove-item'))

    expect(memberInput).toHaveValue('')
    expect(scoreInput).toHaveValue('')
  })
})
