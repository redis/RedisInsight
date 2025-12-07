import React from 'react'
import reactRouterDom from 'react-router-dom'
import { cloneDeep } from 'lodash'
import { waitFor } from '@testing-library/react'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import Router from 'uiSrc/Router'
import { localStorageService } from 'uiSrc/services'
import { Pages } from 'uiSrc/constants'
import {
  appContextSelector,
  setCurrentWorkspace,
} from 'uiSrc/slices/app/context'
import { AppWorkspace } from 'uiSrc/slices/interfaces'
import MainRouter from './MainRouter'
import * as activityMonitor from './hooks/useActivityMonitor'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  localStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

jest.mock('uiSrc/slices/app/context', () => ({
  ...jest.requireActual('uiSrc/slices/app/context'),
  appContextSelector: jest.fn().mockReturnValue({
    ...jest.requireActual('uiSrc/slices/app/context').appContextSelector,
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('MainRouter', () => {
  it('should render', () => {
    expect(
      render(
        <Router>
          <MainRouter />
        </Router>,
      ),
    ).toBeTruthy()
  })

  it('should redirect to rdi page', () => {
    localStorageService.get = jest.fn().mockReturnValue(Pages.rdi)

    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })
    reactRouterDom.useLocation = jest
      .fn()
      .mockReturnValue({ pathname: Pages.home })

    render(
      <Router>
        <MainRouter />
      </Router>,
    )

    expect(pushMock).toBeCalledWith(Pages.rdi)
  })

  it('should set RDI workspace', () => {
    ;(appContextSelector as jest.Mock).mockReturnValueOnce({
      workspace: AppWorkspace.Databases,
    })
    reactRouterDom.useLocation = jest
      .fn()
      .mockReturnValue({ pathname: Pages.rdiPipelineConfig('1') })

    render(
      <Router>
        <MainRouter />
      </Router>,
    )

    expect(store.getActions()).toContainEqual(
      setCurrentWorkspace(AppWorkspace.RDI),
    )
  })

  it('should set Database workspace', () => {
    ;(appContextSelector as jest.Mock).mockReturnValueOnce({
      workspace: AppWorkspace.RDI,
    })
    reactRouterDom.useLocation = jest
      .fn()
      .mockReturnValue({ pathname: Pages.analytics('1') })

    render(
      <Router>
        <MainRouter />
      </Router>,
    )

    expect(store.getActions()).toContainEqual(
      setCurrentWorkspace(AppWorkspace.Databases),
    )
  })

  it('starts activity monitor on mount and stops on unmount', async () => {
    const useActivityMonitorSpy = jest.spyOn(
      activityMonitor,
      'useActivityMonitor',
    )

    render(
      <Router>
        <MainRouter />
      </Router>,
    )

    await waitFor(() => {
      expect(useActivityMonitorSpy).toHaveBeenCalledTimes(1)
    })
  })
})
