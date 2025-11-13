export const RDI_LIST_STORAGE_KEY = 'rdi-list'

export enum RdiListColumn {
  Name = 'name',
  Url = 'url',
  Version = 'version',
  LastConnection = 'lastConnection',
  Controls = 'controls',
}

export const RDI_COLUMN_FIELD_NAME_MAP = new Map<RdiListColumn, string>([
  [RdiListColumn.Name, 'RDI alias'],
  [RdiListColumn.Url, 'URL'],
  [RdiListColumn.Version, 'RDI version'],
  [RdiListColumn.LastConnection, 'Last connection'],
  [RdiListColumn.Controls, ''],
])
