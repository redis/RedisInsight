export enum ImportTableResultColumn {
  Index = 'index',
  Host = 'host',
  Errors = 'errors',
}

export const TABLE_IMPORT_RESULT_COLUMN_ID_HEADER_MAP = new Map<
  ImportTableResultColumn,
  string
>([
  [ImportTableResultColumn.Index, '#'],
  [ImportTableResultColumn.Host, 'Host:Port'],
  [ImportTableResultColumn.Errors, 'Result'],
])

export enum ImportDatabaseResultType {
  Success = 'success',
  Partial = 'partial',
  Failed = 'failed',
}
