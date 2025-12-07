import React from 'react'
import { cloneDeep } from 'lodash'
import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { RdiListColumn } from 'uiSrc/constants'
import { instancesSelector, setShownColumns } from 'uiSrc/slices/rdi/instances'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { rdiInstanceFactory } from 'uiSrc/mocks/rdi/RdiInstance.factory'
import RdiHeader from './RdiHeader'

jest.mock('uiSrc/slices/rdi/instances', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/instances'),
  instancesSelector: jest.fn(),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
  ;(instancesSelector as jest.Mock).mockReturnValue({
    loading: false,
    shownColumns: [
      RdiListColumn.Name,
      RdiListColumn.Url,
      RdiListColumn.Controls,
    ],
    data: rdiInstanceFactory.buildList(1),
  })
})

describe('RdiHeader', () => {
  it('should render', () => {
    expect(render(<RdiHeader onRdiInstanceClick={() => {}} />)).toBeTruthy()
  })

  it('should show checkboxes with correct checked state when columns config button is clicked', async () => {
    render(<RdiHeader onRdiInstanceClick={() => {}} />)

    fireEvent.click(screen.getByTestId('btn-columns-config'))

    const popover = await screen.findByTestId('columns-config-popover')
    expect(popover).toBeInTheDocument()

    const shown = [
      RdiListColumn.Name,
      RdiListColumn.Url,
      RdiListColumn.Controls,
    ]
    shown.forEach((column) => {
      const checkbox = screen.getByTestId(`show-${column}`)
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).toBeChecked()
    })

    const hidden = [RdiListColumn.Version, RdiListColumn.LastConnection]
    hidden.forEach((column) => {
      const checkbox = screen.getByTestId(`show-${column}`)
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).not.toBeChecked()
    })
  })

  it('should dispatch setShownColumns action when checkbox clicked', async () => {
    render(<RdiHeader onRdiInstanceClick={() => {}} />)
    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('btn-columns-config'))

    const popover = await screen.findByTestId('columns-config-popover')
    expect(popover).toBeInTheDocument()

    const checkbox = screen.getByTestId('show-name')
    expect(checkbox).toBeInTheDocument()

    fireEvent.click(checkbox)

    const expectedActions = [
      setShownColumns([RdiListColumn.Url, RdiListColumn.Controls]),
    ]
    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      ...expectedActions,
    ])
  })

  it('should log telemetry event when columns config changed', async () => {
    const sendEventTelemetryMock = sendEventTelemetry as jest.Mock

    render(<RdiHeader onRdiInstanceClick={() => {}} />)

    fireEvent.click(screen.getByTestId('btn-columns-config'))

    const popover = await screen.findByTestId('columns-config-popover')
    expect(popover).toBeInTheDocument()

    // clicking this checkbox will hide the column
    const checkbox = screen.getByTestId('show-url')
    expect(checkbox).toBeInTheDocument()
    fireEvent.click(checkbox)

    expect(sendEventTelemetryMock).toBeCalledWith({
      event: TelemetryEvent.RDI_INSTANCE_LIST_COLUMNS_CLICKED,
      eventData: {
        shown: [],
        hidden: [RdiListColumn.Url],
      },
    })
  })
})
