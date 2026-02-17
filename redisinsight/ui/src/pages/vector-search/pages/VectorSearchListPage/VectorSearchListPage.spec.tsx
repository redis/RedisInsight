import React from 'react'
import {
  cleanup,
  initialStateDefault,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { RootState } from 'uiSrc/slices/store'
import {
  INSTANCE_ID_MOCK,
  INSTANCES_MOCK,
} from 'uiSrc/mocks/handlers/instances/instancesHandlers'

import { mockIndexListData } from 'uiSrc/mocks/factories/vector-search/indexList.factory'

import { VectorSearchListPage } from './VectorSearchListPage'

jest.mock('../../hooks/useIndexListData', () => ({
  useIndexListData: jest.fn(() => ({
    data: mockIndexListData,
    loading: false,
  })),
}))

jest.mock('../../context/vector-search', () => ({
  useVectorSearch: jest.fn(() => ({
    openPickSampleDataModal: jest.fn(),
  })),
}))

const mockHistoryPush = jest.fn()
const mockInstanceId = INSTANCE_ID_MOCK
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
  useParams: () => ({
    instanceId: mockInstanceId,
  }),
}))

const getTestState = (): RootState => ({
  ...initialStateDefault,
  connections: {
    ...initialStateDefault.connections,
    instances: {
      ...initialStateDefault.connections.instances,
      connectedInstance: {
        ...initialStateDefault.connections.instances.connectedInstance,
        ...INSTANCES_MOCK[0],
      },
    },
  },
})

const renderComponent = () => {
  const store = mockStore(getTestState())
  return render(<VectorSearchListPage />, { store })
}

describe('VectorSearchListPage', () => {
  beforeEach(() => {
    cleanup()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render the page layout with header, title, info icon, create button, and table', () => {
    renderComponent()

    const page = screen.getByTestId('vector-search--list--page')
    expect(page).toBeInTheDocument()

    const header = screen.getByTestId('vector-search--list--header')
    expect(header).toBeInTheDocument()

    const title = screen.getByTestId('vector-search--list--title')
    expect(title).toBeInTheDocument()
    expect(screen.getByText('Search indexes')).toBeInTheDocument()

    const infoIcon = screen.getByTestId('vector-search--list--info-icon')
    expect(infoIcon).toBeInTheDocument()

    const btn = screen.getByTestId('vector-search--list--create-index-btn')
    expect(btn).toBeInTheDocument()
    expect(screen.getByText('+ Create search index')).toBeInTheDocument()

    const table = screen.getByTestId('vector-search--list--table')
    expect(table).toBeInTheDocument()
  })
})
