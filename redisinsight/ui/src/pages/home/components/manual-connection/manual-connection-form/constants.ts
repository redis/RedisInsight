import { TabInfo } from 'uiSrc/components/base/layout/tabs'

export enum ManualFormTab {
  General = 'general',
  Security = 'security',
  Decompression = 'decompression',
}

export const MANUAL_FORM_TABS: TabInfo[] = [
  { value: ManualFormTab.General, label: 'General', content: null },
  { value: ManualFormTab.Security, label: 'Security', content: null },
  {
    value: ManualFormTab.Decompression,
    label: 'Decompression & Formatters',
    content: null,
  },
]

export const AZURE_READONLY_FIELDS = ['host', 'port', 'username', 'password']
