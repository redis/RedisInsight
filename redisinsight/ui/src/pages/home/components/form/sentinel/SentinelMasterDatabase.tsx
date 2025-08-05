import React from 'react'
import { FormikProps } from 'formik'

import { Nullable } from 'uiSrc/utils'
import { SECURITY_FIELD } from 'uiSrc/constants'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { RiPasswordInput, RiTextInput } from 'uiSrc/components/base/inputs'
import { RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import { RiFormField } from 'uiSrc/components/base/forms'
import styles from '../../styles.module.scss'

export interface Props {
  flexGroupClassName?: string
  flexItemClassName?: string
  formik: FormikProps<DbConnectionInfo>
  isCloneMode: boolean
  db: Nullable<number>
}

const SentinelMasterDatabase = (props: Props) => {
  const {
    db,
    isCloneMode,
    flexGroupClassName = '',
    flexItemClassName = '',
    formik,
  } = props
  return (
    <>
      {!!db && !isCloneMode && (
        <Text color="subdued" className={styles.sentinelCollapsedField}>
          Database Index:
          <span style={{ paddingLeft: 5 }}>
            <ColorText>{db}</ColorText>
          </span>
        </Text>
      )}
      <RiRow gap="m" responsive className={flexGroupClassName}>
        <RiFlexItem grow className={flexItemClassName}>
          <RiFormField label="Username">
            <RiTextInput
              name="sentinelMasterUsername"
              id="sentinelMasterUsername"
              maxLength={200}
              placeholder="Enter Username"
              value={formik.values.sentinelMasterUsername ?? ''}
              onChange={(value) =>
                formik.setFieldValue('sentinelMasterUsername', value)
              }
              data-testid="sentinel-mater-username"
            />
          </RiFormField>
        </RiFlexItem>

        <RiFlexItem grow className={flexItemClassName}>
          <RiFormField label="Password">
            <RiPasswordInput
              type="password"
              name="sentinelMasterPassword"
              id="sentinelMasterPassword"
              data-testid="sentinel-master-password"
              maxLength={200}
              placeholder="Enter Password"
              value={
                formik.values.sentinelMasterPassword === true
                  ? SECURITY_FIELD
                  : (formik.values.sentinelMasterPassword ?? '')
              }
              onChangeCapture={formik.handleChange}
              onFocus={() => {
                if (formik.values.sentinelMasterPassword === true) {
                  formik.setFieldValue('sentinelMasterPassword', '')
                }
              }}
              autoComplete="new-password"
            />
          </RiFormField>
        </RiFlexItem>
      </RiRow>
    </>
  )
}

export default SentinelMasterDatabase
