import React from 'react'
import reactRouterDom from 'react-router-dom'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { MOCK_EXPLORE_GUIDES } from 'uiSrc/constants/mocks/mock-explore-guides'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { findTutorialPath } from 'uiSrc/utils'

import ExploreGuides from './ExploreGuides'

jest.mock('uiSrc/slices/content/guide-links', () => ({
  ...jest.requireActual('uiSrc/slices/content/guide-links'),
  guideLinksSelector: jest.fn().mockReturnValue({
    data: MOCK_EXPLORE_GUIDES,
  }),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    provider: 'REDIS_CLOUD',
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/utils', () => ({
  ...jest.requireActual('uiSrc/utils'),
  findTutorialPath: jest.fn(),
}))

describe('ExploreGuides', () => {
  it('should render', () => {
    expect(render(<ExploreGuides />)).toBeTruthy()
  })

  it('should render guides', () => {
    render(<ExploreGuides />)

    MOCK_EXPLORE_GUIDES.forEach(({ tutorialId, icon }) => {
      expect(
        screen.getByTestId(`guide-button-${tutorialId}`),
      ).toBeInTheDocument()
      expect(screen.getByTestId(`guide-icon-${icon}`)).toBeInTheDocument()
    })
  })

  it('should call proper history push after click on guide', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })
    ;(findTutorialPath as jest.Mock).mockImplementation(() => 'path')

    render(<ExploreGuides />)

    fireEvent.click(screen.getByTestId('guide-button-sq-intro'))

    expect(pushMock).toHaveBeenCalledWith({
      search: 'path=tutorials/path',
    })
  })

  it('should call proper history push after click on guide with tutorial', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })
    ;(findTutorialPath as jest.Mock).mockImplementation(() => 'path')

    render(<ExploreGuides />)

    fireEvent.click(screen.getByTestId('guide-button-ds-json-intro'))

    expect(pushMock).toHaveBeenCalledWith({
      search: 'path=tutorials/path',
    })
  })

  it('should call proper telemetry event after click on guide', () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    render(<ExploreGuides />)

    fireEvent.click(screen.getByTestId('guide-button-sq-intro'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_PANEL_OPENED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
        tutorialId: 'sq-intro',
        provider: 'REDIS_CLOUD',
        source: 'empty browser',
      },
    })
  })
})
