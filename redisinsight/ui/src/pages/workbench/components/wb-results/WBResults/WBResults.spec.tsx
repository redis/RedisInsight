import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { CommandExecutionUI } from 'uiSrc/slices/interfaces'
import { cleanup, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import WBResults, { Props } from './WBResults'
import {
  ViewMode,
  ViewModeContextProvider,
} from 'uiSrc/components/query/context/view-mode.context'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  sessionStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

const renderWBResultsComponent = (props: Partial<Props> = {}) => {
  return render(
    <ViewModeContextProvider initialViewMode={ViewMode.Workbench}>
      <WBResults {...instance(mockedProps)} {...props} />
    </ViewModeContextProvider>,
    {
      store,
    },
  )
}

describe('WBResults', () => {
  it('should render', () => {
    const { container } = renderWBResultsComponent()
    expect(container).toBeTruthy()
  })

  it('should render NoResults component with empty items', () => {
    const { getByTestId } = renderWBResultsComponent({
      items: [],
      isResultsLoaded: true,
    })

    expect(getByTestId('wb_no-results')).toBeInTheDocument()
  })

  it('should not render NoResults component with empty items and loading state', () => {
    renderWBResultsComponent({
      items: [],
      isResultsLoaded: false,
    })

    expect(screen.queryByTestId('wb_no-results')).not.toBeInTheDocument()
  })

  it('should render with custom props', () => {
    renderWBResultsComponent({
      ...instance(mockedProps),
      items: [],
      isResultsLoaded: false,
    })
  })

  it('should render with custom props', () => {
    const itemsMock: CommandExecutionUI[] = [
      {
        id: '1',
        command: 'query1',
        result: [
          {
            response: 'data1',
            status: CommandExecutionStatus.Success,
          },
        ],
      },
      {
        id: '2',
        command: 'query2',
        result: [
          {
            response: 'data2',
            status: CommandExecutionStatus.Success,
          },
        ],
      },
    ]

    const { container } = renderWBResultsComponent({
      ...instance(mockedProps),
      items: itemsMock,
      isResultsLoaded: true,
    })

    expect(container).toBeTruthy()
  })
})
