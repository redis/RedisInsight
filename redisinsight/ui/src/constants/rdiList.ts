import { TFunction } from 'i18next'

export enum RdiListColumn {
  Name = 'name',
  Url = 'url',
  Version = 'version',
  LastConnection = 'lastConnection',
  Controls = 'controls',
}

// Built via a factory so headers resolve against the active language at render
// time (a module-level map would freeze the English values at import).
export const getRdiColumnFieldNameMap = (t: TFunction) =>
  new Map<RdiListColumn, string>([
    [RdiListColumn.Name, t('rdi.home.column.name')],
    [RdiListColumn.Url, t('rdi.home.column.url')],
    [RdiListColumn.Version, t('rdi.home.column.version')],
    [RdiListColumn.LastConnection, t('rdi.home.column.lastConnection')],
    [RdiListColumn.Controls, t('rdi.home.column.controls')],
  ])

export const DEFAULT_RDI_SHOWN_COLUMNS = [
  RdiListColumn.Name,
  RdiListColumn.Url,
  RdiListColumn.Version,
  RdiListColumn.LastConnection,
  RdiListColumn.Controls,
]
