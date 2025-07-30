import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import QueryLiteActions from './QueryLiteActions'

describe('QueryLiteActions', () => {
  const onSubmit = jest.fn()
  const onClear = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render both buttons', () => {
    render(<QueryLiteActions onSubmit={onSubmit} onClear={onClear} />)

    expect(screen.getByTestId('btn-submit')).toBeInTheDocument()
    expect(screen.getByTestId('btn-clear')).toBeInTheDocument()
  })

  it('should call onSubmit when Run button is clicked', () => {
    render(<QueryLiteActions onSubmit={onSubmit} onClear={onClear} />)

    fireEvent.click(screen.getByTestId('btn-submit'))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('should call onClear when Clear button is clicked', () => {
    render(<QueryLiteActions onSubmit={onSubmit} onClear={onClear} />)

    fireEvent.click(screen.getByTestId('btn-clear'))
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('should disable buttons and show loading tooltip when isLoading is true', () => {
    render(<QueryLiteActions onSubmit={onSubmit} onClear={onClear} isLoading />)

    const submitBtn = screen.getByTestId('btn-submit') as HTMLButtonElement
    const clearBtn = screen.getByTestId('btn-clear') as HTMLButtonElement

    expect(submitBtn).toBeDisabled()
    expect(clearBtn).toBeDisabled()
  })
})
