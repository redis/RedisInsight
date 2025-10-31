import React from 'react'
import { FormikProps } from 'formik'

import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import Divider from 'uiSrc/components/divider/Divider'
import {
  DbCompressor,
  KeyFormatSelector,
} from 'uiSrc/pages/home/components/form'

const DecompressionAndFormatters = ({
  formik,
}: {
  formik: FormikProps<DbConnectionInfo>
}) => (
  <>
    <DbCompressor formik={formik} />

    <Divider
      colorVariable="separatorColor"
      variant="fullWidth"
    />

    <KeyFormatSelector formik={formik} />
  </>
)

export default DecompressionAndFormatters
