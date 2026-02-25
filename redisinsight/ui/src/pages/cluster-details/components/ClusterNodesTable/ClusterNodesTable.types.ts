import { CellContext } from 'uiSrc/components/base/layout/table'
import { ModifiedClusterNodes } from '../../ClusterDetailsPage'

export type ClusterNodesTableProps = {
  nodes: ModifiedClusterNodes[]
  loading: boolean
  dataLoaded: boolean
}

export type ClusterNodesTableCell = (
  props: CellContext<ModifiedClusterNodes, unknown>,
) => React.ReactElement<any, any> | null
