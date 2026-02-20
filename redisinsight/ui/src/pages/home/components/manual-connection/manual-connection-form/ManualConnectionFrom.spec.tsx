import React from 'react'
import { instance, mock } from 'ts-mockito'
import {
  act,
  fireEvent,
  render,
  screen,
  userEvent,
} from 'uiSrc/utils/test-utils'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { BuildType } from 'uiSrc/constants/env'
import { appRedirectionSelector } from 'uiSrc/slices/app/url-handling'
import { UrlHandlingActions } from 'uiSrc/slices/interfaces/urlHandling'
import { ADD_NEW_CA_CERT, SshPassType } from 'uiSrc/pages/home/constants'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'

import ManualConnectionForm, { Props } from './ManualConnectionForm'

const BTN_SUBMIT = 'btn-submit'
const NEW_CA_CERT = 'new-ca-cert'
const QA_CA_CERT = 'qa-ca-cert'
const RADIO_BTN_PRIVATE_KEY = '[for="privateKey"]'
const BTN_TEST_CONNECTION = 'btn-test-connection'

const mockedProps = mock<Props>()
const mockedDbConnectionInfo = mock<DbConnectionInfo>()

const formFields = {
  ...instance(mockedDbConnectionInfo),
  host: 'localhost',
  port: '6379',
  name: 'lala',
}

jest.mock('uiSrc/slices/instances/instances', () => ({
  checkConnectToInstanceAction: () => jest.fn,
  resetInstanceUpdateAction: () => jest.fn,
  changeInstanceAliasAction: () => jest.fn,
  setConnectedInstanceId: jest.fn,
}))

jest.mock('uiSrc/slices/app/url-handling', () => ({
  ...jest.requireActual('uiSrc/slices/app/url-handling'),
  appRedirectionSelector: jest.fn().mockReturnValue(() => ({ action: null })),
}))

describe('InstanceForm', () => {
  it('should render', () => {
    expect(
      render(
        <ManualConnectionForm
          {...instance(mockedProps)}
          formFields={formFields}
        />,
      ),
    ).toBeTruthy()
  })

  it('should render with ConnectionType.Sentinel', () => {
    expect(
      render(
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Sentinel,
          }}
        />,
      ),
    ).toBeTruthy()
  })

  it('should render with ConnectionType.Cluster', () => {
    expect(
      render(
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{ ...formFields, connectionType: ConnectionType.Cluster }}
        />,
      ),
    ).toBeTruthy()
  })

  it('should render tooltip with nodes', () => {
    expect(
      render(
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            nodes: [{ host: '1', port: 1 }],
            connectionType: ConnectionType.Cluster,
          }}
        />,
      ),
    ).toBeTruthy()
  })

  it('should render DatabaseForm', () => {
    expect(
      render(
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode={false}
          formFields={{
            ...formFields,
            tls: true,
            caCert: { id: '123' },
            host: '123',
            tlsClientAuthRequired: true,
            nodes: [{ host: '1', port: 1 }],
            connectionType: ConnectionType.Cluster,
          }}
        />,
      ),
    ).toBeTruthy()
  })

  it('should change sentinelMasterUsername input properly', async () => {
    const handleSubmit = jest.fn()
    const handleTestConnection = jest.fn()

    render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Sentinel,
          }}
          onSubmit={handleSubmit}
          onTestConnection={handleTestConnection}
        />
      </div>,
    )

    await act(async () => {
      fireEvent.change(screen.getByTestId('sentinel-mater-username'), {
        target: { value: 'user' },
      })
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    const testConnectionBtn = screen.getByTestId(BTN_TEST_CONNECTION)

    await act(async () => {
      fireEvent.click(testConnectionBtn)
    })
    expect(handleTestConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        sentinelMasterUsername: 'user',
      }),
    )

    await act(async () => {
      fireEvent.click(submitBtn)
    })
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        sentinelMasterUsername: 'user',
      }),
    )
  })

  it('should change port input properly', async () => {
    const handleSubmit = jest.fn()
    render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
          }}
          onSubmit={handleSubmit}
        />
      </div>,
    )

    await act(async () => {
      fireEvent.change(screen.getByTestId('port'), {
        target: { value: '123' },
      })
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    await act(async () => {
      fireEvent.click(submitBtn)
    })
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        port: 123,
      }),
    )
  })

  it('should change tls checkbox', async () => {
    const handleSubmit = jest.fn()
    const handleTestConnection = jest.fn()

    render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Cluster,
          }}
          onSubmit={handleSubmit}
          onTestConnection={handleTestConnection}
        />
      </div>,
    )

    fireEvent.mouseDown(screen.getByText('Security'))

    await act(async () => {
      fireEvent.click(screen.getByTestId('tls'))
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    const testConnectionBtn = screen.getByTestId(BTN_TEST_CONNECTION)

    await act(async () => {
      fireEvent.click(testConnectionBtn)
    })
    expect(handleTestConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        tls: true,
      }),
    )

    await act(async () => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        tls: true,
      }),
    )
  })

  it('should change Database Index checkbox', async () => {
    const handleSubmit = jest.fn()
    const handleTestConnection = jest.fn()
    render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
          }}
          onSubmit={handleSubmit}
          onTestConnection={handleTestConnection}
        />
      </div>,
    )
    await act(async () => {
      fireEvent.click(screen.getByTestId('showDb'))
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    const testConnectionBtn = screen.getByTestId(BTN_TEST_CONNECTION)
    await act(async () => {
      fireEvent.click(testConnectionBtn)
    })
    expect(handleTestConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        showDb: true,
      }),
    )
    await act(async () => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        showDb: true,
      }),
    )
  })

  it('should change db checkbox and value', async () => {
    const handleSubmit = jest.fn()
    const handleTestConnection = jest.fn()
    render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
          }}
          onSubmit={handleSubmit}
          onTestConnection={handleTestConnection}
        />
      </div>,
    )
    await act(async () => {
      fireEvent.click(screen.getByTestId('showDb'))
    })

    await act(async () => {
      fireEvent.change(screen.getByTestId('db'), {
        target: { value: '12' },
      })
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    const testConnectionBtn = screen.getByTestId(BTN_TEST_CONNECTION)

    await act(async () => {
      fireEvent.click(testConnectionBtn)
    })
    expect(handleTestConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        showDb: true,
        db: 12,
      }),
    )
    await act(async () => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        showDb: true,
        db: 12,
      }),
    )
  })

  it('should change "Use SNI" with prepopulated with host', async () => {
    const handleSubmit = jest.fn()
    const handleTestConnection = jest.fn()
    render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            tls: true,
            connectionType: ConnectionType.Cluster,
          }}
          onSubmit={handleSubmit}
          onTestConnection={handleTestConnection}
        />
      </div>,
    )

    fireEvent.mouseDown(screen.getByText('Security'))
    await act(async () => {
      fireEvent.click(screen.getByTestId('sni'))
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    const testConnectionBtn = screen.getByTestId(BTN_TEST_CONNECTION)
    await act(async () => {
      fireEvent.click(testConnectionBtn)
    })
    expect(handleTestConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        sni: true,
        servername: formFields.host,
      }),
    )
    await act(async () => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        sni: true,
        servername: formFields.host,
      }),
    )
  })

  it('should change "Use SNI"', async () => {
    const handleSubmit = jest.fn()
    const handleTestConnection = jest.fn()
    render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            tls: true,
            connectionType: ConnectionType.Cluster,
          }}
          onSubmit={handleSubmit}
          onTestConnection={handleTestConnection}
        />
      </div>,
    )

    fireEvent.mouseDown(screen.getByText('Security'))
    await act(async () => {
      fireEvent.click(screen.getByTestId('sni'))
    })

    await act(async () => {
      fireEvent.change(screen.getByTestId('sni-servername'), {
        target: { value: '12' },
      })
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    const testConnectionBtn = screen.getByTestId(BTN_TEST_CONNECTION)
    await act(async () => {
      fireEvent.click(testConnectionBtn)
    })
    expect(handleTestConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        sni: true,
        servername: '12',
      }),
    )
    await act(async () => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        sni: true,
        servername: '12',
      }),
    )
  })

  it('should change "Verify TLS Certificate"', async () => {
    const handleSubmit = jest.fn()
    const handleTestConnection = jest.fn()
    render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            tls: true,
            connectionType: ConnectionType.Cluster,
          }}
          onSubmit={handleSubmit}
          onTestConnection={handleTestConnection}
        />
      </div>,
    )

    fireEvent.mouseDown(screen.getByText('Security'))
    await act(async () => {
      fireEvent.click(screen.getByTestId('verify-tls-cert'))
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    const testConnectionBtn = screen.getByTestId(BTN_TEST_CONNECTION)
    await act(async () => {
      fireEvent.click(testConnectionBtn)
    })
    expect(handleTestConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        verifyServerTlsCert: true,
      }),
    )
    await act(async () => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        verifyServerTlsCert: true,
      }),
    )
  })

  it('should select value from "CA Certificate"', async () => {
    const handleSubmit = jest.fn()
    const handleTestConnection = jest.fn()
    const { findByText } = render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            tls: true,
            connectionType: ConnectionType.Cluster,
          }}
          onSubmit={handleSubmit}
          onTestConnection={handleTestConnection}
        />
      </div>,
    )

    fireEvent.mouseDown(screen.getByText('Security'))
    await userEvent.click(screen.getByTestId('select-ca-cert'))
    await userEvent.click(
      (await findByText('Add new CA certificate')) || document,
    )
    expect(screen.getByTestId(NEW_CA_CERT)).toBeInTheDocument()
    await act(async () => {
      fireEvent.change(screen.getByTestId(NEW_CA_CERT), {
        target: { value: '123' },
      })
    })

    expect(screen.getByTestId(QA_CA_CERT)).toBeInTheDocument()
    await act(async () => {
      fireEvent.change(screen.getByTestId(QA_CA_CERT), {
        target: { value: '321' },
      })
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    const testConnectionBtn = screen.getByTestId(BTN_TEST_CONNECTION)
    await act(async () => {
      fireEvent.click(testConnectionBtn)
    })
    expect(handleTestConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedCaCertName: ADD_NEW_CA_CERT,
        newCaCertName: '321',
        newCaCert: '123',
      }),
    )
    await act(async () => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedCaCertName: ADD_NEW_CA_CERT,
        newCaCertName: '321',
        newCaCert: '123',
      }),
    )
  })

  it('should render fields for add new CA and change them properly', async () => {
    const handleSubmit = jest.fn()
    const handleTestConnection = jest.fn()
    render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            tls: true,
            connectionType: ConnectionType.Cluster,
            selectedCaCertName: 'ADD_NEW_CA_CERT',
          }}
          onSubmit={handleSubmit}
          onTestConnection={handleTestConnection}
        />
      </div>,
    )

    fireEvent.mouseDown(screen.getByText('Security'))
    expect(screen.getByTestId(QA_CA_CERT)).toBeInTheDocument()
    await act(async () => {
      fireEvent.change(screen.getByTestId(QA_CA_CERT), {
        target: { value: '321' },
      })
    })

    expect(screen.getByTestId(NEW_CA_CERT)).toBeInTheDocument()
    await act(async () => {
      fireEvent.change(screen.getByTestId(NEW_CA_CERT), {
        target: { value: '123' },
      })
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    const testConnectionBtn = screen.getByTestId(BTN_TEST_CONNECTION)
    await act(async () => {
      fireEvent.click(testConnectionBtn)
    })
    expect(handleTestConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        newCaCert: '123',
        newCaCertName: '321',
      }),
    )
    await act(async () => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        newCaCert: '123',
        newCaCertName: '321',
      }),
    )
  })

  it('should change "Requires TLS Client Authentication"', async () => {
    const handleSubmit = jest.fn()
    const handleTestConnection = jest.fn()
    render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            tls: true,
            connectionType: ConnectionType.Cluster,
          }}
          onSubmit={handleSubmit}
          onTestConnection={handleTestConnection}
        />
      </div>,
    )

    fireEvent.mouseDown(screen.getByText('Security'))
    await act(async () => {
      fireEvent.click(screen.getByTestId('tls-required-checkbox'))
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    const testConnectionBtn = screen.getByTestId(BTN_TEST_CONNECTION)
    await act(async () => {
      fireEvent.click(testConnectionBtn)
    })
    expect(handleTestConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        tlsClientAuthRequired: true,
      }),
    )
    await act(async () => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        tlsClientAuthRequired: true,
      }),
    )
  })

  it('should render fields for add new CA with required tls auth and change them properly', async () => {
    const handleSubmit = jest.fn()
    const { container } = render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            tls: true,
            connectionType: ConnectionType.Standalone,
            selectedCaCertName: 'NO_CA_CERT',
            tlsClientAuthRequired: true,
            selectedTlsClientCertId: 'ADD_NEW',
          }}
          onSubmit={handleSubmit}
        />
      </div>,
    )

    fireEvent.mouseDown(screen.getByText('Security'))
    expect(screen.getByTestId('select-cert')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByTestId('select-cert'))
    })

    await act(async () => {
      fireEvent.click(
        container.querySelectorAll('.euiContextMenuItem__text')[0] || document,
      )
    })

    expect(screen.getByTestId('new-tsl-cert-pair-name')).toBeInTheDocument()
    await act(async () => {
      fireEvent.change(screen.getByTestId('new-tsl-cert-pair-name'), {
        target: { value: '123' },
      })
    })

    expect(screen.getByTestId('new-tls-client-cert')).toBeInTheDocument()
    await act(async () => {
      fireEvent.change(screen.getByTestId('new-tls-client-cert'), {
        target: { value: '321' },
      })
    })

    expect(screen.getByTestId('new-tls-client-cert-key')).toBeInTheDocument()
    await act(async () => {
      fireEvent.change(screen.getByTestId('new-tls-client-cert-key'), {
        target: { value: '231' },
      })
    })

    const submitBtn = screen.getByTestId(BTN_SUBMIT)

    await act(async () => {
      fireEvent.click(submitBtn)
    })

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        newTlsClientCert: '321',
        newTlsCertPairName: '123',
        newTlsClientKey: '231',
      }),
    )
  })

  it('should render clone mode btn', () => {
    render(
      <ManualConnectionForm
        {...instance(mockedProps)}
        isEditMode
        formFields={{
          ...formFields,
          connectionType: ConnectionType.Standalone,
        }}
      />,
    )
    expect(screen.getByTestId('clone-db-btn')).toBeTruthy()
  })

  describe('should render proper fields with Clone mode', () => {
    it('should render proper fields for standalone db', () => {
      render(
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          isCloneMode
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
          }}
        />,
      )
      const fieldsTestIds = ['host', 'port', 'username', 'password', 'showDb']
      fieldsTestIds.forEach((id) => {
        expect(screen.getByTestId(id)).toBeTruthy()
      })

      fireEvent.mouseDown(screen.getByText('Security'))
      expect(screen.getByTestId('tls')).toBeTruthy()
    })

    it('should render proper fields for sentinel db', () => {
      render(
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          isCloneMode
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Sentinel,
          }}
        />,
      )
      const fieldsTestIds = [
        'name',
        'primary-group',
        'sentinel-mater-username',
        'sentinel-master-password',
        'host',
        'port',
        'username',
        'password',
        'showDb',
      ]
      fieldsTestIds.forEach((id) => {
        expect(screen.getByTestId(id)).toBeTruthy()
      })

      fireEvent.mouseDown(screen.getByText('Security'))
      expect(screen.getByTestId('tls')).toBeTruthy()
    })

    it('should render selected logical database with proper db index', () => {
      render(
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          isCloneMode
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
            showDb: true,
            db: 5,
          }}
        />,
      )
      expect(screen.getByTestId('showDb')).toBeChecked()
      expect(screen.getByTestId('db')).toHaveValue('5')
    })

    it('should render proper database alias as field', () => {
      render(
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          isCloneMode
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
          }}
        />,
      )
      expect(screen.getByTestId('name')).toHaveValue('lala')
    })

    //   it('should render proper default values for standalone', () => {
    //     render(
    //       <ManualConnectionForm
    //         {...instance(mockedProps)}
    //         formFields={{}}
    //       />
    //     )
    //     expect(screen.getByTestId('host')).toHaveValue('127.0.0.1')
    //     expect(screen.getByTestId('port')).toHaveValue('6379')
    //     expect(screen.getByTestId('name')).toHaveValue('127.0.0.1:6379')
    //   })
  })

  it('should change Use SSH checkbox', async () => {
    const handleSubmit = jest.fn()
    render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
          }}
          onSubmit={handleSubmit}
        />
      </div>,
    )

    fireEvent.mouseDown(screen.getByText('Security'))
    act(() => {
      fireEvent.click(screen.getByTestId('use-ssh'))
    })

    expect(screen.getByTestId('use-ssh')).toBeChecked()
  })

  it('should not render Use SSH checkbox for redis stack buidlType', async () => {
    const handleSubmit = jest.fn()
    render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
          }}
          buildType={BuildType.RedisStack}
          onSubmit={handleSubmit}
        />
      </div>,
    )

    expect(screen.queryByTestId('use-ssh')).not.toBeInTheDocument()
  })

  it('should change Use SSH checkbox and show proper fields for password radio', async () => {
    const handleSubmit = jest.fn()
    render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          formFields={{
            ...formFields,
            sshPassType: SshPassType.Password,
            connectionType: ConnectionType.Standalone,
          }}
          onSubmit={handleSubmit}
        />
      </div>,
    )

    fireEvent.mouseDown(screen.getByText('Security'))
    act(() => {
      fireEvent.click(screen.getByTestId('use-ssh'))
    })

    expect(screen.getByTestId('sshHost')).toBeInTheDocument()
    expect(screen.getByTestId('sshPort')).toBeInTheDocument()
    expect(screen.getByTestId('sshPassword')).toBeInTheDocument()
    expect(screen.queryByTestId('sshPrivateKey')).not.toBeInTheDocument()
    expect(screen.queryByTestId('sshPassphrase')).not.toBeInTheDocument()

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    expect(submitBtn).toBeDisabled()
  })

  it('should change Use SSH checkbox and show proper fields for passphrase radio', async () => {
    const handleSubmit = jest.fn()
    const { container } = render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
          }}
          onSubmit={handleSubmit}
        />
      </div>,
    )

    fireEvent.mouseDown(screen.getByText('Security'))
    await act(async () => {
      fireEvent.click(screen.getByTestId('use-ssh'))
    })
    await act(async () => {
      fireEvent.click(
        container.querySelector(RADIO_BTN_PRIVATE_KEY) as HTMLLabelElement,
      )
    })

    expect(screen.getByTestId('sshHost')).toBeInTheDocument()
    expect(screen.getByTestId('sshPort')).toBeInTheDocument()
    expect(screen.queryByTestId('sshPassword')).not.toBeInTheDocument()
    expect(screen.getByTestId('sshPrivateKey')).toBeInTheDocument()
    expect(screen.getByTestId('sshPassphrase')).toBeInTheDocument()

    const submitBtn = screen.getByTestId(BTN_SUBMIT)
    expect(submitBtn).toBeDisabled()
  })

  it('should be proper validation for ssh via ssh password', async () => {
    const handleSubmit = jest.fn()
    render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
            sshPassType: SshPassType.Password,
          }}
          onSubmit={handleSubmit}
        />
      </div>,
    )

    expect(screen.getByTestId(BTN_SUBMIT)).not.toBeDisabled()

    fireEvent.mouseDown(screen.getByText('Security'))
    await act(async () => {
      fireEvent.click(screen.getByTestId('use-ssh'))
    })

    expect(screen.getByTestId(BTN_SUBMIT)).toBeDisabled()

    await act(async () => {
      fireEvent.change(screen.getByTestId('sshHost'), {
        target: { value: 'localhost' },
      })
    })

    expect(screen.getByTestId(BTN_SUBMIT)).toBeDisabled()

    await act(async () => {
      fireEvent.change(screen.getByTestId('sshUsername'), {
        target: { value: 'username' },
      })
    })

    expect(screen.getByTestId(BTN_SUBMIT)).toBeDisabled()

    await act(async () => {
      fireEvent.change(screen.getByTestId('sshPort'), {
        target: { value: '22' },
      })
    })

    expect(screen.getByTestId(BTN_SUBMIT)).not.toBeDisabled()
  })

  it('should be proper validation for ssh via ssh passphrase', async () => {
    const handleSubmit = jest.fn()
    const { container } = render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
            sshPassType: SshPassType.Password,
          }}
          onSubmit={handleSubmit}
        />
      </div>,
    )

    expect(screen.getByTestId(BTN_SUBMIT)).not.toBeDisabled()

    fireEvent.mouseDown(screen.getByText('Security'))
    await act(async () => {
      fireEvent.click(screen.getByTestId('use-ssh'))
    })
    fireEvent.click(
      container.querySelector(RADIO_BTN_PRIVATE_KEY) as HTMLLabelElement,
    )

    expect(screen.getByTestId(BTN_SUBMIT)).toBeDisabled()

    await act(async () => {
      fireEvent.change(screen.getByTestId('sshHost'), {
        target: { value: 'localhost' },
      })
      fireEvent.change(screen.getByTestId('sshPort'), {
        target: { value: '22' },
      })
      fireEvent.change(screen.getByTestId('sshUsername'), {
        target: { value: 'username' },
      })
    })

    expect(screen.getByTestId(BTN_SUBMIT)).toBeDisabled()

    await act(async () => {
      fireEvent.change(screen.getByTestId('sshPrivateKey'), {
        target: { value: 'PRIVATEKEY' },
      })
    })

    expect(screen.getByTestId(BTN_SUBMIT)).not.toBeDisabled()
  })

  it('should call submit btn with proper fields', async () => {
    const handleSubmit = jest.fn()
    render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
            sshPassType: SshPassType.Password,
          }}
          onSubmit={handleSubmit}
        />
      </div>,
    )

    fireEvent.mouseDown(screen.getByText('Security'))
    await act(async () => {
      fireEvent.click(screen.getByTestId('use-ssh'))
    })

    await act(async () => {
      fireEvent.change(screen.getByTestId('sshHost'), {
        target: { value: 'localhost' },
      })

      fireEvent.change(screen.getByTestId('sshPort'), {
        target: { value: 1771 },
      })

      fireEvent.change(screen.getByTestId('sshUsername'), {
        target: { value: 'username' },
      })

      fireEvent.change(screen.getByTestId('sshPassword'), {
        target: { value: '123' },
      })
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId(BTN_SUBMIT))
    })

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        sshHost: 'localhost',
        sshPort: 1771,
        sshUsername: 'username',
        sshPassword: '123',
      }),
    )
  })

  it('should call submit btn with proper fields via passphrase', async () => {
    const handleSubmit = jest.fn()
    const { container } = render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
          }}
          onSubmit={handleSubmit}
        />
      </div>,
    )

    fireEvent.mouseDown(screen.getByText('Security'))
    await act(async () => {
      fireEvent.click(screen.getByTestId('use-ssh'))
    })
    fireEvent.click(
      container.querySelector(RADIO_BTN_PRIVATE_KEY) as HTMLLabelElement,
    )

    await act(async () => {
      fireEvent.change(screen.getByTestId('sshHost'), {
        target: { value: 'localhost' },
      })

      fireEvent.change(screen.getByTestId('sshPort'), {
        target: { value: 1771 },
      })

      fireEvent.change(screen.getByTestId('sshUsername'), {
        target: { value: 'username' },
      })

      fireEvent.change(screen.getByTestId('sshPrivateKey'), {
        target: { value: '123444' },
      })

      fireEvent.change(screen.getByTestId('sshPassphrase'), {
        target: { value: '123444' },
      })
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId(BTN_SUBMIT))
    })

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        sshHost: 'localhost',
        sshPort: 1771,
        sshUsername: 'username',
        sshPrivateKey: '123444',
        sshPassphrase: '123444',
      }),
    )
  })

  it('should render password input with 10_000 length limit', () => {
    render(
      <ManualConnectionForm
        {...instance(mockedProps)}
        formFields={{
          ...formFields,
          connectionType: ConnectionType.Standalone,
        }}
      />,
    )

    expect(screen.getByTestId('password')).toHaveAttribute('maxLength', '10000')
  })

  it('should render security fields with proper attributes', () => {
    render(
      <ManualConnectionForm
        {...instance(mockedProps)}
        formFields={{
          ...formFields,
          connectionType: ConnectionType.Standalone,
          ssh: true,
          password: true,
          sshPassphrase: true,
          sshPassType: SshPassType.PrivateKey,
        }}
      />,
    )

    expect(screen.getByTestId('password')).toHaveAttribute(
      'value',
      '••••••••••••',
    )
    expect(screen.getByTestId('password')).toHaveAttribute('type', 'password')

    fireEvent.mouseDown(screen.getByText('Security'))
    expect(screen.getByTestId('sshPassphrase')).toHaveAttribute(
      'value',
      '••••••••••••',
    )
    expect(screen.getByTestId('sshPassphrase')).toHaveAttribute(
      'type',
      'password',
    )

    fireEvent.mouseDown(screen.getByText('General'))
    fireEvent.focus(screen.getByTestId('password'))

    expect(screen.getByTestId('password')).toHaveAttribute('value', '')

    fireEvent.mouseDown(screen.getByText('Security'))
    fireEvent.focus(screen.getByTestId('sshPassphrase'))
    expect(screen.getByTestId('sshPassphrase')).toHaveAttribute('value', '')
  })

  it('should render ssh password with proper attributes', () => {
    render(
      <ManualConnectionForm
        {...instance(mockedProps)}
        formFields={{
          ...formFields,
          connectionType: ConnectionType.Standalone,
          ssh: true,
          sshPassword: true,
          sshPassType: SshPassType.Password,
        }}
      />,
    )

    fireEvent.mouseDown(screen.getByText('Security'))
    expect(screen.getByTestId('sshPassword')).toHaveAttribute(
      'value',
      '••••••••••••',
    )
    expect(screen.getByTestId('sshPassword')).toHaveAttribute(
      'type',
      'password',
    )

    fireEvent.focus(screen.getByTestId('sshPassword'))

    expect(screen.getByTestId('sshPassword')).toHaveAttribute('value', '')
  })

  it('should render ssh password input with 10_000 length limit', () => {
    render(
      <ManualConnectionForm
        {...instance(mockedProps)}
        formFields={{
          ...formFields,
          connectionType: ConnectionType.Standalone,
          ssh: true,
          sshPassType: SshPassType.Password,
        }}
      />,
    )

    fireEvent.mouseDown(screen.getByText('Security'))
    expect(screen.getByTestId('sshPassword')).toHaveAttribute(
      'maxLength',
      '10000',
    )
  })

  describe('timeout', () => {
    it('should render timeout input with 7 length limit and 1_000_000 value', () => {
      render(
        <ManualConnectionForm
          {...instance(mockedProps)}
          formFields={{ ...formFields, timeout: '30' }}
        />,
      )

      expect(screen.getByTestId('timeout')).toBeInTheDocument()

      fireEvent.change(screen.getByTestId('timeout'), {
        target: { value: '2000000' },
      })
      fireEvent.focusOut(screen.getByTestId('timeout'))

      expect(screen.getByTestId('timeout')).toHaveAttribute('value', '1000000')
    })

    it('should default  to previous value when value other than just numbers is provided', () => {
      render(
        <ManualConnectionForm
          {...instance(mockedProps)}
          formFields={{ ...formFields, timeout: '30' }}
        />,
      )

      fireEvent.change(screen.getByTestId('timeout'), {
        target: { value: '11a2EU$#@' },
      })

      expect(screen.getByTestId('timeout')).toHaveAttribute('value', '30')
    })
  })

  describe('cloud', () => {
    it('some fields should be readonly if instance data source from cloud', () => {
      ;(appRedirectionSelector as jest.Mock).mockImplementation(() => ({
        action: UrlHandlingActions.Connect,
      }))

      const { queryByTestId } = render(
        <ManualConnectionForm
          {...instance(mockedProps)}
          formFields={formFields}
        />,
      )

      expect(queryByTestId('connection-type')).not.toBeInTheDocument()
      expect(queryByTestId('host')).not.toBeInTheDocument()
      expect(queryByTestId('port')).not.toBeInTheDocument()
      expect(queryByTestId('db-info-port')).toBeInTheDocument()
      expect(queryByTestId('db-info-host')).toBeInTheDocument()
    })
  })

  describe('Azure databases', () => {
    beforeEach(() => {
      // Reset appRedirectionSelector mock to ensure isFromCloud = false
      ;(appRedirectionSelector as jest.Mock).mockImplementation(() => ({
        action: null,
      }))
    })

    it('should disable connection fields when editing Azure database', () => {
      render(
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          isFromAzure
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
          }}
        />,
      )

      // Host is not shown in edit mode (shown as info above form)
      expect(screen.queryByTestId('host')).not.toBeInTheDocument()
      // Port, username, password should be disabled
      expect(screen.getByTestId('port')).toBeDisabled()
      expect(screen.getByTestId('username')).toBeDisabled()
      expect(screen.getByTestId('password')).toBeDisabled()
    })

    it('should disable connection fields when cloning Azure database', () => {
      render(
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          isCloneMode
          isFromAzure
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
          }}
        />,
      )

      expect(screen.getByTestId('host')).toBeDisabled()
      expect(screen.getByTestId('port')).toBeDisabled()
      expect(screen.getByTestId('username')).toBeDisabled()
      expect(screen.getByTestId('password')).toBeDisabled()
    })

    it('should not disable connection fields for non-Azure database in edit mode', () => {
      render(
        <ManualConnectionForm
          {...instance(mockedProps)}
          isEditMode
          formFields={{
            ...formFields,
            connectionType: ConnectionType.Standalone,
          }}
        />,
      )

      // Host is not shown in edit mode (shown as info above form)
      expect(screen.queryByTestId('host')).not.toBeInTheDocument()
      // Port, username, password should NOT be disabled for non-Azure databases
      expect(screen.getByTestId('port')).not.toBeDisabled()
      expect(screen.getByTestId('username')).not.toBeDisabled()
      expect(screen.getByTestId('password')).not.toBeDisabled()
    })
  })

  it('should call submit on press Enter', async () => {
    const handleSubmit = jest.fn()
    render(
      <div id="footerDatabaseForm">
        <ManualConnectionForm
          {...instance(mockedProps)}
          formFields={formFields}
          onSubmit={handleSubmit}
        />
      </div>,
    )

    await act(async () => {
      fireEvent.keyDown(screen.getByTestId('form'), {
        key: 'Enter',
        code: 13,
        charCode: 13,
      })
    })
    expect(handleSubmit).toHaveBeenCalled()
  })
})
