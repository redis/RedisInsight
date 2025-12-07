import { cloneDeep, set } from 'lodash'
import React from 'react'
import { CloudUser } from 'src/modules/cloud/user/models'
import { FeatureFlags } from 'uiSrc/constants'
import {
  cleanup,
  mockedStore,
  render,
  initialStateDefault,
  mockStore,
} from 'uiSrc/utils/test-utils'
import UserProfile from 'uiSrc/components/instance-header/components/user-profile/UserProfile'

const initialMockUser: CloudUser = {
  id: 123,
  name: 'John Smith',
  currentAccountId: 45,
  accounts: [
    {
      id: 45,
      name: 'Account 1',
    },
    {
      id: 46,
      name: 'Account 2',
    },
  ],
  data: {},
}

type MockStoreStateProps = {
  envDependent?: boolean
  cloudSso?: boolean
  cloudAds?: boolean
  mockUser?: CloudUser
}

const mockStoreStateWithFlags = ({
  envDependent = true,
  cloudSso = true,
  cloudAds = true,
  mockUser = initialMockUser,
}: MockStoreStateProps = {}) => {
  const keys = ['envDependent', 'cloudSso', 'cloudAds']
  const values = [envDependent, cloudSso, cloudAds]

  const initialStoreState = cloneDeep(initialStateDefault)

  for (let i = 0; i < keys.length; i++) {
    set(
      initialStoreState,
      `app.features.featureFlags.features.${FeatureFlags[keys[i] as keyof typeof FeatureFlags]}`,
      { flag: values[i] },
    )
  }

  set(initialStoreState, 'user.cloudProfile', {
    error: '',
    data: mockUser,
  })
  set(initialStoreState, 'oauth.cloud.user', {
    error: '',
    loading: false,
    initialLoading: false,
    data: mockUser,
  })

  return mockStore(initialStoreState)
}

describe('UserProfile', () => {
  let store: typeof mockedStore
  beforeEach(() => {
    cleanup()
    store = mockStoreStateWithFlags()
  })

  it('should render CloudUserProfile if envDependentFeature is disabled', () => {
    store = mockStoreStateWithFlags({ envDependent: false })
    const { getByTestId } = render(<UserProfile />, {
      store,
    })

    expect(getByTestId('cloud-user-profile-badge')).toBeInTheDocument()
  })

  it('should not show cloud user profile badge profile name is empty', () => {
    store = mockStoreStateWithFlags({
      envDependent: false,
      mockUser: {
        ...initialMockUser,
        name: '',
      },
    })
    const { queryByTestId } = render(<UserProfile />, {
      store,
    })

    expect(queryByTestId('cloud-user-profile-badge')).not.toBeInTheDocument()
  })

  it('should render OAuthUserProfile if envDependentFeature is enabled', () => {
    store = mockStoreStateWithFlags()
    const { queryByTestId } = render(<UserProfile />, {
      store,
    })

    expect(queryByTestId('oauth-user-profile-badge')).toBeInTheDocument()
  })

  it('should render nothing when envDependent=true, cloudAds=false, cloudSso=true', () => {
    store = mockStoreStateWithFlags({
      envDependent: true,
      cloudAds: false,
      cloudSso: true,
    })
    const { queryByTestId } = render(<UserProfile />, {
      store,
    })

    expect(queryByTestId('cloud-user-profile-badge')).not.toBeInTheDocument()
    expect(queryByTestId('oauth-user-profile-badge')).not.toBeInTheDocument()
  })

  it('should render nothing when envDependent=true, cloudAds=true, cloudSso=false', () => {
    store = mockStoreStateWithFlags({
      envDependent: true,
      cloudAds: true,
      cloudSso: false,
    })
    const { queryByTestId } = render(<UserProfile />, {
      store,
    })

    expect(queryByTestId('cloud-user-profile-badge')).not.toBeInTheDocument()
    expect(queryByTestId('oauth-user-profile-badge')).not.toBeInTheDocument()
  })
})
