import React from 'react'
import { BrowserColumns } from 'uiSrc/constants'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import ColumnsMenu, { ColumnsMenuProps } from './ColumnsMenu'

const COLUMNS_BUTTON_TEST_ID = 'btn-columns-actions'
const KEY_SIZE_TEST_ID = 'show-key-size'
const TTL_TEST_ID = 'show-ttl'

describe('ColumnsMenu', () => {
  const defaultProps: ColumnsMenuProps = {
    shownColumns: [BrowserColumns.Size, BrowserColumns.TTL],
    onToggleColumn: jest.fn(),
  }

  const renderComponent = (propsOverride?: Partial<ColumnsMenuProps>) => {
    const props = { ...defaultProps, ...propsOverride }
    const result = render(<ColumnsMenu {...props} />)
    fireEvent.click(screen.getByTestId(COLUMNS_BUTTON_TEST_ID))
    return result
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should offer the key size and TTL toggles by default', () => {
    renderComponent()

    expect(screen.getByTestId(KEY_SIZE_TEST_ID)).toBeInTheDocument()
    expect(screen.getByTestId(TTL_TEST_ID)).toBeInTheDocument()
  })

  it('should not offer the key size toggle when key size is unavailable', () => {
    renderComponent({
      shownColumns: [BrowserColumns.TTL],
      isKeySizeAvailable: false,
    })

    expect(screen.queryByTestId(KEY_SIZE_TEST_ID)).not.toBeInTheDocument()
    expect(screen.getByTestId(TTL_TEST_ID)).toBeInTheDocument()
  })

  it('should report the toggled column', () => {
    renderComponent()

    fireEvent.click(screen.getByTestId(TTL_TEST_ID))

    expect(defaultProps.onToggleColumn).toHaveBeenCalledWith(
      false,
      BrowserColumns.TTL,
    )
  })
})
