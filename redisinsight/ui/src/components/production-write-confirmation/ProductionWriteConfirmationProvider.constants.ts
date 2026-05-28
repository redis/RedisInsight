/**
 * Stable identifiers for production-write confirmation requests.
 *
 * The user can opt to skip future confirmations for a given commandId for the
 * rest of the session (see ProductionWriteConfirmationProvider). Keeping all
 * ids in one place makes it easy to audit what can be skipped and to avoid
 * collisions across features.
 *
 * Two namespaces are in use:
 *  - `browser:*` — discrete browser key-details operations (one id per op type).
 *  - `cmd:*`    — arbitrary Redis commands run via CLI / Workbench. The skip
 *                 set is shared between CLI and Workbench, so opting out of a
 *                 verb in one feature also skips it in the other.
 */

export enum BrowserConfirmationCommandId {
  EditValue = 'browser:edit-value',
  EditRejsonValue = 'browser:edit-rejson-value',
  AddZsetMembers = 'browser:add-zset-members',
  AddListElements = 'browser:add-list-elements',
  AddSetMembers = 'browser:add-set-members',
  AddHashFields = 'browser:add-hash-fields',
  AddStreamEntry = 'browser:add-stream-entry',
  RenameKey = 'browser:rename-key',
  ChangeTtl = 'browser:change-ttl',
}

export const REDIS_CONFIRMATION_COMMAND_PREFIX = 'cmd:'
