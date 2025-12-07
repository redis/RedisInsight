import React from 'react'
import Router from 'uiSrc/Router'
import { render } from 'uiSrc/utils/test-utils'
import RouteWithSubRoutes from 'uiSrc/utils/routerWithSubRoutes'

import { Pages } from 'uiSrc/constants'
import { SettingsPage } from 'uiSrc/pages'

describe('RouteWithSubRoutes', () => {
  it('should render', () => {
    expect(
      render(
        <Router>
          <RouteWithSubRoutes
            key={1}
            path={Pages.settings}
            component={SettingsPage}
          />
        </Router>,
      ),
    ).toBeTruthy()
  })
})
