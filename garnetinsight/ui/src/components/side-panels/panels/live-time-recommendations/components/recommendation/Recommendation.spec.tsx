import React from 'react'
import { mock, instance } from 'ts-mockito'
import reactRouterDom from 'react-router-dom'
import { cloneDeep, set } from 'lodash'
import {
  fireEvent,
  screen,
  render,
  mockedStore,
  cleanup,
  act,
  initialStateDefault,
  mockStore,
  userEvent,
} from 'uiSrc/utils/test-utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import {updateRecommendation, updateRecommendationSuccess} from 'uiSrc/slices/recommendations/recommendations'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { MOCK_RECOMMENDATIONS } from 'uiSrc/constants/mocks/mock-recommendations'
import { findTutorialPath } from 'uiSrc/utils'
import { FeatureFlags } from 'uiSrc/constants'
import Recommendation, { IProps } from './Recommendation'

const recommendationsContent = MOCK_RECOMMENDATIONS
const mockedProps = mock<IProps>()

const instanceMock = {
  ...instance(mockedProps),
  recommendationsContent,
}

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/utils', () => ({
  ...jest.requireActual('uiSrc/utils'),
  findTutorialPath: jest.fn(),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const PROVIDER = 'REDIS_CLOUD'

describe('Recommendation', () => {
  it('should render', () => {
    expect(render(<Recommendation {...instanceMock} />)).toBeTruthy()
  })

  it('should render content if recommendation is not read', () => {
    render(
      <Recommendation
        {...instanceMock}
        name="searchJSON"
        tutorialId=""
        isRead={false}
      />,
    )

    expect(screen.getByTestId('recommendation-voting')).toBeInTheDocument()
    expect(screen.getByTestId('searchJSON-to-tutorial-btn')).toBeInTheDocument()
  })

  it('should render RecommendationVoting', async () => {
    // initial state open
    render(<Recommendation {...instanceMock} name="searchJSON" />)
    // accordion button
    const button = screen.getByTestId(
      'ri-accordion-header-searchJSON',
    ) as HTMLButtonElement
    expect(screen.queryByTestId('recommendation-voting')).toBeInTheDocument()
    expect(button).toBeInTheDocument()
    // close accordion
    fireEvent.click(button)

    expect(
      screen.queryByTestId('recommendation-voting'),
    ).not.toBeInTheDocument()
    // open accordion
    fireEvent.click(button)

    expect(screen.queryByTestId('recommendation-voting')).toBeInTheDocument()
  })

  it('should properly push history on workbench page', async () => {
    // will be improved
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })
    ;(findTutorialPath as jest.Mock).mockImplementation(() => 'path')

    const { getByTestId } = render(
      <Recommendation
        {...instanceMock}
        isRead
        name="searchJSON"
        tutorialId="123"
        provider={PROVIDER}
      />,
    )

    await userEvent.click(
      getByTestId('ri-accordion-header-searchJSON') as HTMLButtonElement,
    )
    await userEvent.click(getByTestId('searchJSON-to-tutorial-btn'))

    expect(pushMock).toHaveBeenCalledWith({ search: 'path=tutorials/path' })
    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.INSIGHTS_TIPS_TUTORIAL_CLICKED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
        name: 'searchJSON',
        provider: PROVIDER,
      },
    })
    sendEventTelemetry.mockRestore()
  })

  it('should properly call openNewWindowDatabase and open a new window on workbench page to specific guide', async () => {
    // will be improved
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })
    ;(findTutorialPath as jest.Mock).mockImplementation(() => 'path')

    const { getByTestId } = render(
      <Recommendation
        {...instanceMock}
        isRead
        name="searchJSON"
        tutorialId="123"
        provider={PROVIDER}
      />,
    )

    await userEvent.click(
      getByTestId('ri-accordion-header-searchJSON') as HTMLButtonElement,
    )
    fireEvent.click(screen.getByTestId('searchJSON-to-tutorial-btn'))

    expect(pushMock).toHaveBeenCalledWith({
      search: 'path=tutorials/path',
    })
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_TIPS_TUTORIAL_CLICKED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
        name: 'searchJSON',
        provider: PROVIDER,
      },
    })
    sendEventTelemetry.mockRestore()
    pushMock.mockRestore()
  })

  it('should properly push history on workbench page to specific tutorial', async () => {
    // will be improved
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })
    ;(findTutorialPath as jest.Mock).mockImplementation(() => 'path')

    const { getByTestId } = render(
      <Recommendation
        {...instanceMock}
        isRead
        name="searchJSON"
        tutorialId="123"
        provider={PROVIDER}
      />,
    )

    await userEvent.click(
      getByTestId('ri-accordion-header-searchJSON') as HTMLButtonElement,
    )
    fireEvent.click(screen.getByTestId('searchJSON-to-tutorial-btn'))

    expect(pushMock).toHaveBeenCalledWith({
      search: 'path=tutorials/path',
    })
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_TIPS_TUTORIAL_CLICKED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
        name: 'searchJSON',
        provider: PROVIDER,
      },
    })
    sendEventTelemetry.mockRestore()
    pushMock.mockRestore()
  })

  it('should render hide/unhide button', () => {
    const name = 'searchJSON'
    render(<Recommendation {...instanceMock} name={name} />)

    expect(screen.getByTestId('toggle-hide-searchJSON-btn')).toBeInTheDocument()
  })

  it('click on hide/unhide button should call updateLiveRecommendation', async () => {
    const idMock = 'id'
    const nameMock = 'searchJSON'
    const { queryByTestId } = render(
      <Recommendation {...instanceMock} id={idMock} name={nameMock} />,
    )

    await act(() => {
      fireEvent.click(
        queryByTestId('toggle-hide-searchJSON-btn') as HTMLButtonElement,
      )
    })

    const expectedActions = [updateRecommendation(), updateRecommendationSuccess({})]

    expect(store.getActions()).toEqual(expectedActions)
    expect(screen.getByTestId('toggle-hide-searchJSON-btn')).toBeInTheDocument()
  })

  it('should not render "Tutorial" btn if tutorial is Undefined', () => {
    const name = 'searchJSON'
    const { queryByTestId } = render(
      <Recommendation {...instanceMock} name={name} tutorialId={undefined} />,
    )

    expect(queryByTestId(`${name}-to-tutorial-btn`)).not.toBeInTheDocument()
  })

  it('should render "Tutorial" if tutorialId="path"', () => {
    const name = 'searchJSON'
    const { queryByTestId } = render(
      <Recommendation {...instanceMock} name={name} tutorialId="path" />,
    )

    expect(queryByTestId(`${name}-to-tutorial-btn`)).toHaveTextContent(
      'Tutorial',
    )
  })

  it('should render "Workbench" btn if tutorialId=""', () => {
    const name = 'searchJSON'
    const { queryByTestId } = render(
      <Recommendation {...instanceMock} name={name} tutorialId="" />,
    )

    expect(queryByTestId(`${name}-to-tutorial-btn`)).toHaveTextContent(
      'Workbench',
    )
  })

  it('should render Snooze button', () => {
    const name = 'searchJSON'
    render(<Recommendation {...instanceMock} name={name} />)

    expect(screen.getByTestId(`${name}-delete-btn`)).toBeInTheDocument()
  })

  it('click on Snooze button should call deleteLiveRecommendations', async () => {
    const idMock = 'id'
    const nameMock = 'searchJSON'
    const { queryByTestId } = render(
      <Recommendation {...instanceMock} id={idMock} name={nameMock} />,
    )

    fireEvent.click(
      queryByTestId(`${nameMock}-delete-btn`) as HTMLButtonElement,
    )

    const expectedActions = [updateRecommendation()]

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should render vote section if feature flag is on', () => {
    const name = 'searchJSON'
    render(<Recommendation {...instanceMock} name={name} />)

    expect(screen.queryByText('Is this useful?')).toBeInTheDocument()
  })

  it('should not render vote section if feature flag is off', () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: false },
    )
    store = mockStore(initialStoreState)

    const name = 'searchJSON'
    render(<Recommendation {...instanceMock} name={name} />, { store })

    expect(screen.queryByText('Is this useful?')).not.toBeInTheDocument()
  })
})
