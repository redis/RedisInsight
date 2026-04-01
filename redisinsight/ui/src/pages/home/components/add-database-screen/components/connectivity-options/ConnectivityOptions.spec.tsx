import React from 'react'
import { mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'

import { AddDbType } from 'uiSrc/pages/home/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { setSSOFlow } from 'uiSrc/slices/instances/cloud'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { setSocialDialogState } from 'uiSrc/slices/oauth/cloud'
import { useConnectivityOptions } from '../../hooks/useConnectivityOptions'
import ConnectivityOptions, { Props } from './ConnectivityOptions'

jest.mock('../../hooks/useConnectivityOptions', () => ({
  useConnectivityOptions: jest.fn(),
}))

const mockedUseConnectivityOptions = useConnectivityOptions as jest.Mock

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    cloudSso: {
      flag: false,
    },
    cloudAds: {
      flag: true,
    },
  }),
}))

const defaultOptions = [
  {
    id: 'sentinel',
    type: AddDbType.sentinel,
    title: 'Sentinel',
    icon: 'SentinelIcon',
    onClick: jest.fn(),
    loading: false,
    onCancel: undefined,
  },
  {
    id: 'software',
    type: AddDbType.software,
    title: 'Software',
    icon: 'SoftwareIcon',
    onClick: jest.fn(),
    loading: false,
    onCancel: undefined,
  },
  {
    id: 'import',
    type: AddDbType.import,
    title: 'Import',
    icon: 'ImportIcon',
    onClick: jest.fn(),
    loading: false,
    onCancel: undefined,
  },
]

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
  defaultOptions.forEach((option) => (option.onClick as jest.Mock).mockReset())
  mockedUseConnectivityOptions.mockReturnValue(defaultOptions)
})

describe('ConnectivityOptions', () => {
  it('should render', () => {
    expect(render(<ConnectivityOptions {...mockedProps} />)).toBeTruthy()
  })

  it('should render all additional options and call their onClick handlers', () => {
    const onClickOption = jest.fn()
    render(
      <ConnectivityOptions {...mockedProps} onClickOption={onClickOption} />,
    )

    fireEvent.click(screen.getByTestId('option-btn-sentinel'))
    expect(defaultOptions[0].onClick).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByTestId('option-btn-software'))
    expect(defaultOptions[1].onClick).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByTestId('option-btn-import'))
    expect(defaultOptions[2].onClick).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByTestId('discover-cloud-btn'))
    expect(onClickOption).toBeCalledWith(AddDbType.cloud)
  })

  it('should not call any actions after click on create cloud btn', () => {
    render(<ConnectivityOptions {...mockedProps} />)

    fireEvent.click(screen.getByTestId('create-free-db-btn'))

    expect(store.getActions()).toEqual([])
  })

  it('should call proper actions after click on create cloud btn', () => {
    ;(appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValue({
      cloudSso: {
        flag: true,
      },
      cloudAds: {
        flag: true,
      },
    })

    const onClose = jest.fn()
    render(<ConnectivityOptions {...mockedProps} onClose={onClose} />)

    fireEvent.click(screen.getByTestId('create-free-db-btn'))

    expect(store.getActions()).toEqual([
      setSSOFlow(OAuthSocialAction.Create),
      setSocialDialogState(OAuthSocialSource.AddDbForm),
    ])
    expect(onClose).toBeCalled()
  })

  it('should not should create free db button if cloud ads feature flag is disabled', () => {
    ;(appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValue({
      cloudSso: {
        flag: true,
      },
      cloudAds: {
        flag: false,
      },
    })

    const onClose = jest.fn()
    render(<ConnectivityOptions {...mockedProps} onClose={onClose} />)

    expect(screen.queryByTestId('create-free-db-btn')).not.toBeInTheDocument()
  })

  it('should not render the Cancel button when no option is loading', () => {
    render(<ConnectivityOptions {...mockedProps} />)

    expect(
      screen.queryByTestId('cancel-azure-login-btn'),
    ).not.toBeInTheDocument()
  })

  it('should render the Cancel button when an option is loading with onCancel', () => {
    const mockOnCancel = jest.fn()
    mockedUseConnectivityOptions.mockReturnValue([
      ...defaultOptions,
      {
        id: 'azure',
        type: AddDbType.azure,
        title: 'Azure',
        icon: 'AzureIcon',
        onClick: jest.fn(),
        loading: true,
        onCancel: mockOnCancel,
      },
    ])

    render(<ConnectivityOptions {...mockedProps} />)

    expect(screen.getByTestId('cancel-azure-login-btn')).toBeInTheDocument()
  })

  it('should not render the Cancel button when an option is loading but has no onCancel', () => {
    mockedUseConnectivityOptions.mockReturnValue([
      ...defaultOptions,
      {
        id: 'azure',
        type: AddDbType.azure,
        title: 'Azure',
        icon: 'AzureIcon',
        onClick: jest.fn(),
        loading: true,
        onCancel: undefined,
      },
    ])

    render(<ConnectivityOptions {...mockedProps} />)

    expect(
      screen.queryByTestId('cancel-azure-login-btn'),
    ).not.toBeInTheDocument()
  })

  it('should call onCancel when the Cancel button is clicked', () => {
    const mockOnCancel = jest.fn()
    mockedUseConnectivityOptions.mockReturnValue([
      ...defaultOptions,
      {
        id: 'azure',
        type: AddDbType.azure,
        title: 'Azure',
        icon: 'AzureIcon',
        onClick: jest.fn(),
        loading: true,
        onCancel: mockOnCancel,
      },
    ])

    render(<ConnectivityOptions {...mockedProps} />)

    fireEvent.click(screen.getByTestId('cancel-azure-login-btn'))

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })
})
