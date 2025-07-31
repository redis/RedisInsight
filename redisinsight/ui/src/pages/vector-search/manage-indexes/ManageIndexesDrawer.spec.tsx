import React from 'react'
import { cleanup, render, screen } from 'uiSrc/utils/test-utils'
import {
  ManageIndexesDrawer,
  ManageIndexesDrawerProps,
} from './ManageIndexesDrawer'

// Workaround for @redis-ui/components Title component issue with react-children-utilities
// TypeError: react_utils.childrenToString is not a function
jest.mock('uiSrc/components/base/layout/drawer', () => ({
  ...jest.requireActual('uiSrc/components/base/layout/drawer'),
  DrawerHeader: jest.fn().mockReturnValue(null),
}))

const renderComponent = (props?: Partial<ManageIndexesDrawerProps>) => {
  const defaultProps: ManageIndexesDrawerProps = {
    open: true,
    onOpenChange: jest.fn(),
  }

  return render(<ManageIndexesDrawer {...defaultProps} {...props} />)
}

describe('ManageIndexesDrawer', () => {
  beforeEach(() => {
    cleanup()
  })

  it('should render', () => {
    const { container } = renderComponent()

    expect(container).toBeTruthy()

    const drawer = screen.getByTestId('manage-indexes-drawer')
    expect(drawer).toBeInTheDocument()

    // Note: Since we mocked DrawerHeader, we can't check its presence
    // const header = screen.getByText('Manage indexes')
    // expect(header).toBeInTheDocument()

    const body = screen.getByTestId('manage-indexes-drawer-body')
    expect(body).toBeInTheDocument()

    const list = screen.getByTestId('manage-indexes-list')
    expect(list).toBeInTheDocument()
  })
})
