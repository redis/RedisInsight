import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import { render } from 'uiSrc/utils/test-utils'

import {
  FilterInputWithSuggestions,
  findActiveDotToken,
  findUsedAttributeKeys,
} from './FilterInputWithSuggestions'

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
      data-testid={TEST_ID}
    />,
  )
  return { ...utils, onChange }
}

describe('findActiveDotToken', () => {
  it('returns null when caret is at 0', () => {
    expect(findActiveDotToken('.price', 0)).toBeNull()
  })

  it('detects a token right after a leading dot', () => {
    expect(findActiveDotToken('.pri', 4)).toEqual({
      dotIndex: 0,
      prefix: 'pri',
    })
  })

  it('detects an empty prefix when caret is right after the dot', () => {
    expect(findActiveDotToken('.', 1)).toEqual({ dotIndex: 0, prefix: '' })
  })

  it('detects a token after whitespace', () => {
    expect(findActiveDotToken('a == 1 and .pr', 14)).toEqual({
      dotIndex: 11,
      prefix: 'pr',
    })
  })

  it('returns null when the dot is preceded by a word char (decimal numbers)', () => {
    expect(findActiveDotToken('3.14', 4)).toBeNull()
  })

  it('returns null when there is no dot before caret', () => {
    expect(findActiveDotToken('price > 5', 9)).toBeNull()
  })

  it('returns null when a non-word char sits between the dot and caret', () => {
    expect(findActiveDotToken('.price > 5', 10)).toBeNull()
  })
})

describe('findUsedAttributeKeys', () => {
  it('returns an empty set when there are no dot tokens', () => {
    expect(findUsedAttributeKeys('price > 5')).toEqual(new Set())
  })

  it('collects every fully-typed .attribute token', () => {
    expect(
      findUsedAttributeKeys('.price > 5 and .category == "books"'),
    ).toEqual(new Set(['price', 'category']))
  })

  it('skips decimal numbers (.dot preceded by a word char)', () => {
    expect(findUsedAttributeKeys('rating > 3.14')).toEqual(new Set())
  })

  it('excludes the token at excludeDotIndex (the one being typed)', () => {
    // ".price > 5 and .pr" — active token starts at the second dot (index 15)
    expect(findUsedAttributeKeys('.price > 5 and .pr', 15)).toEqual(
      new Set(['price']),
    )
  })
})

describe('FilterInputWithSuggestions', () => {
  it('does not render the dropdown until the user focuses and types a dot', () => {
    renderForm()
    expect(
      screen.queryByTestId(`${TEST_ID}-suggestions`),
    ).not.toBeInTheDocument()
  })

  it('renders the dropdown filtered by prefix when the user types a dot', () => {
    renderForm({ value: '.c' })
    const input = screen.getByTestId(TEST_ID) as HTMLInputElement
    fireEvent.focus(input)
    input.setSelectionRange(2, 2)
    fireEvent.keyUp(input, { key: 'c' })

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

  it('inserts a suggestion on click and emits onChange', () => {
    const { onChange } = renderForm({ value: '.c' })
    const input = screen.getByTestId(TEST_ID) as HTMLInputElement
    fireEvent.focus(input)
    input.setSelectionRange(2, 2)
    fireEvent.keyUp(input, { key: 'c' })

    fireEvent.mouseDown(screen.getByTestId(`${TEST_ID}-suggestion-category`))
    expect(onChange).toHaveBeenCalledWith('.category')
  })

  it('omits attributes already used elsewhere in the expression', () => {
    // `.price > 5 and .` — caret at the trailing dot, `price` already used
    const value = '.price > 5 and .'
    renderForm({ value })
    const input = screen.getByTestId(TEST_ID) as HTMLInputElement
    fireEvent.focus(input)
    input.setSelectionRange(value.length, value.length)
    fireEvent.keyUp(input, { key: '.' })

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

  it('does not hide an attribute while the user is editing it in place', () => {
    // `.pri` — caret inside the only token. The token at dotIndex 0 is the
    // active one, so it should not be counted as "used" and `price` must
    // remain visible while the user finishes typing.
    const value = '.pri'
    renderForm({ value })
    const input = screen.getByTestId(TEST_ID) as HTMLInputElement
    fireEvent.focus(input)
    input.setSelectionRange(value.length, value.length)
    fireEvent.keyUp(input, { key: 'i' })

    expect(
      screen.getByTestId(`${TEST_ID}-suggestion-price`),
    ).toBeInTheDocument()
  })

  it('replaces the whole word-token when the caret is mid-token', () => {
    // `.ca|t` — caret at index 2, the `t` after the caret is still part of
    // the token. Picking `category` must produce `.category`, not
    // `.categoryt` (regression test for the half-token replacement bug).
    const value = '.cat'
    const { onChange } = renderForm({ value })
    const input = screen.getByTestId(TEST_ID) as HTMLInputElement
    fireEvent.focus(input)
    input.setSelectionRange(2, 2)
    fireEvent.keyUp(input, { key: 'ArrowLeft' })

    fireEvent.mouseDown(screen.getByTestId(`${TEST_ID}-suggestion-category`))
    expect(onChange).toHaveBeenCalledWith('.category')
  })

  describe('keyboard navigation', () => {
    const openDropdown = () => {
      const utils = renderForm({ value: '.' })
      const input = screen.getByTestId(TEST_ID) as HTMLInputElement
      fireEvent.focus(input)
      input.setSelectionRange(1, 1)
      fireEvent.keyUp(input, { key: '.' })
      return { ...utils, input }
    }

    it('ArrowDown wraps through the suggestion list', () => {
      const { input } = openDropdown()
      // 3 suggestions: price, category, color (order = order of `suggestions`
      // prop). activeIndex starts at 0.
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      expect(
        screen.getByTestId(`${TEST_ID}-suggestion-category`),
      ).toHaveAttribute('aria-selected', 'true')
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      // wrapped back to index 0
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
      fireEvent.keyDown(input, { key: 'ArrowDown' }) // category
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(onChange).toHaveBeenCalledWith('.category')
    })

    it('Tab picks the highlighted suggestion (and preventDefault keeps focus)', () => {
      const { input, onChange } = openDropdown()
      fireEvent.keyDown(input, { key: 'Tab' })
      expect(onChange).toHaveBeenCalledWith('.price')
    })

    it('Escape closes the dropdown', () => {
      const { input } = openDropdown()
      expect(screen.getByTestId(`${TEST_ID}-suggestions`)).toBeInTheDocument()
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
    fireEvent.focus(input)
    input.setSelectionRange(1, 1)
    fireEvent.keyUp(input, { key: '.' })

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
