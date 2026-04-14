import * as monacoEditor from 'monaco-editor'

import { bufferToString, formatLongName } from 'uiSrc/utils'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { OnboardingTemplate } from './QueryEditor.types'

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
 * Resolves the preferred index into a snippet string.
 *
 * When `activeIndexName` is provided (the index from the current URL),
 * it is inserted as **fixed text** so that Tab skips straight to the
 * query placeholder.  Otherwise the index is an editable tab-stop.
 *
 * Returns `{ snippet, isFixed }` so that `getInsertText` can number
 * subsequent tab-stops correctly.
 */
const getIndexSnippet = (
  indexes: RedisResponseBuffer[],
  activeIndexName?: string,
): { snippet: string; isFixed: boolean } => {
  if (activeIndexName !== undefined) {
    return { snippet: `'${activeIndexName}'`, isFixed: true }
  }
  if (indexes.length === 0) {
    return { snippet: '${1:index}', isFixed: false }
  }

  const name = formatLongName(bufferToString(indexes[0]))
  return { snippet: `'\${1:${name}}'`, isFixed: false }
}

/**
 * Builds the snippet insert-text for a given command.
 *
 * When the index is fixed (active index from the URL), subsequent
 * tab-stops start at `$1`.  When the index itself is a tab-stop,
 * they start at `$2`.
 */
const getInsertText = (
  command: string,
  indexSnippet: string,
  isIndexFixed: boolean,
): string => {
  const n = isIndexFixed ? 1 : 2

  switch (command) {
    case 'FT.SEARCH':
      return `FT.SEARCH ${indexSnippet} "\${${n}:*}"`
    case 'FT.AGGREGATE':
      return `FT.AGGREGATE ${indexSnippet} "\${${n}:*}"`
    case 'FT.SUGGET':
      return 'FT.SUGGET ${1:key} ${2:prefix}'
    case 'FT.SPELLCHECK':
      return `FT.SPELLCHECK ${indexSnippet} "\${${n}:query}"`
    case 'FT.EXPLAIN':
      return `FT.EXPLAIN ${indexSnippet} "\${${n}:*}"`
    case 'FT.PROFILE':
      return `FT.PROFILE ${indexSnippet} SEARCH QUERY "\${${n}:*}"`
    case 'FT._LIST':
      return 'FT._LIST'
    default:
      return command
  }
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
  activeIndexName?: string,
): monacoEditor.languages.CompletionItem[] => {
  const { snippet, isFixed } = getIndexSnippet(indexes, activeIndexName)

  return ONBOARDING_TEMPLATES.map((t, i) => ({
    label: t.command,
    kind: monacoEditor.languages.CompletionItemKind.Snippet,
    detail: t.detail,
    documentation: {
      value: `**${t.command}** — ${t.detail}\n\n[Documentation](${getDocUrl(t.command)})`,
    },
    insertText: getInsertText(
      t.command,
      t.usesIndex ? snippet : '',
      t.usesIndex && isFixed,
    ),
    insertTextRules:
      monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range: EMPTY_EDITOR_RANGE,
    sortText: `!${String(i).padStart(2, '0')}`,
  })) as monacoEditor.languages.CompletionItem[]
}
