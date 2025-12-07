import { EuiComboBoxOptionOption } from '@elastic/eui'

export const comboBoxToArray = (items: EuiComboBoxOptionOption[]) =>
  [...items].map(({ label }) => label)
