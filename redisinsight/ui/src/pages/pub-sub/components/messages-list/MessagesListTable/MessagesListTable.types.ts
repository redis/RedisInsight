import { ReactElement } from 'react'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { PubSubMessage } from 'uiSrc/slices/interfaces'

export type IMessagesListTableCell = (
  props: CellContext<PubSubMessage, unknown>,
) => ReactElement<any, any> | null
