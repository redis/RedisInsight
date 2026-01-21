import { cloneDeep, set } from 'lodash'
import React from 'react'
import { BuildType } from 'uiSrc/constants/env'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import {
  cleanup,
  mockedStore,
  render,
  screen,
  fireEvent,
  initialStateDefault,
  mockStore,
} from 'uiSrc/utils/test-utils'

import { FeatureFlags } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import NavigationMenu from './NavigationMenu'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const mockAppInfoSelector = jest.requireActual('uiSrc/slices/app/info')

jest.mock('uiSrc/slices/app/context', () => ({
  ...jest.requireActual('uiSrc/slices/app/context'),
  appContextSelector: jest.fn().mockReturnValue({
    workspace: 'database',
  }),
}))

jest.mock('uiSrc/slices/app/info', () => ({
  ...jest.requireActual('uiSrc/slices/app/info'),
  appInfoSelector: jest.fn().mockReturnValue({
    server: {},
  }),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: '',
  }),
}))

jest.mock('uiSrc/slices/rdi/instances', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: 'mockRdiId',
  }),
}))

describe('NavigationMenu', () => {
  describe('without connectedInstance', () => {
    it('should render', () => {
      ;(appInfoSelector as jest.Mock).mockImplementation(() => ({
        ...mockAppInfoSelector,
        server: {
          buildType: BuildType.DockerOnPremise,
        },
      }))
      expect(render(<NavigationMenu />)).toBeTruthy()
    })

    it("shouldn't render private routes", () => {
      ;(appInfoSelector as jest.Mock).mockImplementation(() => ({
        ...mockAppInfoSelector,
        server: {
          buildType: BuildType.DockerOnPremise,
        },
      }))
      render(<NavigationMenu />)

      expect(screen.queryByTestId('browser-page-btn')).not.toBeInTheDocument()
    })

    it('should render help menu', () => {
      ;(appInfoSelector as jest.Mock).mockImplementation(() => ({
        ...mockAppInfoSelector,
        server: {
          buildType: BuildType.RedisStack,
        },
      }))
      render(<NavigationMenu />)

      expect(screen.getByTestId('help-menu-button')).toBeTruthy()
    })

    it('should render help menu items with proper links', () => {
      ;(appInfoSelector as jest.Mock).mockImplementation(() => ({
        ...mockAppInfoSelector,
        server: {
          buildType: BuildType.RedisStack,
        },
      }))
      render(<NavigationMenu />)

      fireEvent.click(screen.getByTestId('help-menu-button'))

      const submitBugBtn = screen.getByTestId('submit-bug-btn')
      expect(submitBugBtn).toBeInTheDocument()
      expect(submitBugBtn?.getAttribute('href')).toEqual(
        EXTERNAL_LINKS.githubIssues,
      )

      expect(screen.getByTestId('shortcuts-btn')).toBeInTheDocument()

      const releaseNotesBtn = screen.getByTestId('release-notes-btn')
      expect(releaseNotesBtn).toBeInTheDocument()
      expect(releaseNotesBtn?.getAttribute('href')).toEqual(
        EXTERNAL_LINKS.releaseNotes,
      )
    })
  })

  describe('with connectedInstance', () => {
    beforeEach(() => {
      ;(connectedInstanceSelector as jest.Mock).mockReturnValue({
        id: '123',
        connectionType: 'STANDALONE',
        db: 0,
      })
    })

    it('should render', () => {
      ;(appInfoSelector as jest.Mock).mockImplementation(() => ({
        ...mockAppInfoSelector,
        server: {
          buildType: BuildType.DockerOnPremise,
        },
      }))
      expect(render(<NavigationMenu />)).toBeTruthy()
    })

    it('should not render private routes with instanceId', () => {
      ;(appInfoSelector as jest.Mock).mockImplementation(() => ({
        ...mockAppInfoSelector,
        server: {
          buildType: BuildType.DockerOnPremise,
        },
      }))
      render(<NavigationMenu />)

      expect(screen.queryByTestId('browser-page-btn')).not.toBeInTheDocument()
      expect(screen.queryByTestId('workbench-page-btn')).not.toBeInTheDocument()
    })

    it('should render public routes', () => {
      ;(appInfoSelector as jest.Mock).mockImplementation(() => ({
        ...mockAppInfoSelector,
        server: {
          buildType: BuildType.DockerOnPremise,
        },
      }))
      render(<NavigationMenu />)

      expect(screen.getByTestId('settings-page-btn')).toBeTruthy()
    })

    it('should render cloud link', () => {
      const { container } = render(<NavigationMenu />)

      const createCloudItem = container.querySelector(
        '[data-testid="create-cloud-sidebar-item"]',
      )
      expect(createCloudItem).toBeTruthy()
    })

    it('should render github btn with proper link', () => {
      ;(appInfoSelector as jest.Mock).mockImplementation(() => ({
        ...mockAppInfoSelector,
        server: {
          buildType: BuildType.DockerOnPremise,
        },
      }))
      render(<NavigationMenu />)

      const githubBtn = screen.getByTestId('github-repo-btn')
      expect(githubBtn).toBeTruthy()
      expect(githubBtn?.getAttribute('href')).toEqual(EXTERNAL_LINKS.githubRepo)
    })
  })

  describe('feature flags tests', () => {
    it('should show feature dependent items when feature flag is on', async () => {
      const initialStoreState = set(
        cloneDeep(initialStateDefault),
        `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
        { flag: true },
      )

      render(<NavigationMenu />, {
        store: mockStore(initialStoreState),
      })
      fireEvent.click(screen.getByTestId('help-menu-button'))

      expect(screen.queryByTestId('notification-menu')).toBeInTheDocument()
      expect(screen.queryByTestId('help-center')).toBeInTheDocument()
      expect(
        screen.queryByTestId('github-repo-divider-default'),
      ).toBeInTheDocument()
      expect(screen.queryByTestId('github-repo-icon')).toBeInTheDocument()
    })

    it('should hide feature dependent items when feature flag is off', async () => {
      const initialStoreState = set(
        cloneDeep(initialStateDefault),
        `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
        { flag: false },
      )

      render(<NavigationMenu />, {
        store: mockStore(initialStoreState),
      })
      expect(screen.queryByTestId('help-center')).not.toBeInTheDocument()
      expect(screen.queryByTestId('github-repo-icon')).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('github-repo-divider-default'),
      ).not.toBeInTheDocument()
      expect(screen.queryByTestId('notification-menu')).not.toBeInTheDocument()
    })
  })
})
