import { upperFirst } from 'lodash'
import React from 'react'
import i18n from 'uiSrc/i18n'

export const rdiErrorMessages = {
  invalidStructure: (
    name: string = i18n.t('rdi.pipeline.error.defaultName'),
    msg: string = i18n.t('rdi.pipeline.error.defaultMsg'),
  ) => (
    <>
      {i18n.t('rdi.pipeline.invalidStructure', { name: upperFirst(name) })}
      <br />
      {msg}
    </>
  ),
}
