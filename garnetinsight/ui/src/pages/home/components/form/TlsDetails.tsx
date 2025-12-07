import React, { ChangeEvent, useState } from 'react'
import cx from 'classnames'
import { FormikProps } from 'formik'

import { useDispatch } from 'react-redux'
import { Nullable, validateCertName, validateField } from 'uiSrc/utils'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'

import {
  ADD_NEW,
  ADD_NEW_CA_CERT,
  NO_CA_CERT,
} from 'uiSrc/pages/home/constants'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { deleteCaCertificateAction } from 'uiSrc/slices/instances/caCerts'
import { deleteClientCertAction } from 'uiSrc/slices/instances/clientCerts'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { TextArea, TextInput } from 'uiSrc/components/base/inputs'
import { RiSelectOption } from 'uiSrc/components/base/forms/select/RiSelect'
import { useGenerateId } from 'uiSrc/components/base/utils/hooks/generate-id'
import styles from '../styles.module.scss'
import { RISelectWithActions } from 'uiSrc/components/base/forms/select/RISelectWithActions'

const suffix = '_tls_details'

export interface Certificate {
  id: string
  name: string
}

export interface Props {
  formik: FormikProps<DbConnectionInfo>
  caCertificates?: Certificate[]
  certificates?: Certificate[]
}

const TlsDetails = (props: Props) => {
  const dispatch = useDispatch()
  const { formik, caCertificates, certificates } = props
  const [activeCertId, setActiveCertId] = useState<Nullable<string>>(null)

  const handleDeleteCaCert = (id: string) => {
    dispatch(
      deleteCaCertificateAction(id, () => {
        if (formik.values.selectedCaCertName === id) {
          formik.setFieldValue('selectedCaCertName', NO_CA_CERT)
        }
        handleClickDeleteCert('CA')
      }),
    )
  }

  const handleDeleteClientCert = (id: string) => {
    dispatch(
      deleteClientCertAction(id, () => {
        if (formik.values.selectedTlsClientCertId === id) {
          formik.setFieldValue('selectedTlsClientCertId', ADD_NEW)
        }
        handleClickDeleteCert('Client')
      }),
    )
  }

  const handleClickDeleteCert = (certificateType: 'Client' | 'CA') => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_CERTIFICATE_REMOVED,
      eventData: {
        certificateType,
      },
    })
  }

  const closePopover = () => {
    setActiveCertId(null)
  }

  const showPopover = (id: string) => {
    setActiveCertId(`${id}${suffix}`)
  }

  const optionsCertsCA: RiSelectOption[] = [
    {
      value: NO_CA_CERT,
      label: 'No CA Certificate',
    },
    {
      value: ADD_NEW_CA_CERT,
      label: 'Add new CA certificate',
    },
  ]

  caCertificates?.forEach((cert) => {
    optionsCertsCA.push({
      value: cert.id,
      label: cert.name,
      actions: (
        <PopoverDelete
          header={cert.name}
          text="will be removed from Garnetinsight."
          item={cert.id}
          suffix={suffix}
          deleting={activeCertId ?? ''}
          closePopover={closePopover}
          updateLoading={false}
          showPopover={showPopover}
          handleDeleteItem={handleDeleteCaCert}
          testid={`delete-ca-cert-${cert.id}`}
          persistent
          customOutsideDetector
        />
      ),
    })
  })

  const optionsCertsClient: RiSelectOption[] = [
    {
      value: 'ADD_NEW',
      label: 'Add new certificate',
    },
  ]

  certificates?.forEach((cert) => {
    optionsCertsClient.push({
      value: `${cert.id}`,
      label: cert.name,
      actions: (
        <PopoverDelete
          header={cert.name}
          text="will be removed from Garnetinsight."
          item={cert.id}
          suffix={suffix}
          deleting={activeCertId}
          closePopover={closePopover}
          updateLoading={false}
          showPopover={showPopover}
          handleDeleteItem={handleDeleteClientCert}
          testid={`delete-client-cert-${cert.id}`}
          persistent
          customOutsideDetector
        />
      ),
    })
  })

  const sslId = useGenerateId('', ' over ssl')
  const sni = useGenerateId('', ' sni')
  const verifyTlsId = useGenerateId('', ' verifyServerTlsCert')
  const isTlsAuthId = useGenerateId('', ' is_tls_client_auth_required')
  return (
    <Col gap="l">
      <Row gap="m">
        <FlexItem>
          <FormField>
            <Checkbox
              id={sslId}
              name="tls"
              label="Use TLS"
              labelSize="M"
              checked={!!formik.values.tls}
              onChange={formik.handleChange}
              data-testid="tls"
            />
          </FormField>
        </FlexItem>
      </Row>

      {formik.values.tls && (
        <Col gap="l">
          <Row gap="m">
            <FlexItem grow={1}>
              <Checkbox
                id={sni}
                name="sni"
                labelSize="M"
                label="Use SNI"
                checked={!!formik.values.sni}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  formik.setFieldValue(
                    'servername',
                    formik.values.servername ?? formik.values.host ?? '',
                  )
                  return formik.handleChange(e)
                }}
                data-testid="sni"
              />
            </FlexItem>
          </Row>
          {formik.values.sni && (
            <Row gap="m">
              <FlexItem grow>
                <FormField label="Server Name" required>
                  <TextInput
                    name="servername"
                    id="servername"
                    maxLength={200}
                    placeholder="Enter Server Name"
                    value={formik.values.servername ?? ''}
                    onChange={(value) =>
                      formik.setFieldValue(
                        'servername',
                        validateField(value.trim()),
                      )
                    }
                    data-testid="sni-servername"
                  />
                </FormField>
              </FlexItem>
            </Row>
          )}
          <Row gap="m" responsive>
            <FlexItem
              grow
              className={cx({ [styles.fullWidth]: formik.values.sni })}
            >
              <Checkbox
                id={verifyTlsId}
                name="verifyServerTlsCert"
                label="Verify TLS Certificate"
                labelSize="M"
                checked={!!formik.values.verifyServerTlsCert}
                onChange={formik.handleChange}
                data-testid="verify-tls-cert"
              />
            </FlexItem>
          </Row>
        </Col>
      )}
      {formik.values.tls && (
        <Col gap="l">
          <Row gap="m" responsive>
            <FlexItem grow>
              <FormField
                label="CA Certificate"
                required={formik.values.verifyServerTlsCert}
              >
                <RISelectWithActions
                  placeholder="Select CA certificate"
                  value={formik.values.selectedCaCertName ?? NO_CA_CERT}
                  options={optionsCertsCA}
                  onChange={(value) => {
                    formik.setFieldValue(
                      'selectedCaCertName',
                      value || NO_CA_CERT,
                    )
                  }}
                  data-testid="select-ca-cert"
                />
              </FormField>
            </FlexItem>

            {formik.values.tls &&
            formik.values.selectedCaCertName === ADD_NEW_CA_CERT ? (
              <FlexItem grow>
                <FormField label="Name" required>
                  <TextInput
                    name="newCaCertName"
                    id="newCaCertName"
                    maxLength={200}
                    placeholder="Enter CA Certificate Name"
                    value={formik.values.newCaCertName ?? ''}
                    onChange={(value) =>
                      formik.setFieldValue(
                        'newCaCertName',
                        validateCertName(value),
                      )
                    }
                    data-testid="qa-ca-cert"
                  />
                </FormField>
              </FlexItem>
            ) : (
              <FlexItem grow />
            )}
          </Row>

          {formik.values.tls &&
            formik.values.selectedCaCertName === ADD_NEW_CA_CERT && (
              <Row gap="m" responsive>
                <FlexItem grow>
                  <FormField label="Certificate" required>
                    <TextArea
                      name="newCaCert"
                      id="newCaCert"
                      value={formik.values.newCaCert ?? ''}
                      onChangeCapture={formik.handleChange}
                      placeholder="Enter CA Certificate"
                      data-testid="new-ca-cert"
                    />
                  </FormField>
                </FlexItem>
              </Row>
            )}
        </Col>
      )}
      {formik.values.tls && (
        <Row responsive>
          <FlexItem grow>
            <Checkbox
              id={isTlsAuthId}
              name="tlsClientAuthRequired"
              label="Requires TLS Client Authentication"
              labelSize="M"
              checked={!!formik.values.tlsClientAuthRequired}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                formik.setFieldValue('tlsClientAuthRequired', e.target.checked)
              }
              data-testid="tls-required-checkbox"
            />
          </FlexItem>
        </Row>
      )}
      {formik.values.tls && formik.values.tlsClientAuthRequired && (
        <Col gap="l">
          <Row gap="m" responsive>
            <FlexItem grow>
              <FormField label="Client Certificate" required>
                <RISelectWithActions
                  placeholder="Select certificate"
                  value={formik.values.selectedTlsClientCertId}
                  options={optionsCertsClient}
                  onChange={(value) => {
                    formik.setFieldValue('selectedTlsClientCertId', value)
                  }}
                  data-testid="select-cert"
                />
              </FormField>
            </FlexItem>

            {formik.values.tls &&
            formik.values.tlsClientAuthRequired &&
            formik.values.selectedTlsClientCertId === 'ADD_NEW' ? (
              <FlexItem grow>
                <FormField label="Name" required>
                  <TextInput
                    name="newTlsCertPairName"
                    id="newTlsCertPairName"
                    maxLength={200}
                    placeholder="Enter Client Certificate Name"
                    value={formik.values.newTlsCertPairName ?? ''}
                    onChange={(value) =>
                      formik.setFieldValue(
                        'newTlsCertPairName', // same as the name prop passed a few lines above
                        validateCertName(value),
                      )
                    }
                    data-testid="new-tsl-cert-pair-name"
                  />
                </FormField>
              </FlexItem>
            ) : (
              <FlexItem grow />
            )}
          </Row>

          {formik.values.tls &&
            formik.values.tlsClientAuthRequired &&
            formik.values.selectedTlsClientCertId === 'ADD_NEW' && (
              <Col gap="l">
                <Row gap="m" responsive>
                  <FlexItem grow>
                    <FormField label="Certificate" required>
                      <TextArea
                        name="newTlsClientCert"
                        id="newTlsClientCert"
                        value={formik.values.newTlsClientCert}
                        onChangeCapture={formik.handleChange}
                        draggable={false}
                        placeholder="Enter Client Certificate"
                        data-testid="new-tls-client-cert"
                      />
                    </FormField>
                  </FlexItem>
                </Row>
                <Row gap="m" responsive>
                  <FlexItem grow>
                    <FormField label="Private Key" required>
                      <TextArea
                        placeholder="Enter Private Key"
                        name="newTlsClientKey"
                        id="newTlsClientKey"
                        value={formik.values.newTlsClientKey}
                        onChangeCapture={formik.handleChange}
                        data-testid="new-tls-client-cert-key"
                      />
                    </FormField>
                  </FlexItem>
                </Row>
              </Col>
            )}
        </Col>
      )}
    </Col>
  )
}

export default TlsDetails
