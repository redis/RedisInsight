import React from 'react'
import { cloneDeep } from 'lodash'
import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  within,
} from 'uiSrc/utils/test-utils'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { addFreeDb, oauthCloudPlanSelector } from 'uiSrc/slices/oauth/cloud'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import {
  MOCK_NO_TF_REGION,
  MOCK_REGIONS,
  MOCK_RS_PREVIEW_REGION,
  MOCK_CUSTOM_REGIONS,
} from 'uiSrc/constants/mocks/mock-sso'
import { mockModal } from 'uiSrc/mocks/components/modal'
import OAuthSelectPlan from './OAuthSelectPlan'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/oauth/cloud', () => {
  const defaultState = jest.requireActual(
    'uiSrc/slices/oauth/cloud',
  ).initialState
  return {
    ...jest.requireActual('uiSrc/slices/oauth/cloud'),
    oauthCloudSelector: jest.fn().mockReturnValue(defaultState),
    oauthCloudPlanSelector: jest.fn().mockReturnValue({
      isOpenDialog: true,
      data: [],
    }),
  }
})

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    cloudSso: {
      flag: true,
      data: {
        selectPlan: {
          components: {
            redisStackPreview: [
              {
                provider: 'AWS',
                regions: ['us-east-2', 'ap-southeast-1', 'sa-east-1'],
              },
              {
                provider: 'GCP',
                regions: ['asia-northeast1', 'europe-west1', 'us-central1'],
              },
            ],
          },
        },
      },
    },
  }),
}))

jest.mock('uiBase/display', () => {
  const actual = jest.requireActual('uiBase/display')

  return mockModal(actual)
})

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('OAuthSelectPlan', () => {
  beforeEach(() => {
    ;(oauthCloudPlanSelector as jest.Mock).mockReturnValue({
      isOpenDialog: true,
      data: MOCK_REGIONS,
    })
  })

  it('should render', () => {
    const { queryByTestId } = render(<OAuthSelectPlan />)
    expect(queryByTestId('oauth-select-plan-dialog')).toBeInTheDocument()
  })
  it('should not render if isOpenDialog=false', () => {
    ;(oauthCloudPlanSelector as jest.Mock).mockReturnValueOnce({
      isOpenDialog: false,
    })
    const { queryByTestId } = render(<OAuthSelectPlan />)
    expect(queryByTestId('oauth-select-plan-dialog')).not.toBeInTheDocument()
  })

  it('should send telemetry after close modal', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    const { queryByTestId } = render(<OAuthSelectPlan />)

    const closeEl = queryByTestId('oauth-select-plan-dialog-close-btn')

    fireEvent.click(closeEl as HTMLButtonElement)

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_SIGN_IN_PROVIDER_FORM_CLOSED,
    })
  })

  it('should call addFreeDb after click on submit', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    const { queryByTestId } = render(<OAuthSelectPlan />)

    const submitEl = queryByTestId('submit-oauth-select-plan-dialog')

    fireEvent.click(submitEl as HTMLButtonElement)

    const expectedActions = [addFreeDb()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('region with RS should be selected by default', async () => {
    const container = render(<OAuthSelectPlan />)

    const { queryByTestId } = within(
      container.queryByTestId('select-oauth-region') as HTMLElement,
    )
    const tfIconEl = queryByTestId(/rs-text-/)

    expect(tfIconEl).toBeInTheDocument()
  })

  it('Should display region with RS preview text', async () => {
    ;(oauthCloudPlanSelector as jest.Mock).mockReturnValue({
      isOpenDialog: true,
      data: [MOCK_RS_PREVIEW_REGION],
    })

    const container = render(<OAuthSelectPlan />)

    const { queryByTestId } = within(
      container.queryByTestId('select-oauth-region') as HTMLElement,
    )
    const rsTextEl = queryByTestId(/rs-text-/)

    expect(rsTextEl).toBeInTheDocument()
  })

  it('should be selected first region by default', async () => {
    ;(oauthCloudPlanSelector as jest.Mock).mockReturnValue({
      isOpenDialog: true,
      data: MOCK_CUSTOM_REGIONS,
    })

    const container = render(<OAuthSelectPlan />)

    const { queryByTestId } = within(
      container.queryByTestId('select-oauth-region') as HTMLElement,
    )
    const selectedEl = queryByTestId('option-custom-1')

    expect(selectedEl).toBeInTheDocument()
  })

  it('should be selected us-east-2 region by default', async () => {
    ;(oauthCloudPlanSelector as jest.Mock).mockReturnValue({
      isOpenDialog: true,
      data: [MOCK_NO_TF_REGION, MOCK_RS_PREVIEW_REGION, ...MOCK_CUSTOM_REGIONS],
    })
    ;(appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValueOnce({})

    const container = render(<OAuthSelectPlan />)

    const { queryByTestId } = within(
      container.queryByTestId('select-oauth-region') as HTMLElement,
    )
    const selectedEl = queryByTestId('option-us-east-2')

    expect(selectedEl).toBeInTheDocument()
  })

  it('Should select region with RS preview text by default', async () => {
    ;(oauthCloudPlanSelector as jest.Mock).mockReturnValue({
      isOpenDialog: true,
      data: [MOCK_RS_PREVIEW_REGION, ...MOCK_CUSTOM_REGIONS],
    })

    const container = render(<OAuthSelectPlan />)

    const { queryByTestId } = within(
      container.queryByTestId('select-oauth-region') as HTMLElement,
    )
    const rsTextEl = queryByTestId(/rs-text-/)

    expect(rsTextEl).toBeInTheDocument()
  })

  it('should display text if regions is no available on this venodor', async () => {
    ;(oauthCloudPlanSelector as jest.Mock).mockReturnValue({
      isOpenDialog: true,
      data: [],
    })

    const { queryByTestId } = render(<OAuthSelectPlan />)
    const selectDescriptionEl = queryByTestId(
      'select-region-select-description',
    )

    expect(selectDescriptionEl).toBeInTheDocument()
    expect(selectDescriptionEl).toHaveTextContent(
      'No regions available, try another vendor.',
    )
  })
})
