import React from 'react'
import { FormikProps } from 'formik'

import { Nullable } from 'uiSrc/utils'
import { SECURITY_FIELD } from 'uiSrc/constants'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { PasswordInput, TextInput } from 'uiSrc/components/base/inputs'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
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
      <Row gap="m" responsive className={flexGroupClassName}>
        <FlexItem grow className={flexItemClassName}>
          <RiFormField label="Username">
            <TextInput
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
        </FlexItem>

        <FlexItem grow className={flexItemClassName}>
          <RiFormField label="Password">
            <PasswordInput
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
        </FlexItem>
      </Row>
    </>
  )
}

export default SentinelMasterDatabase
