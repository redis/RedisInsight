import React from 'react'
import { FormikProps } from 'formik'
import {
  DatabaseForm,
  DbIndex,
  ForceStandalone,
  SSHDetails,
  TlsDetails,
} from 'uiSrc/pages/home/components/form'
import { Spacer } from 'uiSrc/components/base/layout'
import Divider from 'uiSrc/components/divider/Divider'
import { BuildType } from 'uiSrc/constants/env'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import DecompressionAndFormatters from './DecompressionAndFormatters'

import { AZURE_READONLY_FIELDS, ManualFormTab } from '../constants'

export interface Props {
  activeTab: ManualFormTab
  isEditMode: boolean
  isCloneMode: boolean
  isFromCloud: boolean
  isFromAzure?: boolean
  formik: FormikProps<DbConnectionInfo>
  onKeyDown: (event: React.KeyboardEvent<HTMLFormElement>) => void
  onHostNamePaste: (content: string) => boolean
  caCertificates?: { id: string; name: string }[]
  certificates?: { id: number; name: string }[]
  buildType?: BuildType
}

const EditConnection = (props: Props) => {
  const {
    activeTab,
    isCloneMode,
    isEditMode,
    isFromCloud,
    isFromAzure = false,
    formik,
    onKeyDown,
    onHostNamePaste,
    certificates,
    caCertificates,
    buildType,
  } = props

  // For Azure databases in edit/clone mode, disable connection fields
  const readOnlyFields = isFromAzure && isEditMode ? AZURE_READONLY_FIELDS : []

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
            showFields={{
              alias: true,
              host: (!isEditMode || isCloneMode) && !isFromCloud,
              port: !isFromCloud,
              timeout: true,
            }}
            autoFocus={!isCloneMode && isEditMode}
            onHostNamePaste={onHostNamePaste}
            readyOnlyFields={readOnlyFields}
          />
          <Spacer size="l" />
          <Divider />
          <Spacer size="m" />
          <ForceStandalone formik={formik} />
          {isCloneMode && (
            <>
              <Spacer size="m" />
              <Divider />
              <Spacer size="m" />
              <DbIndex formik={formik} />
            </>
          )}
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
              <Spacer size="m" />
              <Divider />
              <Spacer size="m" />
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

export default EditConnection
