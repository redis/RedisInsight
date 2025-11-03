import React from 'react'
import { FormikProps } from 'formik'
import {
  DatabaseForm,
  DbIndex,
  ForceStandalone,
  SSHDetails,
  TlsDetails,
} from 'uiSrc/pages/home/components/form'
import Divider from 'uiSrc/components/divider/Divider'
import { BuildType } from 'uiSrc/constants/env'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { Spacer } from 'uiSrc/components/base/layout'
import DecompressionAndFormatters from './DecompressionAndFormatters'
import { ManualFormTab } from '../constants'

export interface Props {
  activeTab: ManualFormTab
  formik: FormikProps<DbConnectionInfo>
  onKeyDown: (event: React.KeyboardEvent<HTMLFormElement>) => void
  onHostNamePaste: (content: string) => boolean
  caCertificates?: { id: string; name: string }[]
  certificates?: { id: number; name: string }[]
  buildType?: BuildType
}

const AddConnection = (props: Props) => {
  const {
    activeTab,
    formik,
    onKeyDown,
    onHostNamePaste,
    certificates,
    caCertificates,
    buildType,
  } = props

  return (
    <form
      onSubmit={formik.handleSubmit}
      data-testid="form"
      onKeyDown={onKeyDown}
      role="presentation"
    >
      {activeTab === ManualFormTab.General && (
        <>
          <DatabaseForm
            formik={formik}
            onHostNamePaste={onHostNamePaste}
            showFields={{ host: true, alias: true, port: true, timeout: true }}
          />
          <Spacer size="l" />
          <Divider colorVariable="separatorColor" variant="fullWidth" />
          <Spacer size="m" />
          <DbIndex formik={formik} />
          <Spacer size="m" />
          <Divider colorVariable="separatorColor" variant="fullWidth" />
          <Spacer size="m" />
          <ForceStandalone formik={formik} />
        </>
      )}
      {activeTab === ManualFormTab.Security && (
        <>
          <TlsDetails
            formik={formik}
            certificates={certificates}
            caCertificates={caCertificates}
          />
          {buildType !== BuildType.RedisStack && (
            <>
              <Spacer />
              <Divider colorVariable="separatorColor" variant="fullWidth" />
              <Spacer />
              <SSHDetails formik={formik} />
            </>
          )}
        </>
      )}
      {activeTab === ManualFormTab.Decompression && (
        <DecompressionAndFormatters formik={formik} />
      )}
    </form>
  )
}

export default AddConnection
