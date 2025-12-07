import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import {
  CommandExecution,
  CommandExecutionResult,
  CommandExecutionType,
  CommandExecutionUI,
  ResultsMode,
  RunQueryMode,
} from 'uiSrc/slices/interfaces'

export const commandExecutionFactory = Factory.define<CommandExecution>(
  ({ sequence }) => ({
    id: sequence.toString() ?? faker.string.uuid(),
    databaseId: faker.string.uuid(),
    db: faker.number.int({ min: 0, max: 15 }),
    type: faker.helpers.enumValue(CommandExecutionType),
    mode: faker.helpers.enumValue(RunQueryMode),
    resultsMode: faker.helpers.enumValue(ResultsMode),
    command: faker.lorem.paragraph(),
    result: commandExecutionResultFactory.buildList(1),
    executionTime: faker.number.int({ min: 1000, max: 5000 }),
    createdAt: faker.date.past(),
  }),
)

export const commandExecutionResultFactory =
  Factory.define<CommandExecutionResult>(() => {
    const includeSizeLimitExceeded = faker.datatype.boolean()

    return {
      status: faker.helpers.enumValue(CommandExecutionStatus),
      response: faker.lorem.paragraph(),

      // Optional properties
      ...(includeSizeLimitExceeded && {
        sizeLimitExceeded: faker.datatype.boolean(),
      }),
    }
  })

export const commandExecutionUIFactory = Factory.define<CommandExecutionUI>(
  () => {
    const commandExecution = commandExecutionFactory.build() as CommandExecution

    const includeLoading = faker.datatype.boolean()
    const includeIsOpen = faker.datatype.boolean()
    const includeError = faker.datatype.boolean()
    const includeEmptyCommand = faker.datatype.boolean()

    return {
      ...commandExecution,

      // Optional properties
      ...(includeLoading && {
        loading: faker.datatype.boolean(),
      }),
      ...(includeIsOpen && {
        isOpen: faker.datatype.boolean(),
      }),
      ...(includeError && {
        error: faker.lorem.sentence(),
      }),
      ...(includeEmptyCommand && {
        emptyCommand: faker.datatype.boolean(),
      }),
    }
  },
)
