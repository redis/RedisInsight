import { ProductionWriteConfirmationRequest } from './ProductionWriteConfirmationProvider.types'
import { REDIS_CONFIRMATION_COMMAND_PREFIX } from './ProductionWriteConfirmationProvider.constants'

/**
 * Build the commandId used by CLI and Workbench for a Redis verb (e.g.
 * `FLUSHDB`). Callers should pass an already-uppercased verb.
 */
export const toRedisConfirmationCommandId = (verb: string): string =>
  `${REDIS_CONFIRMATION_COMMAND_PREFIX}${verb}`

/**
 * Normalize the optional commandId field of a confirmation request into an
 * array, so the provider can treat single and multi-id requests uniformly.
 */
export const toCommandIdArray = (
  commandId: ProductionWriteConfirmationRequest['commandId'],
): string[] => {
  if (!commandId) return []
  return Array.isArray(commandId) ? commandId : [commandId]
}
