import React, { ChangeEvent } from 'react'
import { FormikProps } from 'formik'

import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiSpacer } from 'uiBase/layout/spacer'
import { RiCheckbox, RiFormField } from 'uiBase/forms'
import { RiNumericInput } from 'uiBase/inputs'
import { useGenerateId } from 'uiBase/utils'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import styles from '../styles.module.scss'

export interface Props {
  formik: FormikProps<DbConnectionInfo>
}

const DbIndex = (props: Props) => {
  const { formik } = props

  const handleChangeDbIndexCheckbox = (
    e: ChangeEvent<HTMLInputElement>,
  ): void => {
    // Need to check the type of event to safely access properties
    const isChecked = 'checked' in e.target ? e.target.checked : false
    if (!isChecked) {
      // Reset db field to initial value
      formik.setFieldValue('db', null)
    }
    formik.handleChange(e)
  }
  const id = useGenerateId('', ' over db')

  return (
    <>
      <RiRow gap="s">
        <RiFlexItem>
          <RiFormField>
            <RiCheckbox
              id={id}
              name="showDb"
              label="Select Logical Database"
              checked={!!formik.values.showDb}
              onChange={handleChangeDbIndexCheckbox}
              data-testid="showDb"
            />
          </RiFormField>
        </RiFlexItem>
      </RiRow>

      {formik.values.showDb && (
        <>
          <RiSpacer />
          <RiRow gap="m" responsive>
            <RiFlexItem grow className={styles.dbInput}>
              <RiFormField label="Database Index">
                <RiNumericInput
                  autoValidate
                  min={0}
                  name="db"
                  id="db"
                  data-testid="db"
                  placeholder="Enter Database Index"
                  value={Number(formik.values.db)}
                  onChange={(value) => formik.setFieldValue('db', value)}
                />
              </RiFormField>
            </RiFlexItem>
            <RiFlexItem grow />
          </RiRow>
        </>
      )}
    </>
  )
}

export default DbIndex
