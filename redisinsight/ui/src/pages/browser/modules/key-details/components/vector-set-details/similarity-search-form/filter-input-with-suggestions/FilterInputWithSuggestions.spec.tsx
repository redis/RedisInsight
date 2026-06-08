import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import { render } from 'uiSrc/utils/test-utils'

import { FilterInputWithSuggestions } from './FilterInputWithSuggestions'
import { SUGGESTIONS_HINT } from './constants'

const TEST_ID = 'filter'

const renderForm = (
  props: Partial<{
    value: string
    suggestions: string[]
  }> = {},
) => {
  const onChange = jest.fn()
  const utils = render(
    <FilterInputWithSuggestions
      value={props.value ?? ''}
      onChange={onChange}
      suggestions={props.suggestions ?? ['price', 'category', 'color']}
      testId={TEST_ID}
    />,
  )
  return { ...utils, onChange }
}

const focusAt = (input: HTMLInputElement, caret: number, lastKey: string) => {
  fireEvent.focus(input)
  input.setSelectionRange(caret, caret)
  fireEvent.keyUp(input, { key: lastKey })
}

describe('FilterInputWithSuggestions', () => {
  it('does not render the dropdown until the user focuses and types a dot', () => {
    renderForm()
    expect(
      screen.queryByTestId(`${TEST_ID}-suggestions`),
    ).not.toBeInTheDocument()
  })

  it('renders the dropdown filtered by prefix when the user types a dot', () => {
    renderForm({ value: '.c' })
    focusAt(screen.getByTestId(TEST_ID) as HTMLInputElement, 2, 'c')

    expect(screen.getByTestId(`${TEST_ID}-suggestions`)).toBeInTheDocument()
    expect(
      screen.getByTestId(`${TEST_ID}-suggestion-category`),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId(`${TEST_ID}-suggestion-color`),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId(`${TEST_ID}-suggestion-price`),
    ).not.toBeInTheDocument()
  })

  it('renders the muted hint above the suggestion list', () => {
    renderForm({ value: '.' })
    focusAt(screen.getByTestId(TEST_ID) as HTMLInputElement, 1, '.')

    expect(screen.getByTestId(`${TEST_ID}-suggestions-hint`)).toHaveTextContent(
      SUGGESTIONS_HINT,
    )
  })

  it('inserts a suggestion on click and emits onChange', () => {
    const { onChange } = renderForm({ value: '.c' })
    focusAt(screen.getByTestId(TEST_ID) as HTMLInputElement, 2, 'c')

    fireEvent.mouseDown(screen.getByTestId(`${TEST_ID}-suggestion-category`))
    expect(onChange).toHaveBeenCalledWith('.category')
  })

  it('omits attributes already used elsewhere in the expression', () => {
    const value = '.price > 5 and .'
    renderForm({ value })
    focusAt(screen.getByTestId(TEST_ID) as HTMLInputElement, value.length, '.')

    expect(
      screen.queryByTestId(`${TEST_ID}-suggestion-price`),
    ).not.toBeInTheDocument()
    expect(
      screen.getByTestId(`${TEST_ID}-suggestion-category`),
    ).toBeInTheDocument()
  })

  it('does not hide an attribute while the user is editing it in place', () => {
    const value = '.pri'
    renderForm({ value })
    focusAt(screen.getByTestId(TEST_ID) as HTMLInputElement, value.length, 'i')

    expect(
      screen.getByTestId(`${TEST_ID}-suggestion-price`),
    ).toBeInTheDocument()
  })

  it('replaces the whole word-token when the caret is mid-token', () => {
    const { onChange } = renderForm({ value: '.cat' })
    focusAt(screen.getByTestId(TEST_ID) as HTMLInputElement, 2, 'ArrowLeft')

    fireEvent.mouseDown(screen.getByTestId(`${TEST_ID}-suggestion-category`))
    expect(onChange).toHaveBeenCalledWith('.category')
  })

  describe('keyboard navigation', () => {
    const openDropdown = () => {
      const utils = renderForm({ value: '.' })
      const input = screen.getByTestId(TEST_ID) as HTMLInputElement
      focusAt(input, 1, '.')
      return { ...utils, input }
    }

    it('ArrowDown wraps through the suggestion list', () => {
      const { input } = openDropdown()
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      expect(
        screen.getByTestId(`${TEST_ID}-suggestion-category`),
      ).toHaveAttribute('aria-selected', 'true')
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      expect(screen.getByTestId(`${TEST_ID}-suggestion-price`)).toHaveAttribute(
        'aria-selected',
        'true',
      )
    })

    it('ArrowUp wraps to the last item from index 0', () => {
      const { input } = openDropdown()
      fireEvent.keyDown(input, { key: 'ArrowUp' })
      expect(screen.getByTestId(`${TEST_ID}-suggestion-color`)).toHaveAttribute(
        'aria-selected',
        'true',
      )
    })

    it('Enter picks the highlighted suggestion', () => {
      const { input, onChange } = openDropdown()
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(onChange).toHaveBeenCalledWith('.category')
    })

    it('Tab picks the highlighted suggestion', () => {
      const { input, onChange } = openDropdown()
      fireEvent.keyDown(input, { key: 'Tab' })
      expect(onChange).toHaveBeenCalledWith('.price')
    })

    it('Escape closes the dropdown', () => {
      const { input } = openDropdown()
      fireEvent.keyDown(input, { key: 'Escape' })
      expect(
        screen.queryByTestId(`${TEST_ID}-suggestions`),
      ).not.toBeInTheDocument()
    })
  })

  it('exposes ARIA combobox wiring on the wrapper and aria-activedescendant on the input', () => {
    renderForm({ value: '.' })
    const input = screen.getByTestId(TEST_ID) as HTMLInputElement
    const wrapper = screen.getByTestId(`${TEST_ID}-wrapper`)
    focusAt(input, 1, '.')

    expect(wrapper).toHaveAttribute('role', 'combobox')
    expect(wrapper).toHaveAttribute('aria-expanded', 'true')
    expect(wrapper).toHaveAttribute('aria-haspopup', 'listbox')
    expect(wrapper).toHaveAttribute('aria-controls', `${TEST_ID}-suggestions`)
    expect(input).toHaveAttribute('aria-autocomplete', 'list')
    expect(input).toHaveAttribute(
      'aria-activedescendant',
      `${TEST_ID}-suggestions-option-0`,
    )
  })
})
