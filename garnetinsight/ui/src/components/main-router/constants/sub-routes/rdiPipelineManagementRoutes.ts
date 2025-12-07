import { IRoute, Pages } from 'uiSrc/constants'
import ConfigPage from 'uiSrc/pages/rdi/pipeline-management/pages/config'
import JobPage from 'uiSrc/pages/rdi/pipeline-management/pages/job'

export const RDI_PIPELINE_MANAGEMENT_ROUTES: IRoute[] = [
  {
    path: Pages.rdiPipelineConfig(':rdiInstanceId'),
    component: ConfigPage,
  },
  {
    path: Pages.rdiPipelineJobs(':rdiInstanceId', ':jobName'),
    component: JobPage,
  },
]
