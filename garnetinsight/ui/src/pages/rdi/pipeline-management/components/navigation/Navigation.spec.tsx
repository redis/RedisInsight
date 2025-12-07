import React from 'react'
import reactRouterDom from 'react-router-dom'
import { cloneDeep } from 'lodash'
import {
  render,
  screen,
  fireEvent,
  mockedStore,
  cleanup,
  initialStateDefault,
} from 'uiSrc/utils/test-utils'

import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { RdiPipelineTabs } from 'uiSrc/slices/interfaces'
import Navigation from './Navigation'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn,
  }),
}))

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useFormikContext: jest.fn().mockReturnValue({
    values: {
      config: 'value',
      jobs: [
        { name: 'job1', value: 'value' },
        { name: 'job2', value: 'value' },
      ],
    },
  }),
}))

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn(),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
  ;(rdiPipelineSelector as jest.Mock).mockReturnValue(
    initialStateDefault.rdi.pipeline,
  )
})

describe('Navigation', () => {
  it('should render', () => {
    expect(render(<Navigation />)).toBeTruthy()
  })

  it('should not show nav when pipeline is loading', () => {
    render(<Navigation />)

    expect(
      screen.queryByTestId(`rdi-nav-btn-${RdiPipelineTabs.Config}`),
    ).not.toBeInTheDocument()
  })

  it('should show nav when pipeline is not loading', () => {
    ;(rdiPipelineSelector as jest.Mock).mockReturnValue({
      ...initialStateDefault.rdi.pipeline,
      loading: false,
    })

    render(<Navigation />)

    expect(
      screen.queryByTestId(`rdi-nav-btn-${RdiPipelineTabs.Config}`),
    ).toBeInTheDocument()
  })

  it('should call proper history push after click on tabs', () => {
    ;(rdiPipelineSelector as jest.Mock).mockReturnValue({
      ...initialStateDefault.rdi.pipeline,
      loading: false,
    })

    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<Navigation />)

    fireEvent.click(screen.getByTestId('rdi-nav-btn-config'))
    expect(pushMock).toBeCalledWith(
      '/integrate/rdiInstanceId/pipeline-management/config',
    )
  })
})
