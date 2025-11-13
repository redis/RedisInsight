import { IMessage } from 'apiSrc/modules/pub-sub/interfaces/message.interface'
import { ColumnDef } from 'uiSrc/components/base/layout/table'

export const MessageColumn = (): ColumnDef<IMessage> => {
  return {
    id: 'message',
    header: 'Message',
    accessorKey: 'message',
  }
}
