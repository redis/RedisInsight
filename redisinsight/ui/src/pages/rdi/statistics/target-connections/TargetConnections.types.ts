import { IConnections } from 'uiSrc/slices/interfaces'

export type ConnectionData = {
  name: string
  status: string
  type: string
  hostPort: string
  database: string
  user: string
}

export interface TargetConnectionsProps {
  data: IConnections
}
