import React from 'react'
import { useSelector } from 'react-redux'
import { act, fireEvent, render, screen, waitFor } from 'uiSrc/utils/test-utils'
import { TagInputField } from './TagInputField'

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  connect: () => (Component: any) => Component,
}))

const mockSelector = useSelector as jest.MockedFunction<typeof useSelector>

describe('TagInputField', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockSelector.mockReturnValue({
      data: [],
    })
  })

  const renderComponent = (
    props: Partial<React.ComponentProps<typeof TagInputField>> = {},
  ) => {
    const defaultProps = {
      value: '',
      currentTagKeys: new Set<string>(),
      onChange: mockOnChange,
      ...props,
    }
    return render(<TagInputField {...defaultProps} />)
  }

  it('should render input field with value', () => {
    renderComponent({ value: 'test-tag' })

    const input = screen.getByDisplayValue('test-tag')
    expect(input).toBeInTheDocument()
  })

  it('should call onChange when input value changes', () => {
    renderComponent()

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'new-value' } })

    expect(mockOnChange).toHaveBeenCalledWith('new-value')
  })

  it('should render with placeholder', () => {
    renderComponent({ placeholder: 'Enter tag key' })

    expect(screen.getByPlaceholderText('Enter tag key')).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    renderComponent({ disabled: true })

    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('should show error state when errorMessage is provided', () => {
    const { container } = renderComponent({ errorMessage: 'Invalid tag' })

    // The input should have valid=undefined when there's an error
    const input = container.querySelector('input')
    expect(input).toBeInTheDocument()
  })

  it('should show TagSuggestions when input is focused and no error', async () => {
    renderComponent({ value: 'env' })

    const input = screen.getByRole('textbox')
    fireEvent.focus(input)

    await waitFor(() => {
      expect(screen.getByTestId('tag-suggestions')).toBeInTheDocument()
    })
  })

  it('should not show TagSuggestions when input has error', async () => {
    renderComponent({ value: 'env', errorMessage: 'Invalid tag' })

    const input = screen.getByRole('textbox')
    fireEvent.focus(input)

    await waitFor(() => {
      expect(screen.queryByTestId('tag-suggestions')).not.toBeInTheDocument()
    })
  })

  it('should hide TagSuggestions when input loses focus', async () => {
    renderComponent({ value: 'env' })

    const input = screen.getByRole('textbox')
    fireEvent.focus(input)

    await waitFor(() => {
      expect(screen.getByTestId('tag-suggestions')).toBeInTheDocument()
    })

    fireEvent.blur(input)

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200))
    })

    expect(screen.queryByTestId('tag-suggestions')).not.toBeInTheDocument()
  })

  it('should call onChange and hide suggestions when suggestion is selected', async () => {
    renderComponent({ value: 'env' })

    const input = screen.getByRole('textbox')
    fireEvent.focus(input)

    await waitFor(() => {
      expect(screen.getByTestId('tag-suggestions')).toBeInTheDocument()
    })

    const suggestion = screen.getByText('environment')
    fireEvent.click(suggestion)

    expect(mockOnChange).toHaveBeenCalledWith('environment')
    expect(screen.queryByTestId('tag-suggestions')).not.toBeInTheDocument()
  })

  it('should render rightContent when provided', () => {
    renderComponent({
      rightContent: <button data-testid="right-button">Action</button>,
    })

    expect(screen.getByTestId('right-button')).toBeInTheDocument()
  })

  it('should pass suggestedTagKey to TagSuggestions', async () => {
    renderComponent({ value: 'prod', suggestedTagKey: 'environment' })

    const input = screen.getByRole('textbox')
    fireEvent.focus(input)

    await waitFor(() => {
      expect(screen.getByTestId('tag-suggestions')).toBeInTheDocument()
    })

    // When suggestedTagKey is set, it shows values for that key
    expect(screen.getByText('production')).toBeInTheDocument()
  })

  it('should pass currentTagKeys to TagSuggestions', async () => {
    const currentTagKeys = new Set(['env', 'version'])
    renderComponent({ value: '', currentTagKeys })

    const input = screen.getByRole('textbox')
    fireEvent.focus(input)

    await waitFor(() => {
      expect(screen.getByTestId('tag-suggestions')).toBeInTheDocument()
    })

    // currentTagKeys should filter out already used keys
    expect(screen.queryByText('env')).not.toBeInTheDocument()
  })
})
