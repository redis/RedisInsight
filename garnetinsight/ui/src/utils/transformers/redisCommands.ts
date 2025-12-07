import { ICommand, ICommands, ICommandTokenType } from 'uiSrc/constants'

export const mergeRedisCommandsSpecs = (
  initialSpec: ICommands,
  updatedSpec: ICommands,
): ICommand[] =>
  Object.keys(initialSpec).map((name) => ({
    name,
    token: name,
    type: ICommandTokenType.Block,
    ...(name in updatedSpec ? updatedSpec[name] : initialSpec[name] || {}),
  }))
