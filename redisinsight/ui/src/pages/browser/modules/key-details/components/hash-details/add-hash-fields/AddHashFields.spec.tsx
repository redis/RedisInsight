import React from 'react'
import { instance, mock } from 'ts-mockito'
import { Environment } from 'apiClient'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import * as useDatabaseEnvironmentModule from 'uiSrc/components/hooks/useDatabaseEnvironment'
import { ProductionWriteConfirmationProvider } from 'uiSrc/components/production-write-confirmation'
import AddHashFields, { Props } from './AddHashFields'

const mockEnvironment = (environment: Environment) => {
  jest
    .spyOn(useDatabaseEnvironmentModule, 'useDatabaseEnvironment')
    .mockReturnValue({
      environment,
      isDangerousCommand: () => false,
    })
}

const renderWithProvider = (ui: React.ReactElement) =>
  render(
    <ProductionWriteConfirmationProvider>
      {ui}
    </ProductionWriteConfirmationProvider>,
  )

const HASH_FIELD = 'hash-field'
const HASH_VALUE = 'hash-value'

const mockedProps = mock<Props>()

describe('AddHashFields', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockEnvironment(Environment.Unspecified)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should render', () => {
    expect(render(<AddHashFields {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should set field name properly', () => {
    render(<AddHashFields {...instance(mockedProps)} />)
    const fieldName = screen.getByTestId(HASH_FIELD)
    fireEvent.change(fieldName, { target: { value: 'field name' } })
    expect(fieldName).toHaveValue('field name')
  })

  it('should set field value properly', () => {
    render(<AddHashFields {...instance(mockedProps)} />)
    const fieldName = screen.getByTestId(HASH_VALUE)
    fireEvent.change(fieldName, { target: { value: '123' } })
    expect(fieldName).toHaveValue('123')
  })

  it('should render add button', () => {
    render(<AddHashFields {...instance(mockedProps)} />)
    expect(screen.getByTestId('add-item')).toBeTruthy()
  })

  it('should render one more field name & value inputs after click add item', () => {
    render(<AddHashFields {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('add-item'))

    expect(screen.getAllByTestId(HASH_FIELD)).toHaveLength(2)
    expect(screen.getAllByTestId(HASH_VALUE)).toHaveLength(2)
  })

  it('should clear fieldName & fieldValue after click clear button', () => {
    render(<AddHashFields {...instance(mockedProps)} />)
    const fieldName = screen.getByTestId(HASH_FIELD)
    const fieldValue = screen.getByTestId(HASH_VALUE)
    fireEvent.change(fieldName, { target: { value: 'name' } })
    fireEvent.change(fieldValue, { target: { value: 'val' } })
    fireEvent.click(screen.getByTestId('remove-item'))

    expect(fieldName).toHaveValue('')
    expect(fieldValue).toHaveValue('')
  })

  describe('environment gating', () => {
    it('shows production confirmation when saving in Production', () => {
      mockEnvironment(Environment.Production)
      renderWithProvider(<AddHashFields {...instance(mockedProps)} />)

      fireEvent.click(screen.getByTestId('save-fields-btn'))

      expect(
        screen.getByTestId('type-to-confirm-modal-input'),
      ).toBeInTheDocument()
    })

    it('does not show confirmation in Development', () => {
      mockEnvironment(Environment.Development)
      renderWithProvider(<AddHashFields {...instance(mockedProps)} />)

      fireEvent.click(screen.getByTestId('save-fields-btn'))

      expect(
        screen.queryByTestId('type-to-confirm-modal-input'),
      ).not.toBeInTheDocument()
    })

    it('does not show confirmation in Unspecified', () => {
      mockEnvironment(Environment.Unspecified)
      renderWithProvider(<AddHashFields {...instance(mockedProps)} />)

      fireEvent.click(screen.getByTestId('save-fields-btn'))

      expect(
        screen.queryByTestId('type-to-confirm-modal-input'),
      ).not.toBeInTheDocument()
    })
  })
})
