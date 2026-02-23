import React from 'react'
import { faker } from '@faker-js/faker'

import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import {
  QueryLibraryItemProps,
  QueryLibraryItemType,
} from './QueryLibraryItem.types'

jest.mock('uiSrc/components/base/code-editor', () => {
  const React = require('react')
  return {
    __esModule: true,
    CodeEditor: (props: any) =>
      React.createElement(
        'div',
        {
          'data-testid': props['data-testid'],
        },
        props.value,
      ),
  }
})

import { QueryLibraryItem } from './QueryLibraryItem'

describe('QueryLibraryItem', () => {
  const defaultProps: QueryLibraryItemProps = {
    id: faker.string.uuid(),
    name: faker.lorem.words(3),
    type: QueryLibraryItemType.Sample,
    query: 'FT.SEARCH idx "@field:{value}" RETURN 3 f1 f2 f3',
    description: faker.lorem.sentence(),
    onRun: jest.fn(),
    onLoad: jest.fn(),
    onDelete: jest.fn(),
    onToggleOpen: jest.fn(),
  }

  const renderComponent = (propsOverride?: Partial<QueryLibraryItemProps>) => {
    const props = { ...defaultProps, ...propsOverride }

    return render(<QueryLibraryItem {...props} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render component', () => {
      renderComponent()

      expect(screen.getByTestId('query-library-item')).toBeInTheDocument()
    })

    it('should render query name and description', () => {
      renderComponent()

      expect(screen.getByTestId('query-library-item-name')).toHaveTextContent(
        defaultProps.name,
      )
      expect(
        screen.getByTestId('query-library-item-description'),
      ).toHaveTextContent(defaultProps.description!)
    })

    it('should not render description when not provided', () => {
      renderComponent({ description: undefined })

      expect(
        screen.queryByTestId('query-library-item-description'),
      ).not.toBeInTheDocument()
    })

    it('should render type badge for sample queries', () => {
      renderComponent({ type: QueryLibraryItemType.Sample })

      expect(
        screen.getByTestId('query-library-item-type-badge'),
      ).toHaveTextContent('Sample')
    })

    it('should render type badge for saved queries', () => {
      renderComponent({ type: QueryLibraryItemType.Saved })

      expect(
        screen.getByTestId('query-library-item-type-badge'),
      ).toHaveTextContent('Saved')
    })

    it('should render action buttons', () => {
      renderComponent()

      expect(
        screen.getByTestId('query-library-item-run-btn'),
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('query-library-item-load-btn'),
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('query-library-item-delete-btn'),
      ).toBeInTheDocument()
    })

    it('should not render action buttons when callbacks are not provided', () => {
      renderComponent({
        onRun: undefined,
        onLoad: undefined,
        onDelete: undefined,
      })

      expect(
        screen.queryByTestId('query-library-item-run-btn'),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('query-library-item-load-btn'),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('query-library-item-delete-btn'),
      ).not.toBeInTheDocument()
    })

    it('should render copy button', () => {
      renderComponent()

      expect(
        screen.getByTestId('query-library-item-copy-btn'),
      ).toBeInTheDocument()
    })
  })

  describe('expand/collapse', () => {
    it('should be collapsed by default', () => {
      renderComponent()

      expect(
        screen.queryByTestId('query-library-item-body'),
      ).not.toBeInTheDocument()
    })

    it('should show body with command view when open', () => {
      renderComponent({ isOpen: true })

      expect(screen.getByTestId('query-library-item-body')).toBeInTheDocument()
      expect(
        screen.getByTestId('query-library-item-command-view'),
      ).toBeInTheDocument()
    })

    it('should display query text in command view when expanded', () => {
      const query = 'FT.SEARCH myIndex "*"'
      renderComponent({ isOpen: true, query })

      expect(
        screen.getByTestId('query-library-item-command-view--editor'),
      ).toHaveTextContent(query)
    })

    it('should toggle open state and update aria-expanded on header click', () => {
      const onToggleOpen = jest.fn()
      const { rerender } = renderComponent({ onToggleOpen, isOpen: false })

      const header = screen.getByTestId('query-library-item-header')
      expect(header).toHaveAttribute('aria-expanded', 'false')

      fireEvent.click(header)
      expect(onToggleOpen).toHaveBeenCalledTimes(1)
      expect(onToggleOpen).toHaveBeenCalledWith(defaultProps.id)

      rerender(
        <QueryLibraryItem
          {...defaultProps}
          onToggleOpen={onToggleOpen}
          isOpen
        />,
      )
      expect(header).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('action callbacks', () => {
    it('should call action callbacks with id when buttons are clicked', () => {
      const onRun = jest.fn()
      const onLoad = jest.fn()
      const onDelete = jest.fn()
      renderComponent({ onRun, onLoad, onDelete })

      fireEvent.click(screen.getByTestId('query-library-item-run-btn'))
      expect(onRun).toHaveBeenCalledTimes(1)
      expect(onRun).toHaveBeenCalledWith(defaultProps.id)

      fireEvent.click(screen.getByTestId('query-library-item-load-btn'))
      expect(onLoad).toHaveBeenCalledTimes(1)
      expect(onLoad).toHaveBeenCalledWith(defaultProps.id)

      fireEvent.click(screen.getByTestId('query-library-item-delete-btn'))
      expect(onDelete).toHaveBeenCalledTimes(1)
      expect(onDelete).toHaveBeenCalledWith(defaultProps.id)
    })

    it('should not trigger onToggleOpen when action buttons are clicked', () => {
      const onToggleOpen = jest.fn()
      renderComponent({ onToggleOpen })

      fireEvent.click(screen.getByTestId('query-library-item-run-btn'))
      fireEvent.click(screen.getByTestId('query-library-item-load-btn'))
      fireEvent.click(screen.getByTestId('query-library-item-delete-btn'))

      expect(onToggleOpen).not.toHaveBeenCalled()
    })
  })
})
