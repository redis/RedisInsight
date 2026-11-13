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

import RedisToolsTrigger from './RedisToolsTrigger'

let store: typeof mockedStore

describe('RedisToolsTrigger', () => {
  const renderComponent = () => render(<RedisToolsTrigger />, { store })

  beforeEach(() => {
    cleanup()
    store = cloneDeep(mockedStore)
    store.clearActions()
  })

  it('should render the button with the NEW badge', () => {
    renderComponent()

    expect(screen.getByTestId('redis-tools-trigger')).toHaveTextContent(
      'Redis tools',
    )
    expect(screen.getByTestId('redis-tools-trigger-badge')).toHaveTextContent(
      'NEW',
    )
  })

  it('should toggle the Redis tools side panel on click', () => {
    renderComponent()

    fireEvent.click(screen.getByTestId('redis-tools-trigger'))

    expect(store.getActions()).toEqual([toggleSidePanel(SidePanels.RedisTools)])
  })
})
