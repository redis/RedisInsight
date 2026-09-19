import React from 'react'
import { useFormik } from 'formik'
import { cleanup, render, screen, userEvent } from 'uiSrc/utils/test-utils'
import { dbConnectionInfoFactory } from 'uiSrc/mocks/factories/database/DbConnectionInfo.factory'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { connectedInstanceInfoSelector } from 'uiSrc/slices/instances/instances'
import DbIndex from './DbIndex'

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceInfoSelector: jest.fn(),
}))

const renderComponent = (values: Partial<DbConnectionInfo> = {}) => {
  const formikValues = {
    ...dbConnectionInfoFactory.build(),
    showDb: true,
    db: 0,
    ...values,
  }

  const TestWrapper = () => {
    const formik = useFormik<DbConnectionInfo>({
      initialValues: formikValues as DbConnectionInfo,
      onSubmit: jest.fn(),
    })

    return <DbIndex formik={formik} />
  }

  return render(<TestWrapper />)
}

describe('DbIndex', () => {
  beforeEach(() => {
    cleanup()
    ;(connectedInstanceInfoSelector as unknown as jest.Mock).mockReturnValue({
      databases: 16,
    })
  })

  it('renders the logical database checkbox', () => {
    renderComponent({ showDb: false })

    expect(screen.getByTestId('showDb')).toBeInTheDocument()
    expect(screen.getByText('Select Logical Database')).toBeInTheDocument()
  })

  it('hides the picker until the checkbox is ticked', () => {
    renderComponent({ showDb: false })

    expect(screen.queryByTestId('db')).not.toBeInTheDocument()
  })

  it('renders a picker instead of a free-form index input', () => {
    renderComponent({ showDb: true, db: 0 })

    const picker = screen.getByTestId('db')

    expect(picker).toBeInTheDocument()
    // the old implementation was a numeric input, which accepted indexes the
    // instance does not have
    expect(picker.tagName).not.toBe('INPUT')
    expect(picker).toHaveTextContent('db0')
  })

  it('offers one option per logical database reported by the connection', async () => {
    ;(connectedInstanceInfoSelector as unknown as jest.Mock).mockReturnValue({
      databases: 4,
    })
    renderComponent({ showDb: true, db: 0 })

    await userEvent.click(screen.getByRole('combobox'))

    expect(screen.getAllByText('db0').length).toBeGreaterThan(0)
    expect(screen.getByText('db3')).toBeInTheDocument()
    expect(screen.queryByText('db4')).not.toBeInTheDocument()
  })

  it('falls back to the Redis default of 16 databases before a test connection', async () => {
    ;(connectedInstanceInfoSelector as unknown as jest.Mock).mockReturnValue({
      databases: undefined,
    })
    renderComponent({ showDb: true, db: 0 })

    await userEvent.click(screen.getByRole('combobox'))

    expect(screen.getByText('db15')).toBeInTheDocument()
    expect(screen.queryByText('db16')).not.toBeInTheDocument()
  })
})
