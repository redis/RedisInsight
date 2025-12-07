import { useFormikContext } from 'formik'
import { cloneDeep } from 'lodash'
import React from 'react'

import { MOCK_RDI_PIPELINE_DATA } from 'uiSrc/mocks/data/rdi'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import { setConfigValidationErrors } from 'uiSrc/slices/rdi/pipeline'
import RdiPipelineHeader from './RdiPipelineHeader'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineStatusSelector: jest.fn().mockReturnValue({
    loading: false,
    data: {},
    error: '',
  }),
}))

jest.mock('formik')

const mockHandleSubmit = jest.fn()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('RdiPipelineHeader', () => {
  beforeEach(() => {
    const mockUseFormikContext = {
      handleSubmit: mockHandleSubmit,
      values: MOCK_RDI_PIPELINE_DATA,
    }
    ;(useFormikContext as jest.Mock).mockReturnValue(mockUseFormikContext)
  })

  it('should render', () => {
    expect(render(<RdiPipelineHeader />)).toBeTruthy()
  })

  it('should call proper actions', () => {
    render(<RdiPipelineHeader />)

    const expectedActions = [
      setConfigValidationErrors(['Error: unknown error']),
    ]

    expect(store.getActions().slice(0, expectedActions.length)).toEqual(
      expectedActions,
    )
  })
})
