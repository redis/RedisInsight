import React from 'react'
import { CloudUser } from 'src/modules/cloud/user/models'
import {
  act,
  fireEvent,
  render,
  screen,
  waitForRiPopoverVisible,
  within,
} from 'uiSrc/utils/test-utils'
import * as appFeaturesSlice from 'uiSrc/slices/app/features'
import UserProfileBadge, { UserProfileBadgeProps } from './UserProfileBadge'

const mockUser: CloudUser = {
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

const TEST_IDS = {
  badge: 'test-user-profile-badge',
  profileTitle: 'profile-title',
  accountsList: 'user-profile-popover-accounts',
  selectedAccountCheckmark: (accountId: number) =>
    `user-profile-selected-account-${accountId}`,
  selectingAccountSpinner: (accountId: number) =>
    `user-profile-selecting-account-${accountId}`,
  cloudAdminConsoleLink: 'cloud-admin-console-link',
  importCloudDatabases: 'profile-import-cloud-databases',
  logoutButton: 'profile-logout',
  accountFullName: 'account-full-name',
  cloudConsoleLink: 'cloud-console-link',
}

jest.mock('uiSrc/config', () => ({
  getConfig: jest.fn(() => {
    const { getConfig: actualGetConfig } = jest.requireActual('uiSrc/config')
    const actualConfig = actualGetConfig()
    return {
      ...actualConfig,
      app: {
        ...actualConfig.app,
        smConsoleRedirect: 'https://foo.bar',
      },
    }
  }),
}))

const mockFeatureFlags = (envDependent = true) => {
  jest
    .spyOn(appFeaturesSlice, 'appFeatureFlagsFeaturesSelector')
    .mockReturnValue({
      envDependent: {
        flag: envDependent,
      },
    })
}

describe('UserProfileBadge', () => {
  let handleClickSelectAccount: jest.Mock
  let handleClickCloudAccount: jest.Mock
  const selectingAccountId = undefined
  let renderUserProfileBadge: (
    props?: Partial<UserProfileBadgeProps>,
  ) => ReturnType<typeof render>
  let renderAndOpenUserProfileBadge: (
    props?: Partial<UserProfileBadgeProps>,
  ) => Promise<ReturnType<typeof render>>

  beforeEach(() => {
    mockFeatureFlags()
    handleClickSelectAccount = jest.fn()
    handleClickCloudAccount = jest.fn()

    renderUserProfileBadge = (props?: Partial<UserProfileBadgeProps>) =>
      render(
        <UserProfileBadge
          data={mockUser}
          error={null}
          handleClickSelectAccount={handleClickSelectAccount}
          handleClickCloudAccount={handleClickCloudAccount}
          selectingAccountId={selectingAccountId}
          data-testid={TEST_IDS.badge}
          {...props}
        />,
      )

    renderAndOpenUserProfileBadge = async (
      props?: Partial<UserProfileBadgeProps>,
    ) => {
      const resp = renderUserProfileBadge(props)

      await act(async () => {
        fireEvent.click(screen.getByTestId('user-profile-btn'))
      })
      await waitForRiPopoverVisible()

      return resp
    }
  })

  it('should show button with user initials if data is present', () => {
    const { queryByRole } = renderUserProfileBadge()
    expect(queryByRole('presentation')).toHaveTextContent('JS')
  })

  it('should not render anything if data is absent', () => {
    const { container } = renderUserProfileBadge({ data: null })
    expect(container).toBeEmptyDOMElement()
  })

  it('should not render anything if error is provided', () => {
    const { container } = renderUserProfileBadge({ error: 'An error occurred' })
    expect(container).toBeEmptyDOMElement()
  })

  it('should show expected header when envDependent flag is enabled', async () => {
    const { getByTestId } = await renderAndOpenUserProfileBadge()
    expect(getByTestId(TEST_IDS.profileTitle)).toHaveTextContent(
      'Redis Cloud account',
    )
  })

  it('should show expected header when envDependent flag is disabled', async () => {
    mockFeatureFlags(false)
    const { getByTestId } = await renderAndOpenUserProfileBadge()
    expect(getByTestId(TEST_IDS.profileTitle)).toHaveTextContent('Account')
  })

  it('should show available accounts and selected account', async () => {
    const { getByTestId } = await renderAndOpenUserProfileBadge()

    // eslint-disable-next-line no-restricted-syntax
    for (const account of mockUser.accounts ?? []) {
      const testId = `profile-account-${account.id}${account.id === mockUser.currentAccountId ? '-selected' : ''}`
      const accountElement = getByTestId(testId)
      expect(accountElement).toHaveTextContent(account.name)

      // checkbox icon for selected account
      if (account.id === mockUser.currentAccountId) {
        expect(
          within(accountElement).queryByTestId(
            TEST_IDS.selectedAccountCheckmark(account.id),
          ),
        ).toBeInTheDocument()
      } else {
        expect(
          within(accountElement).queryByTestId(
            TEST_IDS.selectedAccountCheckmark(account.id),
          ),
        ).not.toBeInTheDocument()
      }

      // click on account
      // eslint-disable-next-line no-await-in-loop
      await act(async () => {
        fireEvent.click(accountElement)
      })
      expect(handleClickSelectAccount).toHaveBeenCalledTimes(1)
      expect(handleClickSelectAccount).toHaveBeenCalledWith(account.id)
      handleClickSelectAccount.mockReset()
    }
  })

  it('should show spinner next to account when selectedAccountId is provided', async () => {
    const selectingAccountId = 46
    const { getByTestId } = await renderAndOpenUserProfileBadge({
      selectingAccountId,
    })

    mockUser.accounts?.forEach((account) => {
      const testId = `profile-account-${account.id}${account.id === mockUser.currentAccountId ? '-selected' : ''}`
      const accountElement = getByTestId(testId)
      expect(accountElement).toHaveTextContent(account.name)

      // spinner for selecting account
      if (account.id === selectingAccountId) {
        expect(
          within(accountElement).queryByTestId(
            TEST_IDS.selectingAccountSpinner(account.id),
          ),
        ).toBeInTheDocument()
      } else {
        expect(
          within(accountElement).queryByTestId(
            TEST_IDS.selectingAccountSpinner(account.id),
          ),
        ).not.toBeInTheDocument()
      }
    })
  })

  it('should show expected links when envDependent flag is disabled', async () => {
    mockFeatureFlags(false)
    const { getByTestId, queryByTestId } = await renderAndOpenUserProfileBadge()

    const link = getByTestId(TEST_IDS.cloudAdminConsoleLink)
    expect(link).toHaveAttribute('href', 'https://foo.bar')
    expect(link).toHaveTextContent('Back to Redis Cloud Admin console')

    expect(queryByTestId(TEST_IDS.importCloudDatabases)).not.toBeInTheDocument()
    expect(queryByTestId(TEST_IDS.logoutButton)).not.toBeInTheDocument()
    expect(queryByTestId(TEST_IDS.accountFullName)).not.toBeInTheDocument()
    expect(queryByTestId(TEST_IDS.cloudConsoleLink)).not.toBeInTheDocument()
  })

  it('should show expected links when envDependent flag is enabled', async () => {
    mockFeatureFlags()
    const { getByTestId, queryByTestId } = await renderAndOpenUserProfileBadge()

    expect(
      queryByTestId(TEST_IDS.cloudAdminConsoleLink),
    ).not.toBeInTheDocument()
    expect(getByTestId(TEST_IDS.importCloudDatabases)).toBeInTheDocument()
    expect(getByTestId(TEST_IDS.logoutButton)).toBeInTheDocument()
    expect(getByTestId(TEST_IDS.accountFullName)).toBeInTheDocument()
    expect(getByTestId(TEST_IDS.cloudConsoleLink)).toBeInTheDocument()
  })
})
