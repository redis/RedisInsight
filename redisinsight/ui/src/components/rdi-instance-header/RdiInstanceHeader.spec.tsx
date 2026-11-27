import { cloneDeep, set } from 'lodash'
import { faker } from '@faker-js/faker'
import React from 'react'
import reactRouterDom from 'react-router-dom'

import {
  cleanup,
  fireEvent,
  initialStateDefault,
  mockedStore,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { FeatureFlags } from 'uiSrc/constants'
import RdiInstanceHeader from './RdiInstanceHeader'

jest.mock('uiSrc/slices/rdi/instances', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    name: 'name',
  }),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn,
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('RdiInstanceHeader', () => {
  it('should render', () => {
    expect(render(<RdiInstanceHeader />)).toBeTruthy()
  })

  it('should call history push with proper path', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<RdiInstanceHeader />)

    fireEvent.click(screen.getByTestId('my-rdi-instances-btn'))

    expect(pushMock).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith('/integrate')
  })

  it('should not show a pipeline segment without a pipeline breadcrumb', () => {
    render(<RdiInstanceHeader />)

    expect(screen.queryByTestId('rdi-pipeline-name')).toBeNull()
    expect(screen.queryByTestId('nav-instance-name-link')).toBeNull()
  })

  it('should leave through the pipeline breadcrumb exit instead of history', () => {
    const pushMock = jest.fn()
    const exitMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(
      <RdiInstanceHeader
        pipelineBreadcrumb={{ exit: exitMock, showList: jest.fn() }}
      />,
    )
    fireEvent.click(screen.getByTestId('my-rdi-instances-btn'))

    expect(exitMock).toHaveBeenCalledTimes(1)
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('should keep the instance name as the switcher while no pipeline is open', () => {
    render(
      <RdiInstanceHeader
        pipelineBreadcrumb={{ exit: jest.fn(), showList: jest.fn() }}
      />,
    )

    expect(screen.queryByTestId('rdi-pipeline-name')).toBeNull()
    expect(screen.queryByTestId('nav-instance-name-link')).toBeNull()
  })

  it('should show the open pipeline and link the instance name back to the list', () => {
    const pipelineName = faker.word.noun()
    const showListMock = jest.fn()

    render(
      <RdiInstanceHeader
        pipelineBreadcrumb={{
          pipelineName,
          exit: jest.fn(),
          showList: showListMock,
        }}
      />,
    )

    expect(screen.getByTestId('rdi-pipeline-name')).toHaveTextContent(
      pipelineName,
    )
    fireEvent.click(screen.getByTestId('nav-instance-name-link'))
    expect(showListMock).toHaveBeenCalledTimes(1)
  })

  it('should render proper instance name', () => {
    expect(render(<RdiInstanceHeader />)).toBeTruthy()

    expect(screen.getByText('name')).toBeInTheDocument()
  })

  it('should show feature dependent items when feature flag is on', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.cloudSso}`,
      { flag: true },
    )

    render(<RdiInstanceHeader />, {
      store: mockStore(initialStoreState),
    })
    expect(screen.queryByTestId('o-auth-user-profile-rdi')).toBeInTheDocument()
  })

  it('should hide feature dependent items when feature flag is off', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.cloudSso}`,
      { flag: false },
    )

    render(<RdiInstanceHeader />, {
      store: mockStore(initialStoreState),
    })
    expect(
      screen.queryByTestId('o-auth-user-profile-rdi'),
    ).not.toBeInTheDocument()
  })
})
