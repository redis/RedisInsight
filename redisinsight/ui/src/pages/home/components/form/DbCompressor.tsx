import React, { ChangeEvent } from 'react'
import { FormikProps } from 'formik'

import { KeyValueCompressor } from 'uiSrc/constants'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { NONE } from 'uiSrc/pages/home/constants'
import { RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import { RiCheckbox, RiFormField, RiSelect } from 'uiSrc/components/base/forms'
import { useGenerateId } from 'uiSrc/components/base/utils'

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
      <RiRow gap="m" responsive={false}>
        <RiFlexItem>
          <RiFormField>
            <RiCheckbox
              id={id}
              name="showCompressor"
              label="Enable Automatic Data Decompression"
              checked={!!formik.values.showCompressor}
              onChange={handleChangeDbCompressorCheckbox}
              data-testid="showCompressor"
            />
          </RiFormField>
        </RiFlexItem>
      </RiRow>

      {formik.values.showCompressor && (
        <>
          <RiSpacer />
          <RiRow gap="m">
            <RiFlexItem grow>
              <RiFormField label="Decompression format">
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
              </RiFormField>
            </RiFlexItem>
            <RiFlexItem grow />
          </RiRow>
        </>
      )}
    </>
  )
}

export default DbCompressor
