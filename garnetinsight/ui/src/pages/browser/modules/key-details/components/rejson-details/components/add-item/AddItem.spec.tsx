import React from 'react'
import { mock } from 'ts-mockito'
import { fireEvent, waitFor } from '@testing-library/react'
import { useSelector } from 'react-redux'
import { render, screen } from 'uiSrc/utils/test-utils'

import AddItem, { Props } from './AddItem'
import { JSONErrors } from '../../constants'

const mockedProps = mock<Props>()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}))

const mockUseSelector = useSelector as jest.Mock

describe('AddItem', () => {
  beforeEach(() => {
    mockUseSelector.mockImplementation((selectorFn: any) =>
      selectorFn({
        browser: { rejson: { data: { data: JSON.stringify({ test: true }) } } },
      }),
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(render(<AddItem {...mockedProps} />)).toBeTruthy()
  })

  it('should show error with invalid key', () => {
    render(<AddItem {...mockedProps} isPair onCancel={jest.fn} />)

    fireEvent.change(screen.getByTestId('json-key'), { target: { value: '"' } })
    fireEvent.click(screen.getByTestId('apply-btn'))

    expect(screen.getByTestId('edit-json-error')).toHaveTextContent(
      JSONErrors.keyCorrectSyntax,
    )
  })

  it('should show error with invalid value', () => {
    render(<AddItem {...mockedProps} onCancel={jest.fn} />)

    expect(screen.queryByTestId('json-key')).not.toBeInTheDocument()

    fireEvent.change(screen.getByTestId('json-value'), {
      target: { value: '"' },
    })
    fireEvent.click(screen.getByTestId('apply-btn'))

    expect(screen.getByTestId('edit-json-error')).toHaveTextContent(
      JSONErrors.valueJSONFormat,
    )
  })

  it('should submit with proper key and value', () => {
    const onSubmit = jest.fn()
    render(
      <AddItem
        {...mockedProps}
        isPair
        onCancel={jest.fn}
        onSubmit={onSubmit}
      />,
    )

    fireEvent.change(screen.getByTestId('json-key'), {
      target: { value: '"key"' },
    })
    fireEvent.change(screen.getByTestId('json-value'), {
      target: { value: '1' },
    })
    fireEvent.click(screen.getByTestId('apply-btn'))

    expect(onSubmit).toBeCalledWith({ key: '"key"', value: '1' })
  })

  it('should show confirmation and submit on Overwrite', async () => {
    const onSubmit = jest.fn()
    const onCancel = jest.fn()

    mockUseSelector.mockImplementation((selectorFn: any) =>
      selectorFn({
        browser: {
          rejson: { data: { data: JSON.stringify({ existingKey: true }) } },
        },
      }),
    )

    render(
      <AddItem isPair onSubmit={onSubmit} onCancel={onCancel} parentPath="$" />,
    )

    fireEvent.change(screen.getByTestId('json-key'), {
      target: { value: '"existingKey"' },
    })
    fireEvent.change(screen.getByTestId('json-value'), {
      target: { value: '"newValue"' },
    })
    fireEvent.click(screen.getByTestId('apply-btn'))

    await waitFor(() => {
      expect(
        screen.getByText(/Duplicate JSON key detected/i),
      ).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('overwrite-btn'))

    expect(onSubmit).toHaveBeenCalledWith({
      key: '"existingKey"',
      value: '"newValue"',
    })
  })

  it('should show confirmation and hide confirmation dialog on cancel click, but not cancel the add item form', async () => {
    const onSubmit = jest.fn()
    const onCancel = jest.fn()

    mockUseSelector.mockImplementation((selectorFn: any) =>
      selectorFn({
        browser: {
          rejson: { data: { data: JSON.stringify({ existingKey: true }) } },
        },
      }),
    )

    render(
      <AddItem isPair onSubmit={onSubmit} onCancel={onCancel} parentPath="$" />,
    )

    fireEvent.change(screen.getByTestId('json-key'), {
      target: { value: '"existingKey"' },
    })
    fireEvent.change(screen.getByTestId('json-value'), {
      target: { value: '"newValue"' },
    })
    fireEvent.click(screen.getByTestId('apply-btn'))

    await waitFor(() => {
      expect(
        screen.getByText(/Duplicate JSON key detected/i),
      ).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('cancel-confirmation-btn'))

    await waitFor(() => {
      expect(
        screen.queryByText(/Duplicate JSON key detected/i),
      ).not.toBeInTheDocument()
    })

    expect(onSubmit).not.toHaveBeenCalled()
    expect(onCancel).not.toHaveBeenCalled()
  })
})
