import { FormikProps } from 'formik'

import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'

export interface EnvironmentSelectProps {
  formik: FormikProps<DbConnectionInfo>
}
