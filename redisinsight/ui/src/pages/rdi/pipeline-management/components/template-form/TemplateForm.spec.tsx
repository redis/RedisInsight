import React from 'react'
import { cloneDeep } from 'lodash'
import { instance, mock } from 'ts-mockito'

import {
  act,
  cleanup,
  expectActionsToContain,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import {
  getPipelineStrategies,
  rdiPipelineStrategiesSelector,
} from 'uiSrc/slices/rdi/pipeline'
import { RdiPipelineTabs } from 'uiSrc/slices/interfaces'
import { INGEST_OPTION, NO_TEMPLATE_LABEL } from './constants'
import TemplateForm, { Props } from './TemplateForm'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendPageViewTelemetry: jest.fn(),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineStrategiesSelector: jest.fn().mockReturnValue({
    loading: false,
    data: [],
  }),
}))

describe('TemplateForm', () => {
  it('should render', () => {
    expect(render(<TemplateForm {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should call closePopover', async () => {
    const mockClosePopover = jest.fn()

    render(
      <TemplateForm
        {...instance(mockedProps)}
        closePopover={mockClosePopover}
      />,
    )

    fireEvent.click(screen.getByTestId('template-cancel-btn'))

    expect(mockClosePopover).toHaveBeenCalled()
  })

  it('should fetch rdi strategies on initial', async () => {
    await act(async () => {
      render(<TemplateForm {...instance(mockedProps)} />)
    })

    const expectedActions = [getPipelineStrategies()]

    expectActionsToContain(store.getActions(), expectedActions)
  })

  it('apply btn should be disabled if there is any value', () => {
    render(<TemplateForm {...instance(mockedProps)} value="some value" />)

    expect(screen.getByTestId('template-apply-btn')).toBeDisabled()
  })

  it('apply btn should be disabled if there is any value', () => {
    render(<TemplateForm {...instance(mockedProps)} value="some value" />)

    expect(screen.getByTestId('template-apply-btn')).toBeDisabled()
  })

  it('should display db type select when source is "config"', () => {
    render(
      <TemplateForm
        {...instance(mockedProps)}
        source={RdiPipelineTabs.Config}
      />,
    )

    expect(screen.getByTestId('db-type-select')).toBeInTheDocument()
  })

  it('should not render db type select when source is "jobs"', () => {
    render(
      <TemplateForm {...instance(mockedProps)} source={RdiPipelineTabs.Jobs} />,
    )

    const dbTypeSelect = screen.queryByTestId('db-type-select')

    expect(dbTypeSelect).toBeNull()
  })

  it('should select "No template" value', () => {
    render(
      <TemplateForm
        {...instance(mockedProps)}
        source={RdiPipelineTabs.Config}
      />,
    )

    expect(screen.getByTestId('db-type-select')).toHaveTextContent(
      NO_TEMPLATE_LABEL,
    )
  })

  it('should select ingest option and first db option', async () => {
    ;(rdiPipelineStrategiesSelector as jest.Mock).mockImplementation(() => ({
      loading: false,
      data: [
        {
          strategy: 'any',
          databases: ['any'],
        },
        {
          strategy: INGEST_OPTION,
          databases: ['first_db_option', 'second_db_option'],
        },
      ],
    }))

    await act(() =>
      render(
        <TemplateForm
          {...instance(mockedProps)}
          source={RdiPipelineTabs.Config}
        />,
      ),
    )

    expect(screen.getByTestId('pipeline-type-select')).toHaveTextContent(
      INGEST_OPTION,
    )
    expect(screen.getByTestId('db-type-select')).toHaveTextContent(
      'first_db_option',
    )
  })

  it('should select first db and pipeline options', async () => {
    ;(rdiPipelineStrategiesSelector as jest.Mock).mockImplementation(() => ({
      loading: false,
      data: [
        {
          strategy: 'foo',
          databases: ['any'],
        },
        {
          strategy: 'bar',
          databases: ['first_db_option', 'second_db_option'],
        },
      ],
    }))

    await act(() =>
      render(
        <TemplateForm
          {...instance(mockedProps)}
          source={RdiPipelineTabs.Config}
        />,
      ),
    )

    expect(screen.getByTestId('pipeline-type-select')).toHaveTextContent('foo')
    expect(screen.getByTestId('db-type-select')).toHaveTextContent('any')
  })
})
