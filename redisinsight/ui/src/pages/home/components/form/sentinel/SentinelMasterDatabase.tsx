import React from 'react'
import { FormikProps } from 'formik'

import { Nullable } from 'uiSrc/utils'
import { SECURITY_FIELD } from 'uiSrc/constants'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { PasswordInput, TextInput } from 'uiSrc/components/base/inputs'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { useTranslation } from 'uiSrc/i18n'
import styles from '../../styles.module.scss'

export interface Props {
  formik: FormikProps<DbConnectionInfo>
  isCloneMode: boolean
  db: Nullable<number>
}

const SentinelMasterDatabase = (props: Props) => {
  const { t } = useTranslation()
  const { db, isCloneMode, formik } = props
  return (
    <>
      {!!db && !isCloneMode && (
        <Text color="subdued" className={styles.sentinelCollapsedField}>
          {t('home.form.dbInfo.field.databaseIndex')}
          <span style={{ paddingLeft: 5 }}>
            <ColorText>{db}</ColorText>
          </span>
        </Text>
      )}
      <Row gap="m" responsive>
        <FlexItem grow>
          <FormField label={t('home.form.database.field.username')}>
            <TextInput
              name="sentinelMasterUsername"
              id="sentinelMasterUsername"
              maxLength={200}
              placeholder={t('home.form.database.placeholder.username')}
              value={formik.values.sentinelMasterUsername ?? ''}
              onChange={(value) =>
                formik.setFieldValue('sentinelMasterUsername', value)
              }
              data-testid="sentinel-mater-username"
            />
          </FormField>
        </FlexItem>

        <FlexItem grow>
          <FormField label={t('home.form.database.field.password')}>
            <PasswordInput
              type="password"
              name="sentinelMasterPassword"
              id="sentinelMasterPassword"
              data-testid="sentinel-master-password"
              maxLength={200}
              placeholder={t('home.form.database.placeholder.password')}
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
          </FormField>
        </FlexItem>
      </Row>
    </>
  )
}

export default SentinelMasterDatabase
