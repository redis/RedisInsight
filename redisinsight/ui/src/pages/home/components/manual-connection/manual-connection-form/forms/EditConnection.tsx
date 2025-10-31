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
import DecompressionAndFormatters from './DecompressionAndFormatters'

import { ManualFormTab } from '../constants'

export interface Props {
  activeTab: ManualFormTab
  isEditMode: boolean
  isCloneMode: boolean
  isFromCloud: boolean
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
            showFields={{
              alias: true,
              host: (!isEditMode || isCloneMode) && !isFromCloud,
              port: !isFromCloud,
              timeout: true,
            }}
            autoFocus={!isCloneMode && isEditMode}
            onHostNamePaste={onHostNamePaste}
          />
          <Divider
            colorVariable="separatorColor"
            variant="fullWidth"
          />
          <ForceStandalone formik={formik} />
          {isCloneMode && (
            <>
              <Divider
                colorVariable="separatorColor"
                variant="fullWidth"
              />
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
              <Divider
                colorVariable="separatorColor"
                variant="fullWidth"
              />
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
