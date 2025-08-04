import React from 'react'
import { FormikProps } from 'formik'
import {
  PrimaryGroupSentinel,
  SentinelMasterDatabase,
} from 'uiSrc/pages/home/components/form/sentinel'
import { Nullable, selectOnFocus } from 'uiSrc/utils'
import Divider from 'uiSrc/components/divider/Divider'
import {
  DatabaseForm,
  DbIndex,
  TlsDetails,
} from 'uiSrc/pages/home/components/form'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { Title } from 'uiSrc/components/base/text/Title'
import { TextInput } from 'uiSrc/components/base/inputs'
import DecompressionAndFormatters from './DecompressionAndFormatters'

import { ManualFormTab } from '../constants'

export interface Props {
  activeTab: ManualFormTab
  isCloneMode: boolean
  formik: FormikProps<DbConnectionInfo>
  onKeyDown: (event: React.KeyboardEvent<HTMLFormElement>) => void
  onHostNamePaste: (content: string) => boolean
  caCertificates?: { id: string; name: string }[]
  certificates?: { id: number; name: string }[]
  db: Nullable<number>
}

const EditSentinelConnection = (props: Props) => {
  const {
    activeTab,
    isCloneMode,
    formik,
    onKeyDown,
    onHostNamePaste,
    certificates,
    caCertificates,
    db,
  } = props

  const GeneralFormClodeMode = (
    <>
      <PrimaryGroupSentinel formik={formik} />
      <Divider
        colorVariable="separatorColor"
        variant="fullWidth"
        className="form__divider"
      />
      <Title size="XS">Database</Title>
      <Spacer size="s" />
      <SentinelMasterDatabase
        formik={formik}
        db={db}
        isCloneMode={isCloneMode}
      />
      <Divider
        colorVariable="separatorColor"
        variant="fullWidth"
        className="form__divider"
      />
      <Title size="XS">Sentinel</Title>
      <Spacer size="s" />
      <DatabaseForm
        formik={formik}
        showFields={{ host: true, port: true, alias: false, timeout: false }}
        onHostNamePaste={onHostNamePaste}
      />
      <Divider
        colorVariable="separatorColor"
        variant="fullWidth"
        className="form__divider"
      />
      <DbIndex formik={formik} />
    </>
  )

  const GeneralFormEditMode = (
    <>
      <Row gap="m">
        <FlexItem grow>
          <FormField label="Database Alias*">
            <TextInput
              name="name"
              id="name"
              data-testid="name"
              placeholder="Enter Database Alias"
              onFocus={selectOnFocus}
              value={formik.values.name ?? ''}
              maxLength={500}
              onChange={formik.handleChange}
            />
          </FormField>
        </FlexItem>
      </Row>
      <Spacer size="s" />
      <Divider
        colorVariable="separatorColor"
        variant="fullWidth"
        className="form__divider"
      />
      <Title size="XS">Database</Title>
      <Spacer size="s" />
      <SentinelMasterDatabase
        formik={formik}
        db={db}
        isCloneMode={isCloneMode}
      />
      <Divider
        colorVariable="separatorColor"
        variant="fullWidth"
        className="form__divider"
      />
      <Title size="XS">Sentinel</Title>
      <Spacer size="s" />
      <DatabaseForm
        formik={formik}
        showFields={{ host: false, port: true, alias: false, timeout: false }}
        onHostNamePaste={onHostNamePaste}
      />
    </>
  )

  return (
    <form
      onSubmit={formik.handleSubmit}
      data-testid="form"
      onKeyDown={onKeyDown}
      role="presentation"
    >
      {activeTab === ManualFormTab.General && (
        <>{isCloneMode ? GeneralFormClodeMode : GeneralFormEditMode}</>
      )}
      {activeTab === ManualFormTab.Security && (
        <TlsDetails
          formik={formik}
          certificates={certificates}
          caCertificates={caCertificates}
        />
      )}

      {activeTab === ManualFormTab.Decompression && (
        <DecompressionAndFormatters formik={formik} />
      )}
    </form>
  )
}

export default EditSentinelConnection
