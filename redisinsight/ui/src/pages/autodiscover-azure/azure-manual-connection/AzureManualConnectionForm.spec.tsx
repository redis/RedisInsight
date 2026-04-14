import React from 'react'
import { useFormik } from 'formik'
import { fireEvent, render, screen, waitFor } from 'uiSrc/utils/test-utils'

import AzureManualConnectionForm, {
  AzureManualConnectionFormValues,
  Props,
} from './AzureManualConnectionForm'

const FormWrapper = (
  props: Partial<Props> & {
    initialValues?: Partial<AzureManualConnectionFormValues>
  },
) => {
  const { initialValues, ...rest } = props

  const formik = useFormik<AzureManualConnectionFormValues>({
    initialValues: {
      host: '',
      port: '6380',
      name: '',
      username: 'test@example.com',
      timeout: '30',
      verifyServerCert: true,
      sni: false,
      servername: '',
      ...initialValues,
    },
    onSubmit: jest.fn(),
  })

  return <AzureManualConnectionForm formik={formik} {...rest} />
}

describe('AzureManualConnectionForm', () => {
  const renderComponent = (
    props?: Partial<Props> & {
      initialValues?: Partial<AzureManualConnectionFormValues>
    },
  ) => render(<FormWrapper {...props} />)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(renderComponent()).toBeTruthy()
  })

  it('should render form with data-testid', () => {
    renderComponent()
    expect(screen.getByTestId('azure-manual-form')).toBeInTheDocument()
  })

  describe('Database alias field', () => {
    it('should render database alias input', () => {
      renderComponent()
      expect(screen.getByTestId('name')).toBeInTheDocument()
    })

    it('should display initial value', () => {
      renderComponent({ initialValues: { name: 'My Azure Redis' } })
      expect(screen.getByTestId('name')).toHaveValue('My Azure Redis')
    })
  })

  describe('Host field', () => {
    it('should render host input', () => {
      renderComponent()
      expect(screen.getByTestId('host')).toBeInTheDocument()
    })

    it('should display initial value', () => {
      renderComponent({
        initialValues: { host: 'myredis.redis.cache.windows.net' },
      })
      expect(screen.getByTestId('host')).toHaveValue(
        'myredis.redis.cache.windows.net',
      )
    })
  })

  describe('Port field', () => {
    it('should render port input', () => {
      renderComponent()
      expect(screen.getByTestId('port')).toBeInTheDocument()
    })

    it('should default to 6380 for Azure', () => {
      renderComponent()
      expect(screen.getByTestId('port')).toHaveValue('6380')
    })
  })

  describe('Username field', () => {
    it('should render disabled username input', () => {
      renderComponent()
      const usernameInput = screen.getByTestId('username')
      expect(usernameInput).toBeInTheDocument()
      expect(usernameInput).toBeDisabled()
    })

    it('should display Entra ID authentication message', () => {
      renderComponent()
      expect(
        screen.getByText(
          'Authentication will use your Azure Entra ID credentials',
        ),
      ).toBeInTheDocument()
    })
  })

  describe('TLS Settings', () => {
    it('should render TLS Settings section', () => {
      renderComponent()
      expect(screen.getByText('TLS Settings')).toBeInTheDocument()
    })

    it('should show TLS is always enabled message', () => {
      renderComponent()
      expect(
        screen.getByText(
          'TLS is always enabled for Azure Cache for Redis connections.',
        ),
      ).toBeInTheDocument()
    })

    it('should render verify server certificate checkbox', () => {
      renderComponent()
      expect(screen.getByTestId('verify-server-cert')).toBeInTheDocument()
    })

    it('should have verify server certificate checked by default', () => {
      renderComponent()
      expect(screen.getByTestId('verify-server-cert')).toBeChecked()
    })
  })

  describe('SNI Settings', () => {
    it('should render SNI checkbox', () => {
      renderComponent()
      expect(screen.getByTestId('sni')).toBeInTheDocument()
    })

    it('should not show servername field when SNI is disabled', () => {
      renderComponent({ initialValues: { sni: false } })
      expect(screen.queryByTestId('sni-servername')).not.toBeInTheDocument()
    })

    it('should show servername field when SNI is enabled', () => {
      renderComponent({ initialValues: { sni: true } })
      expect(screen.getByTestId('sni-servername')).toBeInTheDocument()
    })

    it('should toggle servername field visibility on SNI checkbox change', async () => {
      renderComponent()

      expect(screen.queryByTestId('sni-servername')).not.toBeInTheDocument()

      fireEvent.click(screen.getByTestId('sni'))

      await waitFor(() => {
        expect(screen.getByTestId('sni-servername')).toBeInTheDocument()
      })
    })
  })
})
