import React, { ChangeEvent } from 'react'
import { FormikProps } from 'formik'

import { KeyValueCompressor } from 'uiSrc/constants'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { NONE } from 'uiSrc/pages/home/constants'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { Text } from 'uiSrc/components/base/text/Text'
import { useGenerateId } from 'uiSrc/components/base/utils/hooks/generate-id'
export interface Props {
  formik: FormikProps<DbConnectionInfo>
}

const DbCompressor = (props: Props) => {
  const { formik } = props

  const optionsCompressor = [
    {
      value: NONE,
      label: 'No decompression',
    },
    {
      value: KeyValueCompressor.GZIP,
      label: 'GZIP',
    },
    {
      value: KeyValueCompressor.LZ4,
      label: 'LZ4',
    },
    {
      value: KeyValueCompressor.SNAPPY,
      label: 'SNAPPY',
    },
    {
      value: KeyValueCompressor.ZSTD,
      label: 'ZSTD',
    },
    {
      value: KeyValueCompressor.Brotli,
      label: 'Brotli',
    },
    {
      value: KeyValueCompressor.PHPGZCompress,
      label: 'PHP GZCompress',
    },
  ]

  const handleChangeDbCompressorCheckbox = (
    e: ChangeEvent<HTMLInputElement>,
  ): void => {
    const isChecked = e.target.checked
    if (!isChecked) {
      // Reset db field to initial value
      formik.setFieldValue('compressor', NONE)
    }
    formik.setFieldValue('showCompressor', isChecked)
  }
  const id = useGenerateId('', ' over db compressor')

  return (
    <>
      <Row gap="m" responsive={false}>
        <FlexItem>
          <FormField>
            <Checkbox
              id={id}
              name="showCompressor"
              label={<Text>Enable Automatic Data Decompression</Text>}
              checked={!!formik.values.showCompressor}
              onChange={handleChangeDbCompressorCheckbox}
              data-testid="showCompressor"
            />
          </FormField>
        </FlexItem>
      </Row>

      {formik.values.showCompressor && (
        <Row gap="m">
          <FlexItem grow>
            <FormField label="Decompression format">
              <RiSelect
                name="compressor"
                placeholder="Decompression format"
                value={formik.values.compressor ?? NONE}
                options={optionsCompressor}
                onChange={(value) => {
                  formik.setFieldValue('compressor', value || NONE)
                }}
                data-testid="select-compressor"
              />
            </FormField>
          </FlexItem>
          <FlexItem grow />
        </Row>
      )}
    </>
  )
}

export default DbCompressor
