import React from 'react'
import { instance, mock } from 'ts-mockito'
import { useFormik } from 'formik'
import { cleanup, render, screen, fireEvent, act } from 'uiSrc/utils/test-utils'
import { SECURITY_FIELD } from 'uiSrc/constants/securityField'
import { dbConnectionInfoFactory } from 'uiSrc/mocks/factories/database/DbConnectionInfo.factory'
import DatabaseForm, { Props } from './DatabaseForm'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/app/info', () => ({
  appInfoSelector: jest.fn().mockReturnValue({
    server: {
      buildType: 'DOCKER_ON_PREMISE',
    },
  }),
}))

const TestWrapper = ({
  formikValues,
  ...props
}: Partial<Props> & { formikValues?: DbConnectionInfo }) => {
  const defaultFormikValues = formikValues || dbConnectionInfoFactory.build()
  const formik = useFormik({
    initialValues: defaultFormikValues,
    onSubmit: jest.fn(),
  })

  return (
    <DatabaseForm
      {...instance(mockedProps)}
      formik={formik}
      showFields={{ alias: true, host: true, port: true, timeout: true }}
      onHostNamePaste={jest.fn()}
      {...props}
    />
  )
}

const renderComponent = (
  props?: Partial<Props>,
  formikValues?: DbConnectionInfo,
) => {
  return render(<TestWrapper {...props} formikValues={formikValues} />)
}

describe('DatabaseForm', () => {
  beforeEach(() => {
    cleanup()
  })

  it('should render', () => {
    const { container } = renderComponent()
    expect(container).toBeTruthy()
  })

  it('should render all fields when showFields is true', () => {
    renderComponent()

    expect(screen.getByTestId('name')).toBeInTheDocument()
    expect(screen.getByTestId('host')).toBeInTheDocument()
    expect(screen.getByTestId('port')).toBeInTheDocument()
    expect(screen.getByTestId('username')).toBeInTheDocument()
    expect(screen.getByTestId('password')).toBeInTheDocument()
    expect(screen.getByTestId('timeout')).toBeInTheDocument()
  })

  it('should hide fields when showFields is false', () => {
    renderComponent({
      showFields: { alias: false, host: false, port: false, timeout: false },
    })

    expect(screen.queryByTestId('name')).not.toBeInTheDocument()
    expect(screen.queryByTestId('host')).not.toBeInTheDocument()
    expect(screen.queryByTestId('port')).not.toBeInTheDocument()
    expect(screen.queryByTestId('timeout')).not.toBeInTheDocument()
    // username and password always show
    expect(screen.getByTestId('username')).toBeInTheDocument()
    expect(screen.getByTestId('password')).toBeInTheDocument()
  })

  it('should display initial values correctly', () => {
    const mockData = dbConnectionInfoFactory.build({
      name: 'Test Database',
      host: 'localhost',
      port: '6379',
      username: 'testuser',
      password: 'testpass',
      timeout: '30',
    })

    renderComponent({}, mockData)

    expect(screen.getByDisplayValue('Test Database')).toBeInTheDocument()
    expect(screen.getByDisplayValue('localhost')).toBeInTheDocument()
    expect(screen.getByDisplayValue('6379')).toBeInTheDocument()
    expect(screen.getByDisplayValue('testuser')).toBeInTheDocument()
    expect(screen.getByDisplayValue('testpass')).toBeInTheDocument()
    expect(screen.getByDisplayValue('30')).toBeInTheDocument()
  })

  it('should update input values when changed', async () => {
    renderComponent()

    const nameInput = screen.getByTestId('name')
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'New Database Name' } })
    })
    expect(nameInput).toHaveValue('New Database Name')

    const hostInput = screen.getByTestId('host')
    await act(async () => {
      fireEvent.change(hostInput, { target: { value: '192.168.1.1' } })
    })
    expect(hostInput).toHaveValue('192.168.1.1')

    const portInput = screen.getByTestId('port')
    await act(async () => {
      fireEvent.change(portInput, { target: { value: '6380' } })
    })
    expect(portInput).toHaveValue('6380')

    const usernameInput = screen.getByTestId('username')
    await act(async () => {
      fireEvent.change(usernameInput, { target: { value: 'newuser' } })
    })
    expect(usernameInput).toHaveValue('newuser')

    const passwordInput = screen.getByTestId('password')
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'newpassword' } })
    })
    expect(passwordInput).toHaveValue('newpassword')
  })

  it('should disable fields when in readyOnlyFields', () => {
    renderComponent({ readyOnlyFields: ['alias', 'host', 'port'] })

    expect(screen.getByTestId('name')).toBeDisabled()
    expect(screen.getByTestId('host')).toBeDisabled()
    expect(screen.getByTestId('port')).toBeDisabled()
    expect(screen.getByTestId('username')).not.toBeDisabled()
  })

  it('should display SECURITY_FIELD when password is true', () => {
    const securityFieldData = dbConnectionInfoFactory.build({ password: true })
    renderComponent({}, securityFieldData)

    expect(screen.getByDisplayValue(SECURITY_FIELD)).toBeInTheDocument()
  })

  // TODO [DA]: this test should be changed as part of RI-7330 as this is not the expected behavior
  it('should clear password field when focused and value shown', async () => {
    const securityFieldData = dbConnectionInfoFactory.build({ password: true })
    renderComponent({}, securityFieldData)

    const passwordInput = screen.getByTestId('password')
    expect(passwordInput).toHaveValue(SECURITY_FIELD)

    await act(async () => {
      fireEvent.focus(passwordInput)
    })

    expect(passwordInput).toHaveValue('')
  })

  it('should set autoFocus on host field when autoFocus is true', () => {
    renderComponent({ autoFocus: true })

    const hostInput = screen.getByTestId('host')
    expect(hostInput).toEqual(document.activeElement)
  })

  it('should call onHostNamePaste when pasting into host field', () => {
    const mockOnHostNamePaste = jest.fn()
    renderComponent({ onHostNamePaste: mockOnHostNamePaste })

    const hostInput = screen.getByTestId('host')
    const pasteEvent = {
      clipboardData: {
        getData: jest.fn().mockReturnValue('redis://localhost:6379'),
      },
      preventDefault: jest.fn(),
    }

    fireEvent.paste(hostInput, pasteEvent)
    expect(mockOnHostNamePaste).toHaveBeenCalled()
  })

  it('should render with correct field labels', () => {
    renderComponent()

    expect(screen.getByText('Database Alias*')).toBeInTheDocument()
    expect(screen.getByText('Host*')).toBeInTheDocument()
    expect(screen.getByText('Port*')).toBeInTheDocument()
    expect(screen.getByText('Username')).toBeInTheDocument()
    expect(screen.getByText('Password')).toBeInTheDocument()
    expect(screen.getByText('Timeout (s)')).toBeInTheDocument()
  })

  it('should render with correct maxLength attributes', () => {
    renderComponent()

    expect(screen.getByTestId('name')).toHaveAttribute('maxLength', '500')
    expect(screen.getByTestId('host')).toHaveAttribute('maxLength', '200')
    expect(screen.getByTestId('username')).toHaveAttribute('maxLength', '200')
    expect(screen.getByTestId('password')).toHaveAttribute('maxLength', '10000')
  })
})
