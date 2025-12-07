import React from 'react'
import { CodeButtonParams } from 'uiSrc/constants/workbench'
import { Nullable } from 'uiSrc/utils'

interface IContext {
  setScript: (
    script: string,
    params?: CodeButtonParams,
    onFinish?: () => void,
  ) => void
  openPage: (page: IInternalPage, fromUser?: boolean) => void
  isCodeBtnDisabled?: boolean
}
export interface IInternalPage {
  path: string
  manifestPath?: Nullable<string>
  label?: string
}
export const defaultValue = {
  setScript: (script: string) => script,
  openPage: (page: IInternalPage) => page,
  isCodeBtnDisabled: false,
}
const EnablementAreaContext = React.createContext<IContext>(defaultValue)
export const EnablementAreaProvider = EnablementAreaContext.Provider
export default EnablementAreaContext
