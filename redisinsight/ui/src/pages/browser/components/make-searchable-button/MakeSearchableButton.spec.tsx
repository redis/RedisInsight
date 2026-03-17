import React from 'react'
import { useSelector } from 'react-redux'
import { faker } from '@faker-js/faker'
import { render, screen, userEvent, cleanup } from 'uiSrc/utils/test-utils'
import { KeyTypes } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'

import { MakeSearchableButton } from './MakeSearchableButton'
import { MakeSearchableButtonProps } from './MakeSearchableButton.types'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/pages/browser/components/make-searchable-modal', () => ({
  useMakeSearchableModal: () => ({
    openMakeSearchableModal: jest.fn(),
  }),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn(),
}))

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}))

const mockInstanceId = faker.string.uuid()

const defaultProps: MakeSearchableButtonProps = {
  keyName: { data: [116, 101, 115, 116], type: 'Buffer' },
  keyNameString: 'product:123',
  keyType: KeyTypes.Hash,
}

const renderComponent = (propsOverride?: Partial<MakeSearchableButtonProps>) => {
  const props = { ...defaultProps, ...propsOverride }
  return render(<MakeSearchableButton {...props} />)
}

describe('MakeSearchableButton', () => {
  beforeEach(() => {
    cleanup()
    ;(useSelector as jest.Mock).mockImplementation((selector: any) => {
      if (selector === connectedInstanceSelector) {
        return { id: mockInstanceId }
      }
      return {}
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render the button', () => {
    renderComponent()

    expect(screen.getByTestId('make-searchable-btn')).toBeInTheDocument()
    expect(screen.getByTestId('make-searchable-btn')).toHaveTextContent('Make searchable')
  })

  it('should send SEARCH_MAKE_SEARCHABLE_CLICKED telemetry on click', async () => {
    renderComponent()

    await userEvent.click(screen.getByTestId('make-searchable-btn'))

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_MAKE_SEARCHABLE_CLICKED,
      eventData: { databaseId: mockInstanceId, keyType: KeyTypes.Hash },
    })
  })
})
