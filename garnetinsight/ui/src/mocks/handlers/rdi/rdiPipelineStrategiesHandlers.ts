import { http, HttpHandler, HttpResponse } from 'msw'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { getRdiUrl } from 'uiSrc/utils'
import { ApiEndpoints } from 'uiSrc/constants'

const MOCK_RDI_STRATEGIES = {
  'strategy-type': [
    {
      label: 'Ingest',
      value: 'ingest',
    },
    {
      label: 'Write behind',
      value: 'write-behind',
    },
  ],
  'db-type': [
    {
      label: 'SQL Server',
      value: 'sql',
    },
    {
      label: 'Oracle',
      value: 'oracle',
    },
    {
      label: 'MySQL',
      value: 'my-sql',
    },
    {
      label: 'MariaDB',
      value: 'maria-db',
    },
    {
      label: 'Cassandra',
      value: 'cassandra',
    },
  ],
}

const handlers: HttpHandler[] = [
  // fetch rdi strategies
  http.get(
    getMswURL(getRdiUrl('rdiInstanceId', ApiEndpoints.RDI_PIPELINE_STRATEGIES)),
    async () => {
      return HttpResponse.json(MOCK_RDI_STRATEGIES, { status: 200 })
    },
  ),
]

export default handlers
