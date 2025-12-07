import { cloneDeep } from 'lodash'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { instance, mock } from 'ts-mockito'

import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import AnalyticsPage, { Props } from './AnalyticsPage'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

/**
 * AnalyticsPage tests
 *
 * @group component
 */
describe('AnalyticsPage', () => {
  it('should render', () => {
    expect(
      render(
        <BrowserRouter>
          <AnalyticsPage {...instance(mockedProps)} />
        </BrowserRouter>,
      ),
    ).toBeTruthy()
  })
})
