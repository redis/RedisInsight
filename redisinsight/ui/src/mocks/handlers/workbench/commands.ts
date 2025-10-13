import { rest, RestHandler } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { getUrl } from 'uiSrc/utils'
import { CommandExecution } from 'uiSrc/slices/interfaces'
import { commandExecutionFactory } from 'uiSrc/mocks/factories/workbench/commandExectution.factory'
import { INSTANCE_ID_MOCK } from '../instances/instancesHandlers'

const handlers: RestHandler[] = [
  rest.get<CommandExecution[]>(
    getMswURL(
      getUrl(INSTANCE_ID_MOCK, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
    ),
    async (_req, res, ctx) =>
      res(ctx.status(200), ctx.json(commandExecutionFactory.buildList(1))),
  ),
  rest.post<CommandExecution[]>(
    getMswURL(
      getUrl(INSTANCE_ID_MOCK, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
    ),
    async (_req, res, ctx) =>
      res(ctx.status(200), ctx.json(commandExecutionFactory.buildList(1))),
  ),
]

export default handlers
