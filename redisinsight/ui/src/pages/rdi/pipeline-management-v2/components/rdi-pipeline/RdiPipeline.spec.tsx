import React from 'react'
import { QueryClient } from '@tanstack/react-query'
import { faker } from '@faker-js/faker'
import type {
  NavigationService,
  RdiPipelinesNavigationGuard,
} from '@rdi-ui/pipeline'

import { render, screen } from 'uiSrc/utils/test-utils'
import { Pages } from 'uiSrc/constants'
import { Theme } from 'uiSrc/constants/themes'
import { useThemeContext } from 'uiSrc/contexts/themeContext'
import RdiPipeline, { Props } from './RdiPipeline'

const MOCK_RDI_ID = 'rdiInstanceId'
const OTHER_RDI_ID = 'otherRdiInstanceId'
const MOCK_RDI_ALIAS = faker.word.noun()

const mockRdiPipelines = jest.fn()
const mockQueryClientProvider = jest.fn()
// a fresh object per call, so tests can tell separate instances apart
const mockCreateDirectConfigTranslate = jest.fn(() => ({
  translateDraftToNativeConfig: jest.fn(),
  translateNativeConfigToDraft: jest.fn(),
}))

jest.mock('@rdi-ui/pipeline', () => ({
  RdiPipelines: (props: Record<string, unknown>) => mockRdiPipelines(props),
  createDirectConfigTranslate: () => mockCreateDirectConfigTranslate(),
}))

jest.mock('uiSrc/contexts/themeContext', () => ({
  ...jest.requireActual('uiSrc/contexts/themeContext'),
  useThemeContext: jest.fn(),
}))

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  QueryClientProvider: (props: {
    client: unknown
    children: React.ReactNode
  }) => {
    mockQueryClientProvider(props)
    return props.children
  },
}))

const createNavigation = (): NavigationService => ({
  getPath: jest.fn(() => Pages.rdiPipelineManagementV2(MOCK_RDI_ID)),
  navigate: jest.fn(),
  goBack: jest.fn(),
  exit: jest.fn(),
  subscribe: jest.fn(() => jest.fn()),
})

const createNavigationGuard = () =>
  ({
    requestNavigation: jest.fn(),
  }) as unknown as RdiPipelinesNavigationGuard

const MOCK_NAVIGATION = createNavigation()
const MOCK_NAVIGATION_GUARD = createNavigationGuard()

const getProps = (overrides: Partial<Props> = {}): Props => ({
  rdiInstanceId: MOCK_RDI_ID,
  rdiInstanceAlias: MOCK_RDI_ALIAS,
  navigation: MOCK_NAVIGATION,
  navigationGuard: MOCK_NAVIGATION_GUARD,
  ...overrides,
})

const renderComponent = (overrides: Partial<Props> = {}) => {
  const utils = render(<RdiPipeline {...getProps(overrides)} />)

  return {
    ...utils,
    rerenderComponent: (nextOverrides: Partial<Props> = {}) =>
      utils.rerender(<RdiPipeline {...getProps(nextOverrides)} />),
  }
}

describe('RdiPipeline', () => {
  let capturedProps: Record<string, unknown> = {}
  let capturedQueryClients: unknown[] = []

  beforeEach(() => {
    ;(useThemeContext as jest.Mock).mockReturnValue({ theme: Theme.Light })
    capturedProps = {}
    capturedQueryClients = []
    mockRdiPipelines.mockImplementation((props: Record<string, unknown>) => {
      capturedProps = props
      return <div data-testid="rdi-pipelines-mock" />
    })
    mockQueryClientProvider.mockImplementation((props: { client: unknown }) => {
      capturedQueryClients.push(props.client)
    })
  })

  it('should render the rdi pipelines package', () => {
    renderComponent()

    expect(screen.getByTestId('rdi-pipelines-mock')).toBeInTheDocument()
  })

  it('should point the rdi client at the proxy endpoint for this instance', () => {
    renderComponent()

    expect(capturedProps.basePath).toBe(
      Pages.rdiPipelineManagementV2(MOCK_RDI_ID),
    )
    expect(capturedProps.rdiClient).toMatchObject({
      baseUrl: expect.stringContaining(`rdi/${MOCK_RDI_ID}/proxy`),
    })
    expect(capturedProps.rdiClient).not.toHaveProperty('withCredentials')
  })

  it('should pass the rdi instance alias to the pipeline list', () => {
    renderComponent()

    expect(capturedProps.rdiInstance).toEqual({ alias: MOCK_RDI_ALIAS })
  })

  it('should hide the rdi-ui breadcrumb and share the host navigation and guard', () => {
    renderComponent()

    expect(capturedProps.hideBreadcrumb).toBe(true)
    expect(capturedProps.navigation).toBe(MOCK_NAVIGATION)
    expect(capturedProps.navigationGuard).toBe(MOCK_NAVIGATION_GUARD)
  })

  it.each([
    [Theme.Light, 'light'],
    [Theme.Dark, 'dark'],
  ])(
    'should render rdi-ui in the matching appearance for the %s theme',
    (theme, appearance) => {
      ;(useThemeContext as jest.Mock).mockReturnValue({ theme })

      renderComponent()

      expect(capturedProps.appearance).toBe(appearance)
    },
  )

  it('should use the direct host config translation and rdi-mounted pipeline secrets', () => {
    renderComponent()

    expect(capturedProps.configTranslate).toBe(
      mockCreateDirectConfigTranslate.mock.results.at(-1)?.value,
    )
    expect(capturedProps.pipelineSecrets).toEqual({ strategy: 'rdi' })
    expect(capturedProps.multiSource).toEqual({ enabled: true })
  })

  it('should create a new config translation for a different rdi instance', () => {
    const { rerenderComponent } = renderComponent()
    const initialConfigTranslate = capturedProps.configTranslate

    rerenderComponent({ rdiInstanceId: OTHER_RDI_ID })

    expect(capturedProps.configTranslate).not.toBe(initialConfigTranslate)
  })

  it('should pass a new rdi instance object when the alias changes', () => {
    const otherAlias = `${MOCK_RDI_ALIAS}-other`
    const { rerenderComponent } = renderComponent()
    const initialRdiInstance = capturedProps.rdiInstance

    rerenderComponent({ rdiInstanceAlias: otherAlias })

    expect(capturedProps.rdiInstance).not.toBe(initialRdiInstance)
    expect(capturedProps.rdiInstance).toEqual({ alias: otherAlias })
  })

  it('should keep prop identities stable across a rerender with the same props', () => {
    const { rerenderComponent } = renderComponent()
    const initialProps = capturedProps

    rerenderComponent()

    expect(capturedProps).not.toBe(initialProps)
    expect(capturedProps.rdiInstance).toBe(initialProps.rdiInstance)
    expect(capturedProps.rdiClient).toBe(initialProps.rdiClient)
    expect(capturedProps.targetDatabase).toBe(initialProps.targetDatabase)
    expect(capturedProps.sourceSecrets).toBe(initialProps.sourceSecrets)
    expect(capturedProps.multiSource).toBe(initialProps.multiSource)
    expect(capturedProps.pipelineSecrets).toBe(initialProps.pipelineSecrets)
    expect(capturedProps.configTranslate).toBe(initialProps.configTranslate)
  })

  it('should use a fresh query client for a different rdi instance, not reuse the previous one', () => {
    const { rerenderComponent } = renderComponent()

    rerenderComponent({ rdiInstanceId: OTHER_RDI_ID })

    expect(capturedQueryClients).toHaveLength(2)
    expect(capturedQueryClients[0]).toBeInstanceOf(QueryClient)
    expect(capturedQueryClients[1]).toBeInstanceOf(QueryClient)
    expect(capturedQueryClients[0]).not.toBe(capturedQueryClients[1])
  })

  it('should keep the same query client across a rerender for the same rdi instance', () => {
    const { rerenderComponent } = renderComponent()

    rerenderComponent()

    expect(capturedQueryClients).toHaveLength(2)
    expect(capturedQueryClients[0]).toBe(capturedQueryClients[1])
  })
})
