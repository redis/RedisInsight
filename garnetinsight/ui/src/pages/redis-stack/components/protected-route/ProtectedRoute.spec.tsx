import React from 'react'
import Router from 'uiSrc/Router'
import { render } from 'uiSrc/utils/test-utils'
import RouteWithSubRoutes from 'uiSrc/utils/routerWithSubRoutes'
import { Pages } from 'uiSrc/constants'
import { SettingsPage } from 'uiSrc/pages'

import ProtectedRoute from './ProtectedRoute'

describe('ProtectedRoute', () => {
  it('should render', () => {
    expect(
      render(
        <Router>
          <ProtectedRoute>
            <RouteWithSubRoutes
              key={1}
              path={Pages.settings}
              component={SettingsPage}
            />
          </ProtectedRoute>
        </Router>,
      ),
    ).toBeTruthy()
  })
})
