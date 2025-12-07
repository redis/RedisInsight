export enum DatabaseListColumn {
  Name = 'name',
  Host = 'host',
  ConnectionType = 'connectionType',
  Modules = 'modules',
  LastConnection = 'lastConnection',
  Tags = 'tags',
  Controls = 'controls',
}

export const COLUMN_FIELD_NAME_MAP = new Map<DatabaseListColumn, string>([
  [DatabaseListColumn.Name, 'Database Alias'],
  [DatabaseListColumn.Host, 'Host:Port'],
  [DatabaseListColumn.ConnectionType, 'Connection Type'],
  [DatabaseListColumn.Modules, 'Capabilities'],
  [DatabaseListColumn.LastConnection, 'Last connection'],
  [DatabaseListColumn.Tags, 'Tags'],
  [DatabaseListColumn.Controls, 'Controls'],
])
