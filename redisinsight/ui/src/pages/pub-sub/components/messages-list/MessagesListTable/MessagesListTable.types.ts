import { ReactElement } from 'react'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { IMessage } from 'apiSrc/modules/pub-sub/interfaces/message.interface'

export type IMessagesListTableCell = (
  props: CellContext<IMessage, unknown>,
) => ReactElement<any, any> | null
