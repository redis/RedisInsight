import * as monacoEditor from 'monaco-editor'

import { bufferToString, formatLongName } from 'uiSrc/utils'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { getUtmExternalLink } from 'uiSrc/utils/links'

export interface OnboardingTemplate {
  /** The Redis command name (used as the suggestion label). */
  command: string
  /** Short description shown as the suggestion detail. */
  detail: string
  /** Whether the template includes an index argument placeholder. */
  usesIndex: boolean
}

/**
 * Predefined RQE query templates for the Vector Search onboarding panel.
 * Shown when the editor is empty and receives focus.
 *
 * List per RI-7928 ticket (exact list TBD with Product).
 */
export const ONBOARDING_TEMPLATES: OnboardingTemplate[] = [
  {
    command: 'FT.SEARCH',
    detail: 'Find documents by text or filters',
    usesIndex: true,
  },
  {
    command: 'FT.AGGREGATE',
    detail: 'Group and summarize results',
    usesIndex: true,
  },
  {
    command: 'FT.SUGGET',
    detail: 'Retrieve autocomplete suggestions',
    usesIndex: false,
  },
  {
    command: 'FT.SPELLCHECK',
    detail: 'Suggest corrections for typos',
    usesIndex: true,
  },
  {
    command: 'FT.EXPLAIN',
    detail: 'See execution plan',
    usesIndex: true,
  },
  {
    command: 'FT.PROFILE',
    detail: 'Analyze performance',
    usesIndex: true,
  },
  {
    command: 'FT._LIST',
    detail: 'View index schema and stats',
    usesIndex: false,
  },
]

/** Default range for an empty editor (cursor at 1:1). */
const EMPTY_EDITOR_RANGE: monacoEditor.IRange = {
  startLineNumber: 1,
  startColumn: 1,
  endLineNumber: 1,
  endColumn: 1,
}

const getDocUrl = (command: string): string =>
  getUtmExternalLink(`https://redis.io/commands/${command.toLowerCase()}/`, {
    campaign: 'vector_search',
  })

/**
 * Builds the snippet insert-text for a given command.
 * When `indexSnippet` is provided, it is substituted into templates
 * that use an index argument.
 */
const getInsertText = (command: string, indexSnippet: string): string => {
  switch (command) {
    case 'FT.SEARCH':
      return `FT.SEARCH ${indexSnippet} "\${2:*}"`
    case 'FT.AGGREGATE':
      return `FT.AGGREGATE ${indexSnippet} "\${2:*}"`
    case 'FT.SUGGET':
      return 'FT.SUGGET ${1:key} ${2:prefix}'
    case 'FT.SPELLCHECK':
      return `FT.SPELLCHECK ${indexSnippet} "\${2:query}"`
    case 'FT.EXPLAIN':
      return `FT.EXPLAIN ${indexSnippet} "\${2:*}"`
    case 'FT.PROFILE':
      return `FT.PROFILE ${indexSnippet} SEARCH QUERY "\${2:*}"`
    case 'FT._LIST':
      return 'FT._LIST'
    default:
      return command
  }
}

/**
 * Resolves the first available index into a snippet tab-stop string.
 * - With an index: `'${1:myindex}'`
 * - Without:       `${1:index}`
 */
const getIndexSnippet = (indexes: RedisResponseBuffer[]): string => {
  if (indexes.length === 0) return '${1:index}'

  const name = formatLongName(bufferToString(indexes[0]))
  return `'\${1:${name}}'`
}

/**
 * Builds the predefined RQE query-template suggestions shown when the
 * Vector Search editor is empty and receives focus ("onboarding").
 *
 * - Shows query details first (via `detail`).
 * - Full documentation is expandable in the Monaco details panel.
 * - Templates are **index-aware**: when available indexes exist, the
 *   first index name is pre-filled in snippet tab-stop placeholders.
 * - Uses `sortText` starting with `!` so templates sort before any
 *   regular command suggestions.
 */
export const getOnboardingSuggestions = (
  indexes: RedisResponseBuffer[] = [],
): monacoEditor.languages.CompletionItem[] => {
  const indexSnippet = getIndexSnippet(indexes)

  return ONBOARDING_TEMPLATES.map((t, i) => ({
    label: t.command,
    kind: monacoEditor.languages.CompletionItemKind.Snippet,
    detail: t.detail,
    documentation: {
      value: `**${t.command}** — ${t.detail}\n\n[Documentation](${getDocUrl(t.command)})`,
    },
    insertText: getInsertText(t.command, t.usesIndex ? indexSnippet : ''),
    insertTextRules:
      monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range: EMPTY_EDITOR_RANGE,
    sortText: `!${String(i).padStart(2, '0')}`,
  })) as monacoEditor.languages.CompletionItem[]
}
