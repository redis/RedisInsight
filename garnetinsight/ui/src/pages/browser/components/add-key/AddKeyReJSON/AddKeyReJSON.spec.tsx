import React from 'react'
import { instance, mock } from 'ts-mockito'

import {
  fireEvent,
  userEvent,
  render,
  screen,
  waitFor,
} from 'uiSrc/utils/test-utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import AddKeyReJSON, { Props } from './AddKeyReJSON'
import AddKeyFooter from '../AddKeyFooter/AddKeyFooter'

const mockedProps = mock<Props>()

jest.mock('../AddKeyFooter/AddKeyFooter', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const MockAddKeyFooter = (props: any) => <div {...props} />

describe('AddKeyReJSON', () => {
  beforeAll(() => {
    AddKeyFooter.mockImplementation(MockAddKeyFooter)
  })

  it('should render', () => {
    expect(render(<AddKeyReJSON {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should set value properly', () => {
    render(<AddKeyReJSON {...instance(mockedProps)} />)
    const valueArea = screen.getByTestId('json-value')
    fireEvent.change(valueArea, { target: { value: '{}' } })
    expect(valueArea).toHaveValue('{}')
  })

  it('should render add key button', () => {
    render(<AddKeyReJSON {...instance(mockedProps)} />)
    expect(screen.getByTestId('add-key-json-btn')).toBeTruthy()
  })

  it('should render add button disabled with wrong json', () => {
    render(<AddKeyReJSON {...instance(mockedProps)} keyName="name" />)
    const valueArea = screen.getByTestId('json-value')
    fireEvent.change(valueArea, { target: { value: '{"12' } })
    expect(screen.getByTestId('add-key-json-btn')).toBeDisabled()
  })

  it('should render add button not disabled', () => {
    render(<AddKeyReJSON {...instance(mockedProps)} keyName="name" />)
    const valueArea = screen.getByTestId('json-value')
    fireEvent.change(valueArea, { target: { value: '{}' } })
    expect(screen.getByTestId('add-key-json-btn')).not.toBeDisabled()
  })

  it('should call proper telemetry events after click Upload', () => {
    const sendEventTelemetryMock = jest.fn()
    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    render(<AddKeyReJSON {...instance(mockedProps)} />)

    fireEvent.click(screen.getByTestId('upload-input-file'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.BROWSER_JSON_VALUE_IMPORT_CLICKED,
      eventData: {
        databaseId: 'instanceId',
      },
    })
  })

  it('should load file', async () => {
    render(<AddKeyReJSON {...instance(mockedProps)} keyName="name" />)

    const jsonString = JSON.stringify({ a: 12 })
    const blob = new Blob([jsonString])
    const file = new File([blob], 'empty.json', {
      type: 'application/JSON',
    })
    const fileInput = screen.getByTestId('upload-input-file')

    expect(fileInput).toHaveAttribute('accept', 'application/json, text/plain')

    await userEvent.upload(fileInput, file)

    await waitFor(() =>
      expect(screen.getByTestId('json-value')).toHaveValue('{"a":12}'),
    )
  })

  it('should set the value from json file', async () => {
    render(<AddKeyReJSON {...instance(mockedProps)} keyName="name" />)

    const jsonString = JSON.stringify({ a: 12 })
    const blob = new Blob([jsonString])
    const file = new File([blob], 'empty.json', {
      type: 'application/JSON',
    })
    const fileInput = screen.getByTestId('upload-input-file')

    expect(fileInput).toHaveAttribute('accept', 'application/json, text/plain')

    await userEvent.upload(fileInput, file)

    await waitFor(() =>
      expect(screen.getByTestId('json-value')).toHaveValue('{"a":12}'),
    )
  })

  it('should set the incorrect json value from json file', async () => {
    render(<AddKeyReJSON {...instance(mockedProps)} keyName="name" />)

    const jsonString = JSON.stringify('{ a: 12')
    const blob = new Blob([jsonString])
    const file = new File([blob], 'empty.json', {
      type: 'application/JSON',
    })
    const fileInput = screen.getByTestId('upload-input-file')

    await userEvent.upload(fileInput, file)

    await waitFor(() =>
      expect(screen.getByTestId('json-value')).toHaveValue('"{ a: 12"'),
    )
  })
})
