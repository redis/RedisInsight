import React from 'react'
import { mockFeatureFlags, render, screen } from 'uiSrc/utils/test-utils'
import { OAuthSocialSource, RedisDefaultModules } from 'uiSrc/slices/interfaces'
import { freeInstancesSelector } from 'uiSrc/slices/instances/instances'
import ModuleNotLoadedMinimalized from './ModuleNotLoadedMinimalized'

const moduleName = RedisDefaultModules.Search
const source = OAuthSocialSource.Tutorials

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  freeInstancesSelector: jest.fn().mockReturnValue([
    {
      id: 'instanceId',
    },
  ]),
}))

describe('ModuleNotLoadedMinimalized', () => {
  it('should render', () => {
    expect(
      render(
        <ModuleNotLoadedMinimalized moduleName={moduleName} source={source} />,
      ),
    ).toBeTruthy()
  })

  it('should render connect to instance body when free instance is added', () => {
    ;(freeInstancesSelector as jest.Mock).mockReturnValue([
      {
        id: 'instanceId',
        modules: [
          {
            name: moduleName,
          },
        ],
      },
    ])
    render(
      <ModuleNotLoadedMinimalized moduleName={moduleName} source={source} />,
    )

    expect(screen.getByTestId('connect-free-db-btn')).toBeInTheDocument()
  })

  it('should render add free db body when free instance is not added', () => {
    ;(freeInstancesSelector as jest.Mock).mockReturnValue(null)

    render(
      <ModuleNotLoadedMinimalized moduleName={moduleName} source={source} />,
    )

    expect(screen.getByTestId('tutorials-get-started-link')).toBeInTheDocument()
  })

  it('should render expected text and "Redis databases page" button when cloudAds feature flag is disabled', () => {
    mockFeatureFlags({
      cloudAds: {
        flag: false,
      },
    })

    render(
      <ModuleNotLoadedMinimalized moduleName={moduleName} source={source} />,
    )

    expect(
      screen.queryByTestId('tutorials-get-started-link'),
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('connect-free-db-btn')).not.toBeInTheDocument()
    expect(screen.getByText(/Redis Databases page/)).toBeInTheDocument()
    expect(
      screen.getByText(/Open a database with Redis Query Engine/),
    ).toBeInTheDocument()
  })

  it('should render expected text when cloudAds feature flag is enabled', () => {
    mockFeatureFlags({
      cloudAds: {
        flag: true,
      },
    })

    render(
      <ModuleNotLoadedMinimalized moduleName={moduleName} source={source} />,
    )

    expect(
      screen.getByText(
        /Create a free Redis Cloud database with search and query/,
      ),
    ).toBeInTheDocument()
  })
})
