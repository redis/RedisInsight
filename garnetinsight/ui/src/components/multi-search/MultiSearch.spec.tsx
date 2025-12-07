import React from 'react'
import { instance, mock } from 'ts-mockito'
import { map } from 'lodash'
import { fireEvent, render, screen, act } from 'uiSrc/utils/test-utils'

import MultiSearch, { Props } from './MultiSearch'

const mockedProps = mock<Props>()
const searchInputId = 'search-key'

const suggestionOptions = [
  { id: '1', option: 'List', value: 'first' },
  { id: '2', option: 'Hash', value: 'second' },
  { id: '3', option: 'String', value: '*' },
  { id: '4', value: '**]' },
]

describe('MultiSearch', () => {
  it('should render', () => {
    expect(render(<MultiSearch {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should proper change input value', () => {
    const onKeyDown = jest.fn()
    const onChange = jest.fn()
    const inputVal = '*[]zx'

    render(
      <MultiSearch
        {...instance(mockedProps)}
        onChange={onChange}
        onKeyDown={onKeyDown}
        data-testid={searchInputId}
      />,
    )

    const searchInput = screen.getByTestId(searchInputId)
    fireEvent.change(searchInput, { target: { value: inputVal } })
    expect(searchInput).toHaveValue(inputVal)
    expect(onChange).toBeCalledWith(inputVal)

    fireEvent.keyDown(searchInput, { key: 'A', code: 'KeyA' })
    fireEvent.keyDown(searchInput, { key: 'B', code: 'KeyB' })
    expect(onKeyDown).toBeCalledTimes(2)
  })

  it('should show option', () => {
    render(<MultiSearch {...instance(mockedProps)} options={['hash']} />)
    expect(screen.getByTestId('badge-hash_')).toBeInTheDocument()
  })

  it('should delete option', () => {
    const onChangeOptions = jest.fn()
    render(
      <MultiSearch
        {...instance(mockedProps)}
        options={['hash']}
        onChangeOptions={onChangeOptions}
      />,
    )

    const deleteHashBtn = screen.getByTestId('hash-delete-btn')
    fireEvent.click(deleteHashBtn)
    expect(onChangeOptions).toBeCalledWith([])
  })

  it('should delete option with more then 1 option', () => {
    const onChangeOptions = jest.fn()
    render(
      <MultiSearch
        {...instance(mockedProps)}
        options={['hash', 'zset', 'ts']}
        onChangeOptions={onChangeOptions}
      />,
    )

    const deleteHashBtn = screen.getByTestId('hash-delete-btn')
    fireEvent.click(deleteHashBtn)
    expect(onChangeOptions).toBeCalledWith(['zset', 'ts'])
  })

  it('should not show reset filters btn with empty value', () => {
    render(
      <MultiSearch
        {...instance(mockedProps)}
        value=""
        data-testid={searchInputId}
      />,
    )
    expect(screen.queryByTestId('reset-filter-btn')).not.toBeInTheDocument()
  })

  it('should show reset filters btn', () => {
    render(
      <MultiSearch
        {...instance(mockedProps)}
        value="val"
        data-testid={searchInputId}
      />,
    )
    expect(screen.getByTestId('reset-filter-btn')).toBeInTheDocument()
  })

  it('should call onClear', () => {
    const onClear = jest.fn()
    render(
      <MultiSearch
        {...instance(mockedProps)}
        onClear={onClear}
        value="val"
        options={['hash']}
        data-testid={searchInputId}
      />,
    )
    fireEvent.click(screen.getByTestId('reset-filter-btn'))
    expect(onClear).toBeCalled()
  })

  it('should call onSubmit', () => {
    const onSubmit = jest.fn()
    render(
      <MultiSearch
        {...instance(mockedProps)}
        onSubmit={onSubmit}
        data-testid={searchInputId}
      />,
    )
    fireEvent.click(screen.getByTestId('search-btn'))
    expect(onSubmit).toBeCalled()
  })

  it('should not render suggestions by default', () => {
    render(
      <MultiSearch {...instance(mockedProps)} data-testid={searchInputId} />,
    )
    expect(screen.queryByTestId('suggestions')).not.toBeInTheDocument()
  })

  it('should show suggestions after click on button with proper text', () => {
    render(
      <MultiSearch
        {...instance(mockedProps)}
        suggestions={{
          options: suggestionOptions,
          onApply: jest.fn(),
          onDelete: jest.fn(),
          buttonTooltipTitle: 'text',
        }}
        data-testid={searchInputId}
      />,
    )
    fireEvent.click(screen.getByTestId('show-suggestions-btn'))

    expect(screen.getByTestId('suggestions')).toBeInTheDocument()
    suggestionOptions.forEach(({ id, option, value }) => {
      expect(screen.getByTestId(`suggestion-item-${id}`)).toBeInTheDocument()
      expect(screen.getByTestId(`suggestion-item-${id}`)).toHaveTextContent(
        (option ?? '') + value,
      )
    })
  })

  it('should show suggestions after key down arrow down', async () => {
    render(
      <MultiSearch
        {...instance(mockedProps)}
        suggestions={{
          options: suggestionOptions,
          onApply: jest.fn(),
          onDelete: jest.fn(),
          buttonTooltipTitle: 'text',
        }}
        data-testid={searchInputId}
      />,
    )
    await act(() => {
      fireEvent.keyDown(screen.getByTestId(searchInputId), { key: 'ArrowDown' })
    })

    expect(screen.getByTestId('suggestions')).toBeInTheDocument()
  })

  it('should call onApply after press enter on suggestion', async () => {
    const onApply = jest.fn()
    render(
      <MultiSearch
        {...instance(mockedProps)}
        suggestions={{
          options: suggestionOptions,
          onApply,
          onDelete: jest.fn(),
          buttonTooltipTitle: 'text',
        }}
        data-testid={searchInputId}
      />,
    )
    await act(() => {
      fireEvent.keyDown(screen.getByTestId(searchInputId), { key: 'ArrowDown' })
    })
    await act(() => {
      fireEvent.keyDown(screen.getByTestId(searchInputId), { key: 'ArrowDown' })
    })

    await act(() => {
      fireEvent.keyDown(screen.getByTestId(searchInputId), { key: 'Enter' })
    })
    expect(onApply).toBeCalledWith(suggestionOptions[0])
  })

  it('should call onKeyDown if suggestions not opened', async () => {
    const onKeyDown = jest.fn()
    render(
      <MultiSearch
        {...instance(mockedProps)}
        onKeyDown={onKeyDown}
        suggestions={{
          options: suggestionOptions,
          onApply: jest.fn(),
          onDelete: jest.fn(),
          buttonTooltipTitle: 'text',
        }}
        data-testid={searchInputId}
      />,
    )
    await act(() => {
      fireEvent.keyDown(screen.getByTestId(searchInputId), {
        key: 'A',
        code: 'KeyA',
      })
    })
    expect(onKeyDown).toBeCalledTimes(1)
  })

  it('should call onApply after click on suggestion', () => {
    const onApply = jest.fn()
    render(
      <MultiSearch
        {...instance(mockedProps)}
        suggestions={{
          options: suggestionOptions,
          onApply,
          onDelete: jest.fn(),
          buttonTooltipTitle: 'text',
        }}
        data-testid={searchInputId}
      />,
    )
    fireEvent.click(screen.getByTestId('show-suggestions-btn'))
    fireEvent.click(screen.getByTestId('suggestion-item-2'))
    expect(onApply).toBeCalledWith(suggestionOptions[1])
  })

  it('should call onDelete after click on delete suggestion', () => {
    const onDelete = jest.fn()
    render(
      <MultiSearch
        {...instance(mockedProps)}
        suggestions={{
          options: suggestionOptions,
          onApply: jest.fn(),
          onDelete,
          buttonTooltipTitle: 'text',
        }}
        data-testid={searchInputId}
      />,
    )
    fireEvent.click(screen.getByTestId('show-suggestions-btn'))
    fireEvent.click(screen.getByTestId('remove-suggestion-item-2'))
    expect(onDelete).toBeCalledWith(['2'])
  })

  it('should call onDelete after click on delete all suggestion', () => {
    const onDelete = jest.fn()
    render(
      <MultiSearch
        {...instance(mockedProps)}
        suggestions={{
          options: suggestionOptions,
          onApply: jest.fn(),
          onDelete,
          buttonTooltipTitle: 'text',
        }}
        data-testid={searchInputId}
      />,
    )
    fireEvent.click(screen.getByTestId('show-suggestions-btn'))
    fireEvent.click(screen.getByTestId('clear-history-btn'))
    expect(onDelete).toBeCalledWith(map(suggestionOptions, 'id'))
  })

  it('should call onDelete after press delete on suggestion', async () => {
    const onDelete = jest.fn()
    render(
      <MultiSearch
        {...instance(mockedProps)}
        suggestions={{
          options: suggestionOptions,
          onApply: jest.fn(),
          onDelete,
          buttonTooltipTitle: 'text',
        }}
        data-testid={searchInputId}
      />,
    )
    await act(() => {
      fireEvent.keyDown(screen.getByTestId(searchInputId), { key: 'ArrowDown' })
    })
    await act(() => {
      fireEvent.keyDown(screen.getByTestId(searchInputId), { key: 'ArrowDown' })
    })

    await act(() => {
      fireEvent.keyDown(screen.getByTestId(searchInputId), { key: 'Delete' })
    })
    expect(onDelete).toBeCalledWith(['1'])
  })

  it('should close suggestion on Esc', async () => {
    const onDelete = jest.fn()
    render(
      <MultiSearch
        {...instance(mockedProps)}
        suggestions={{
          options: suggestionOptions,
          onApply: jest.fn(),
          onDelete,
          buttonTooltipTitle: 'text',
        }}
        data-testid={searchInputId}
      />,
    )
    await act(() => {
      fireEvent.keyDown(screen.getByTestId(searchInputId), { key: 'ArrowDown' })
    })

    expect(screen.getByTestId('suggestions')).toBeInTheDocument()

    await act(() => {
      fireEvent.keyDown(screen.getByTestId(searchInputId), { key: 'Esc' })
    })

    expect(screen.queryByTestId('suggestions')).not.toBeInTheDocument()
  })

  it('should close suggestion on click search button', async () => {
    const onDelete = jest.fn()
    render(
      <MultiSearch
        {...instance(mockedProps)}
        onSubmit={jest.fn()}
        suggestions={{
          options: suggestionOptions,
          onApply: jest.fn(),
          onDelete,
          buttonTooltipTitle: 'text',
        }}
        data-testid={searchInputId}
      />,
    )

    fireEvent.click(screen.getByTestId('show-suggestions-btn'))
    expect(screen.getByTestId('suggestions')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('search-btn'))
    expect(screen.queryByTestId('suggestions')).not.toBeInTheDocument()
  })

  it('should show loading wth loading suggestions state', () => {
    render(
      <MultiSearch
        {...instance(mockedProps)}
        suggestions={{
          loading: true,
          options: suggestionOptions,
          onApply: jest.fn(),
          onDelete: jest.fn(),
          buttonTooltipTitle: 'text',
        }}
        data-testid={searchInputId}
      />,
    )

    fireEvent.click(screen.getByTestId('show-suggestions-btn'))
    expect(screen.getByTestId('progress-suggestions')).toBeInTheDocument()
  })
})
