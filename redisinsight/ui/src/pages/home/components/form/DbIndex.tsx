import React, { ChangeEvent } from 'react'
import { FormikProps } from 'formik'

import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { FormField } from 'uiSrc/components/base/forms/FormField'
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
          <FormField>
            <Checkbox
              id={id}
              name="showDb"
              labelSize="M"
              label="Select Logical Database"
              checked={!!formik.values.showDb}
              onChange={handleChangeDbIndexCheckbox}
              data-testid="showDb"
            />
          </FormField>
        </FlexItem>
      </Row>

      {formik.values.showDb && (
        <Row gap="m" responsive>
          <FlexItem grow className={styles.dbInput}>
            <FormField label="Database Index">
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
            </FormField>
          </FlexItem>
          <FlexItem grow />
        </Row>
      )}
    </>
  )
}

export default DbIndex
