import { CellContext } from 'uiSrc/components/base/layout/table'
import { ModifiedClusterNodes } from '../../ClusterDetailsPage'

export type ClusterNodesTableProps = {
  nodes: ModifiedClusterNodes[]
}

export type ClusterNodesTableCell = (
  props: CellContext<ModifiedClusterNodes, unknown>,
) => React.ReactElement<any, any> | null
