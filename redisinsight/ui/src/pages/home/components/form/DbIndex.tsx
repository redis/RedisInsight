import React, { ChangeEvent } from 'react'
import { FormikProps } from 'formik'

import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { RiCheckbox, RiFormField } from 'uiSrc/components/base/forms'
import { NumericInput } from 'uiSrc/components/base/inputs'
import { useGenerateId } from 'uiSrc/components/base/utils/hooks/generate-id'
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
      <Row gap="s">
        <FlexItem>
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
        </FlexItem>
      </Row>

      {formik.values.showDb && (
        <>
          <Spacer />
          <Row gap="m" responsive>
            <FlexItem grow className={styles.dbInput}>
              <RiFormField label="Database Index">
                <NumericInput
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
            </FlexItem>
            <FlexItem grow />
          </Row>
        </>
      )}
    </>
  )
}

export default DbIndex
