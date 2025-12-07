import React from 'react'
import reactRouterDom from 'react-router-dom'
import {
  act,
  fireEvent,
  mockFeatureFlags,
  render,
} from 'uiSrc/utils/test-utils'
import * as utils from 'uiSrc/utils/modules'
import { Instance, RedisDefaultModules } from 'uiSrc/slices/interfaces'
import ModuleNotLoaded, { IProps } from './ModuleNotLoaded'

const props: IProps = {
  moduleName: RedisDefaultModules.Search,
  type: 'browser',
  id: 'id',
  onClose: jest.fn(),
}

const mockUseHistory = { push: jest.fn() }
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn,
  }),
}))
jest.mock(
  'uiSrc/assets/img/icons/mobile_module_not_loaded.svg?react',
  () => 'div',
)
jest.mock('uiSrc/assets/img/icons/module_not_loaded.svg?react', () => 'div')
jest.mock('uiSrc/assets/img/telescope-dark.svg?react', () => 'div')
jest.mock('uiSrc/assets/img/icons/cheer.svg?react', () => 'div')

const mockGetDbWithModuleLoaded = (value?: boolean) => {
  jest
    .spyOn(utils, 'getDbWithModuleLoaded')
    .mockImplementation(() => value as unknown as Instance)
}

const TEST_IDS = {
  ctaWrapper: 'module-not-loaded-cta-wrapper',
}

describe('ModuleNotLoaded', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockFeatureFlags()
    mockGetDbWithModuleLoaded()
  })

  it('should render', () => {
    expect(render(<ModuleNotLoaded {...props} />)).toBeTruthy()
  })

  it('should render free text when cloudAds feature is enabled and no free db exists', () => {
    const { queryByText } = render(<ModuleNotLoaded {...props} />)
    expect(
      queryByText(
        /Create a free all-in-one Redis Cloud database to start exploring these capabilities./,
      ),
    ).toBeInTheDocument()
  })

  it('should render free db text when cloudAds feature is enabled and free db exists', () => {
    mockGetDbWithModuleLoaded(true)
    const { queryByText } = render(<ModuleNotLoaded {...props} />)
    expect(
      queryByText(
        /Use your free all-in-one Redis Cloud database to start exploring these capabilities./,
      ),
    ).toBeInTheDocument()
  })

  it('should render expected text when cloudAds feature is disabled', () => {
    mockFeatureFlags({
      cloudAds: {
        flag: false,
      },
    })
    mockGetDbWithModuleLoaded(true) // should not affect output
    const { queryByText } = render(<ModuleNotLoaded {...props} />)
    expect(
      queryByText(/Open a database with Redis Query Engine/),
    ).toBeInTheDocument()
  })

  it('should not show CTA button when envDependant feature is disabled', () => {
    mockFeatureFlags({
      envDependent: {
        flag: false,
      },
    })
    const { queryByTestId } = render(<ModuleNotLoaded {...props} />)
    expect(queryByTestId(TEST_IDS.ctaWrapper)).toBeEmptyDOMElement()
  })

  it('should show "Get Started For Free" button when envDependant feature is enabled and cloudAds feature is enabled', () => {
    const { queryByText, getByText } = render(<ModuleNotLoaded {...props} />)
    expect(getByText(/Get Started For Free/)).toBeInTheDocument()
    expect(queryByText(/Redis Databases page/)).not.toBeInTheDocument()
  })

  it('should show "Redis Databases page" button when envDependant feature is enabled and cloudAds feature is disabled', async () => {
    mockFeatureFlags({
      cloudAds: {
        flag: false,
      },
    })
    jest
      .spyOn(reactRouterDom, 'useHistory')
      .mockImplementation(() => mockUseHistory as unknown as any)

    const { queryByText, getByText } = render(<ModuleNotLoaded {...props} />)
    const databasesButton = getByText(/Redis Databases page/)
    expect(databasesButton).toBeInTheDocument()
    expect(queryByText(/Get Started For Free/)).not.toBeInTheDocument()

    // click button
    act(() => {
      fireEvent.click(databasesButton)
    })

    // assert
    expect(mockUseHistory.push).toHaveBeenCalledTimes(1)
    expect(mockUseHistory.push).toHaveBeenCalledWith('/')
  })

  it('should show expected text when cloudAds feature is disabled', () => {
    mockFeatureFlags({
      cloudAds: {
        flag: false,
      },
    })
    const { getByText } = render(<ModuleNotLoaded {...props} />)
    expect(
      getByText(/Open a database with Redis Query Engine/),
    ).toBeInTheDocument()
  })

  it('should show expected text when free db exists', () => {
    mockGetDbWithModuleLoaded(true)
    const { getByText } = render(<ModuleNotLoaded {...props} />)
    expect(
      getByText(
        /Use your free all-in-one Redis Cloud database to start exploring these capabilities./,
      ),
    ).toBeInTheDocument()
  })

  it('should show expected text when free db does not exist', () => {
    const { getByText } = render(<ModuleNotLoaded {...props} />)
    expect(
      getByText(
        /Create a free all-in-one Redis Cloud database to start exploring these capabilities./,
      ),
    ).toBeInTheDocument()
  })

  it('should uppercase first letter of module name in title - time series', () => {
    const { getByText } = render(
      <ModuleNotLoaded
        {...props}
        moduleName={RedisDefaultModules.TimeSeries}
      />,
    )
    expect(
      getByText(
        /Time series data structure is not available for this database/,
      ),
    ).toBeInTheDocument()
  })

  it('should uppercase first letter of module name in title - bloom', () => {
    const { getByText } = render(
      <ModuleNotLoaded {...props} moduleName={RedisDefaultModules.Bloom} />,
    )
    expect(
      getByText(
        /Probabilistic data structures are not available for this database/,
      ),
    ).toBeInTheDocument()
  })
})
