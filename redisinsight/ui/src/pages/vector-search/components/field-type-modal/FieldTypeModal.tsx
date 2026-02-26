import React, { useCallback, useMemo } from 'react'
import { useFormik } from 'formik'
import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { CancelIcon } from 'uiSrc/components/base/icons'
import { Modal } from 'uiSrc/components/base/display'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { truncateText } from 'uiSrc/utils'
import { Text } from 'uiSrc/components/base/text'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import TextInput from 'uiSrc/components/base/inputs/TextInput'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'

import { MAX_SAMPLE_VALUE_LENGTH } from './FieldTypeModal.constants'
import { FieldTypeModalMode, FieldTypeModalProps } from './FieldTypeModal.types'
import { FieldTypeSelect } from './components/FieldTypeSelect/FieldTypeSelect'
import { FieldTypeForm } from './components/FieldTypeForm/FieldTypeForm'
import { FieldTypeFormValues } from './components/FieldTypeForm/FieldTypeForm.types'
import { useFieldTypeValidation } from './hooks/useFieldTypeValidation'
import { getInitialValues, buildFieldFromValues } from './FieldTypeModal.utils'
import * as S from './FieldTypeModal.styles'
import { Spacer } from 'uiSrc/components/base/layout'

export const FieldTypeModal = ({
  isOpen,
  mode,
  field,
  fields,
  onSubmit,
  onClose,
}: FieldTypeModalProps) => {
  const validate = useFieldTypeValidation(mode, fields, field)

  const initialValues = useMemo(
    () => getInitialValues(mode, field),
    [mode, field],
  )

  const formik = useFormik<FieldTypeFormValues>({
    initialValues,
    validate,
    enableReinitialize: true,
    validateOnMount: true,
    onSubmit: (values) => {
      onSubmit(buildFieldFromValues(values, mode, field))
    },
  })

  const handleFieldTypeChange = useCallback(
    (newType: FieldTypes) => {
      formik.setFieldValue('fieldType', newType)
    },
    [formik],
  )

  const handleClose = useCallback(() => {
    formik.resetForm()
    onClose()
  }, [formik, onClose])

  const isCreateMode = mode === FieldTypeModalMode.Create
  const title = isCreateMode ? 'Add field' : 'Edit field'

  if (!isOpen) return null

  return (
    <Modal.Compose open={isOpen}>
      <S.ModalContent persistent onCancel={handleClose}>
        <Modal.Content.Close icon={CancelIcon} onClick={handleClose} />
        <Modal.Content.Header.Compose>
          <Modal.Content.Header.Title>{title}</Modal.Content.Header.Title>
        </Modal.Content.Header.Compose>

        <S.ModalBody
          content={
            <Col gap="l" data-testid="field-type-modal-form">
              {isCreateMode ? (
                <FormField label="Field name" required>
                  <TextInput
                    value={formik.values.fieldName}
                    onChange={(value: string) =>
                      formik.setFieldValue('fieldName', value)
                    }
                    onBlur={formik.handleBlur}
                    name="fieldName"
                    placeholder="Enter field name"
                    error={
                      formik.touched.fieldName
                        ? formik.errors.fieldName
                        : undefined
                    }
                    data-testid="field-type-modal-field-name"
                  />
                </FormField>
              ) : (
                <>
                  <Col
                    gap="s"
                    data-testid="field-type-modal-field-name-readonly"
                  >
                    <Text color="secondary" component="span">
                      Field name:
                    </Text>
                    <S.FieldValue color="primary" component="span">
                      {field?.name}
                    </S.FieldValue>
                  </Col>
                  <Col gap="s" data-testid="field-type-modal-sample-value">
                    <Text color="secondary" component="span">
                      Field sample value:
                    </Text>
                    <S.FieldValue color="primary" component="span">
                      {truncateText(
                        String(field?.value ?? ''),
                        MAX_SAMPLE_VALUE_LENGTH,
                      )}
                      {field?.value != null &&
                        String(field.value).length >=
                          MAX_SAMPLE_VALUE_LENGTH && (
                          <S.InlineCopyButton
                            copy={String(field.value)}
                            data-testid="field-type-modal-sample-value-copy"
                          />
                        )}
                    </S.FieldValue>
                  </Col>
                </>
              )}

              <Text color="secondary">
                You can change the field type for this field. Keep in mind that
                changing the field type will affect how the field is indexed and
                queried.
              </Text>

              <FieldTypeSelect
                value={formik.values.fieldType}
                onChange={handleFieldTypeChange}
                dataTestId="field-type-modal-field-type"
              />

              <Spacer size="xs" />
              <FieldTypeForm formik={formik} />
            </Col>
          }
        />

        <Modal.Content.Footer.Compose>
          <Row gap="m" justify="end">
            <SecondaryButton
              size="l"
              onClick={handleClose}
              data-testid="field-type-modal-cancel"
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              size="l"
              onClick={() => formik.handleSubmit()}
              disabled={!formik.isValid}
              data-testid="field-type-modal-save"
            >
              {isCreateMode ? 'Add' : 'Save'}
            </PrimaryButton>
          </Row>
        </Modal.Content.Footer.Compose>
      </S.ModalContent>
    </Modal.Compose>
  )
}
