import React, { ChangeEvent } from 'react'
import { FormikProps } from 'formik'

import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { useAppSelector } from 'uiSrc/slices/hooks'
import { connectedInstanceInfoSelector } from 'uiSrc/slices/instances/instances'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { useGenerateId } from 'uiSrc/components/base/utils/hooks/generate-id'
import { useTranslation } from 'uiSrc/i18n'
import styles from '../styles.module.scss'

/**
 * Redis ships with 16 logical databases by default. Used as the option count
 * until the connection has been tested, because the real value can only be
 * read from the instance itself.
 */
const DEFAULT_DATABASES_COUNT = 16

export interface Props {
  formik: FormikProps<DbConnectionInfo>
}

const DbIndex = (props: Props) => {
  const { t } = useTranslation()
  const { formik } = props
  // Filled by `testConnectionSuccess` once the connection has been tested.
  const { databases } = useAppSelector(connectedInstanceInfoSelector)

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

  const databasesCount =
    databases && databases > 0 ? databases : DEFAULT_DATABASES_COUNT

  // A picker instead of a free-form number: the previous input accepted
  // indexes the instance does not have, which only failed later at runtime.
  const dbOptions = Array.from({ length: databasesCount }, (_, index) => ({
    value: String(index),
    label: `db${index}`,
  }))

  return (
    <>
      <Row gap="s">
        <FlexItem>
          <FormField>
            <Checkbox
              id={id}
              name="showDb"
              labelSize="M"
              label={t('home.form.dbIndex.selectLogicalDb')}
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
            <FormField label={t('home.form.dbIndex.field.databaseIndex')}>
              <RiSelect
                options={dbOptions}
                value={String(formik.values.db ?? 0)}
                onChange={(value: string) =>
                  formik.setFieldValue('db', Number(value))
                }
                data-testid="db"
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
