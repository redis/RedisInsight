import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { MIDDLE_SCREEN_RESOLUTION } from 'uiSrc/constants'

import { SimilarityColumnsPopover } from './SimilarityColumnsPopover'
import {
  COLUMNS_BUTTON_TEST_ID,
  COLUMNS_POPOVER_TEST_ID,
  DEFAULT_TITLE,
} from './constants'

/** Width above the small-screen breakpoint. */
const WIDE = MIDDLE_SCREEN_RESOLUTION + 100
/** Width at/below the small-screen breakpoint. */
const NARROW = MIDDLE_SCREEN_RESOLUTION

const attrColumnsMap = new Map<string, string>([
  ['attr_city', 'city'],
  ['attr_count', 'count'],
])

const anchoredShownColumns = ['name', 'similarity', 'attr_city', 'attr_count']

describe('SimilarityColumnsPopover', () => {
  describe('responsive trigger', () => {
    it('renders the trigger with label on wide screens', () => {
      render(
        <SimilarityColumnsPopover
          width={WIDE}
          columnsMap={attrColumnsMap}
          shownColumns={anchoredShownColumns}
          onShownColumnsChange={jest.fn()}
        />,
      )

      const btn = screen.getByTestId(COLUMNS_BUTTON_TEST_ID)
      expect(btn).toBeInTheDocument()
      expect(btn).toHaveTextContent(DEFAULT_TITLE)
    })

    it('renders icon-only trigger on narrow screens', () => {
      render(
        <SimilarityColumnsPopover
          width={NARROW}
          columnsMap={attrColumnsMap}
          shownColumns={anchoredShownColumns}
          onShownColumnsChange={jest.fn()}
        />,
      )

      const btn = screen.getByTestId(COLUMNS_BUTTON_TEST_ID)
      expect(btn).toBeInTheDocument()
      expect(btn).not.toHaveTextContent(DEFAULT_TITLE)
      expect(btn).toHaveAttribute('aria-label', DEFAULT_TITLE)
    })
  })

  describe('popover content', () => {
    it('opens the popover and lists only the columnsMap entries (no Element/Similarity)', () => {
      render(
        <SimilarityColumnsPopover
          width={WIDE}
          columnsMap={attrColumnsMap}
          shownColumns={anchoredShownColumns}
          onShownColumnsChange={jest.fn()}
        />,
      )

      fireEvent.click(screen.getByTestId(COLUMNS_BUTTON_TEST_ID))

      expect(screen.getByTestId(COLUMNS_POPOVER_TEST_ID)).toBeInTheDocument()
      expect(screen.getByTestId('show-attr_city')).toBeChecked()
      expect(screen.getByTestId('show-attr_count')).toBeChecked()
      // Element + Similarity are anchored and never offered as a toggle.
      expect(screen.queryByTestId('show-name')).not.toBeInTheDocument()
      expect(screen.queryByTestId('show-similarity')).not.toBeInTheDocument()
    })

    it('invokes onShownColumnsChange with the next shown ids when a checkbox toggles', () => {
      const onChange = jest.fn()
      render(
        <SimilarityColumnsPopover
          width={WIDE}
          columnsMap={attrColumnsMap}
          shownColumns={anchoredShownColumns}
          onShownColumnsChange={onChange}
        />,
      )

      fireEvent.click(screen.getByTestId(COLUMNS_BUTTON_TEST_ID))
      fireEvent.click(screen.getByTestId('show-attr_city'))

      expect(onChange).toHaveBeenCalledTimes(1)
      // `attr_city` is removed; anchors and the other attribute key stay.
      expect(onChange.mock.calls[0][0]).toEqual([
        'name',
        'similarity',
        'attr_count',
      ])
    })
  })
})
