import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import InputFieldSentinel, {
  Props,
  SentinelInputFieldType,
} from './InputFieldSentinel'

const mockedProps = mock<Props>()

const inputTextTestId = 'sentinel-input'
const inputPasswordTestId = 'sentinel-input-password'
const inputNumberTestId = 'sentinel-input-number'

describe('InputFieldSentinel', () => {
  it('should render simple fieldText', () => {
    expect(
      render(<InputFieldSentinel {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it('should change simple fieldText properly', () => {
    render(
      <InputFieldSentinel
        {...instance(mockedProps)}
        inputType={SentinelInputFieldType.Text}
      />,
    )
    fireEvent.change(screen.getByTestId(inputTextTestId), {
      target: { value: 'val' },
    })
    expect(screen.getByTestId(inputTextTestId)).toHaveValue('val')
  })

  it('should render Password field', () => {
    render(
      <InputFieldSentinel
        {...instance(mockedProps)}
        inputType={SentinelInputFieldType.Password}
      />,
    )
    expect(screen.getByTestId(inputPasswordTestId)).toBeInTheDocument()
  })

  it('should change Password field properly', () => {
    render(
      <InputFieldSentinel
        {...instance(mockedProps)}
        inputType={SentinelInputFieldType.Password}
      />,
    )
    fireEvent.change(screen.getByTestId(inputPasswordTestId), {
      target: { value: 'val' },
    })
    expect(screen.getByTestId(inputPasswordTestId)).toHaveValue('val')
  })

  it('should render Number field', () => {
    render(
      <InputFieldSentinel
        {...instance(mockedProps)}
        inputType={SentinelInputFieldType.Number}
      />,
    )
    expect(screen.getByTestId(inputNumberTestId)).toBeInTheDocument()
  })

  it('should default to 0 when Number field properly is set to string with letters and Number field was not previously set', () => {
    render(
      <InputFieldSentinel
        {...instance(mockedProps)}
        inputType={SentinelInputFieldType.Number}
      />,
    )
    fireEvent.change(screen.getByTestId(inputNumberTestId), {
      target: { value: 'val13' },
    })
    expect(screen.getByTestId(inputNumberTestId)).toHaveValue('0')
  })

  it('should default to previous value when Number field properly is set to string with letters', () => {
    render(
      <InputFieldSentinel
        {...instance(mockedProps)}
        inputType={SentinelInputFieldType.Number}
      />,
    )
    fireEvent.change(screen.getByTestId(inputNumberTestId), {
      target: { value: '1' },
    })
    expect(screen.getByTestId(inputNumberTestId)).toHaveValue('1')

    fireEvent.change(screen.getByTestId(inputNumberTestId), {
      target: { value: 'val13' },
    })
    expect(screen.getByTestId(inputNumberTestId)).toHaveValue('1')
  })

  it('should set Number field properly when is set to string with numbers only', () => {
    render(
      <InputFieldSentinel
        {...instance(mockedProps)}
        inputType={SentinelInputFieldType.Number}
      />,
    )
    fireEvent.change(screen.getByTestId(inputNumberTestId), {
      target: { value: '13' },
    })
    expect(screen.getByTestId(inputNumberTestId)).toHaveValue('13')
  })
})
