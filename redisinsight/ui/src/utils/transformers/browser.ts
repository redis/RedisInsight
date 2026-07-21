import type { AutoTagOption } from 'uiSrc/components/base/forms/combo-box/AutoTag'

export const comboBoxToArray = (items: AutoTagOption[]) =>
  [...items].map(({ label }) => label)
