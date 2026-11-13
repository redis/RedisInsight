import React from 'react'
import { cloneDeep } from 'lodash'

import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { toggleSidePanel } from 'uiSrc/slices/panels/sidePanels'
import { SidePanels } from 'uiSrc/slices/interfaces/insights'

import DevToolsTrigger from './DevToolsTrigger'

let store: typeof mockedStore

describe('DevToolsTrigger', () => {
  const renderComponent = () => render(<DevToolsTrigger />, { store })

  beforeEach(() => {
    cleanup()
    store = cloneDeep(mockedStore)
    store.clearActions()
  })

  it('should render the button with the NEW badge', () => {
    renderComponent()

    expect(screen.getByTestId('dev-tools-trigger')).toHaveTextContent(
      'Dev tools',
    )
    expect(screen.getByTestId('dev-tools-trigger-badge')).toHaveTextContent(
      'NEW',
    )
  })

  it('should toggle the dev tools side panel on click', () => {
    renderComponent()

    fireEvent.click(screen.getByTestId('dev-tools-trigger'))

    expect(store.getActions()).toEqual([toggleSidePanel(SidePanels.DevTools)])
  })
})
