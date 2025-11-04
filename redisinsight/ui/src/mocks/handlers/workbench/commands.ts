import { http, HttpHandler, HttpResponse } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { getUrl } from 'uiSrc/utils'
import { CommandExecution } from 'uiSrc/slices/interfaces'
import { commandExecutionFactory } from 'uiSrc/mocks/factories/workbench/commandExectution.factory'
import { INSTANCE_ID_MOCK } from '../instances/instancesHandlers'

const handlers: RestHandler[] = [
  http.get(
    getMswURL(
      getUrl(INSTANCE_ID_MOCK, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
    ),
    async () =>
      HttpResponse.json(commandExecutionFactory.buildList(1), {status: 200}),
  ),
  http.get(
    getMswURL(
      getUrl(
        INSTANCE_ID_MOCK,
        `${ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS}/:commandId`,
      ),
    ),
    async () =>
      HttpResponse.json(commandExecutionFactory.build(), {status: 200}),
  ),
http.post(
    getMswURL(
      getUrl(INSTANCE_ID_MOCK, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
    ),
    async () => {
      return HttpResponse.json(commandExecutionFactory.buildList(1), {
        status: 200,
      })
    },
  ),
  http.delete(
    getMswURL(
      getUrl(
        INSTANCE_ID_MOCK,
        `${ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS}/:commandId`,
      ),
    ),
    async () => HttpResponse.text('', {status: 200}),
  ),
  http.delete(
    getMswURL(
      getUrl(INSTANCE_ID_MOCK, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
    ),
    async () => HttpResponse.text('', {status: 200}),
  ),
]

export default handlers
