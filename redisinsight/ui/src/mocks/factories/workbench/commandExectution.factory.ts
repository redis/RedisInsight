import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import { CommandExecution, CommandExecutionUI } from 'uiSrc/slices/interfaces'

// Note: Types are temporaryly not binded properly due to issues in the Jset setup
// SyntaxError: redisinsight/api/src/modules/workbench/models/command-execution.ts: Support for the experimental syntax 'decorators' isn't currently enabled (32:3):

// export const commandExecutionFactory = Factory.define<CommandExecution>(
export const commandExecutionFactory = Factory.define(({ sequence }) => ({
  id: sequence.toString() ?? faker.string.uuid(),
  databaseId: faker.string.ulid(),
  db: faker.number.int({ min: 0, max: 15 }),
  type: faker.helpers.arrayElement(['WORKBENCH', 'SEARCH']), // faker.helpers.enumValue(CommandExecutionType),
  mode: faker.helpers.arrayElement(['RAW', 'ASCII']), // faker.helpers.enumValue(RunQueryMode),
  resultsMode: faker.helpers.arrayElement(['DEFAULT', 'GROUP_MODE', 'SILENT']), // faker.helpers.enumValue(ResultsMode),
  command: faker.lorem.paragraph(),
  result: commandExecutionResultFactory.buildList(1),
  executionTime: faker.number.int({ min: 1000, max: 5000 }),
  createdAt: faker.date.past(),
}))

// export const commandExecutionResultFactory = Factory.define<CommandExecutionResult>(() => {
export const commandExecutionResultFactory = Factory.define(() => {
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
