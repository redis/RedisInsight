import { TabInfo } from 'uiSrc/components/base/layout/tabs'

export enum ManualFormTab {
  General = 'general',
  Security = 'security',
  Decompression = 'decompression',
}

export const MANUAL_FORM_TABS: TabInfo[] = [
  {
    value: ManualFormTab.General,
    label: 'home.form.manual.tab.general',
    content: null,
  },
  {
    value: ManualFormTab.Security,
    label: 'home.form.manual.tab.security',
    content: null,
  },
  {
    value: ManualFormTab.Decompression,
    label: 'home.form.manual.tab.decompression',
    content: null,
  },
]

export const AZURE_READONLY_FIELDS = ['host', 'port', 'username', 'password']
