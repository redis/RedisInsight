import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import { cloneDeep, set } from 'lodash'
import reactRouterDom from 'react-router-dom'
import {
  initialStateDefault,
  mockStore,
  mockWindowLocation,
  render,
} from 'uiSrc/utils/test-utils'
import { FeatureFlags } from 'uiSrc/constants'
import NotFoundErrorPage from 'uiSrc/pages/not-found-error/NotFoundErrorPage'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn,
  }),
}))

jest.mock('uiSrc/config', () => ({
  ...jest.requireActual('uiSrc/config'),
  getConfig: () => {
    const actualConfig = jest.requireActual('uiSrc/config')
    const config = actualConfig.getConfig()
    return {
      ...config,
      app: {
        activityMonitorOrigin: 'http://foo.bar',
      },
    }
  },
}))

beforeEach(() => {
  jest.resetAllMocks()
  mockWindowLocation()
})

describe('NotFoundErrorPage', () => {
  it('should render the correct button when envDependent feature is on', async () => {
    const pushMock = jest.fn()
    jest
      .spyOn(reactRouterDom, 'useHistory')
      .mockReturnValue({ push: pushMock } as any)

    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: true },
    )

    render(<NotFoundErrorPage />, {
      store: mockStore(initialStoreState),
    })

    const dbListButton = screen.getByTestId('not-found-db-list-button')
    fireEvent.click(dbListButton)

    expect(pushMock).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith('/')
  })

  it('should render the correct button when envDependent feature is off', () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: false },
    )

    render(<NotFoundErrorPage />, {
      store: mockStore(initialStoreState),
    })

    const dbListButton = screen.getByTestId('not-found-db-list-button')
    fireEvent.click(dbListButton)

    expect(window.location.href).toBe('http://foo.bar/#/databases')
  })
})
