export enum PubSubTableColumn {
  Timestamp = 'time',
  Channel = 'channel',
  Message = 'message',
}

export const PUB_SUB_TABLE_COLUMN_FIELD_NAME_MAP = new Map<
  PubSubTableColumn,
  string
>([
  [PubSubTableColumn.Timestamp, 'Timestamp'],
  [PubSubTableColumn.Channel, 'Channel'],
  [PubSubTableColumn.Message, 'Message'],
])
