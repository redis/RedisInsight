import React from 'react'
import { FormikProps } from 'formik'

import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import Divider from 'uiSrc/components/divider/Divider'
import {
  DbCompressor,
  KeyFormatSelector,
} from 'uiSrc/pages/home/components/form'
import { Spacer } from 'uiSrc/components/base/layout'

const DecompressionAndFormatters = ({
  formik,
}: {
  formik: FormikProps<DbConnectionInfo>
}) => (
  <>
    <DbCompressor formik={formik} />
    <Spacer size="m" />
    <Divider colorVariable="separatorColor" variant="fullWidth" />
    <Spacer size="m" />
    <KeyFormatSelector formik={formik} />
  </>
)

export default DecompressionAndFormatters
