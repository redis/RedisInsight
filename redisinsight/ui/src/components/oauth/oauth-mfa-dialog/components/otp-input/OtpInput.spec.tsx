import React from 'react'
import { cleanup, fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import OtpInput from './OtpInput'
import { OtpInputProps } from './OtpInput.types'

const TESTID = 'otp'

const defaultProps: OtpInputProps = {
  value: '',
  onChange: jest.fn(),
  length: 6,
  'data-testid': TESTID,
}

const renderComponent = (propsOverride?: Partial<OtpInputProps>) =>
  render(<OtpInput {...defaultProps} {...propsOverride} />)

const box = (index: number) =>
  screen.getByTestId(`${TESTID}-${index}`) as HTMLInputElement

beforeEach(() => {
  cleanup()
  jest.clearAllMocks()
})

describe('OtpInput', () => {
  it('should render one box per digit of the configured length', () => {
    renderComponent({ length: 6 })
    expect(screen.getAllByTestId(/^otp-\d$/)).toHaveLength(6)
  })

  it('should emit the digit typed into a box', () => {
    const onChange = jest.fn()
    renderComponent({ value: '', onChange })

    fireEvent.change(box(0), { target: { value: '1' } })

    expect(onChange).toHaveBeenCalledWith('1')
  })

  it('should ignore non-digit input', () => {
    const onChange = jest.fn()
    renderComponent({ value: '', onChange })

    fireEvent.change(box(0), { target: { value: 'a' } })

    expect(onChange).not.toHaveBeenCalled()
  })

  it('should call onComplete when the last digit fills', () => {
    const onChange = jest.fn()
    const onComplete = jest.fn()
    renderComponent({ value: '12345', onChange, onComplete })

    fireEvent.change(box(5), { target: { value: '6' } })

    expect(onChange).toHaveBeenCalledWith('123456')
    expect(onComplete).toHaveBeenCalledWith('123456')
  })

  it('should populate every box and complete when a full code is pasted', () => {
    const onChange = jest.fn()
    const onComplete = jest.fn()
    renderComponent({ value: '', onChange, onComplete })

    fireEvent.paste(box(0), {
      clipboardData: { getData: () => '123456' },
    })

    expect(onChange).toHaveBeenCalledWith('123456')
    expect(onComplete).toHaveBeenCalledWith('123456')
  })

  it('should strip non-digits and cap the pasted value at the length', () => {
    const onChange = jest.fn()
    renderComponent({ value: '', onChange })

    fireEvent.paste(box(0), {
      clipboardData: { getData: () => 'ab12-cd34 56 78' },
    })

    expect(onChange).toHaveBeenCalledWith('123456')
  })

  it('should clear the previous box on backspace when the current is empty', () => {
    const onChange = jest.fn()
    renderComponent({ value: '12', onChange })

    fireEvent.keyDown(box(2), { key: 'Backspace' })

    expect(onChange).toHaveBeenCalledWith('1')
  })

  it('should not shift later digits when a middle box is cleared', () => {
    const onChange = jest.fn()
    renderComponent({ value: '12345', onChange })

    fireEvent.keyDown(box(2), { key: 'Backspace' })

    expect(onChange).toHaveBeenCalledWith('1245')
    // the digit after the cleared box keeps its position, it does not slide left
    expect(box(2).value).toBe('')
    expect(box(3).value).toBe('4')
  })

  it('should mark boxes invalid via aria-invalid', () => {
    renderComponent({ isInvalid: true })

    expect(box(0)).toHaveAttribute('aria-invalid', 'true')
  })
})
