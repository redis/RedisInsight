import NoQueryResultsIcon from 'uiSrc/assets/img/vector-search/no-query-results.svg'
import NoIndexesIcon from 'uiSrc/assets/img/vector-search/no-indexes.svg'
import NoSavedQueries from 'uiSrc/assets/img/vector-search/no-saved-queries.svg'

export enum NoDataMessageKeys {
  NoQueryResults = 'no-query-results',
  ManageIndexes = 'manage-indexes',
  SavedQueries = 'saved-queries',
}

export interface NoDataMessageDetails {
  title: string
  description: string
  icon: string
}

export const NO_DATA_MESSAGES: Record<NoDataMessageKeys, NoDataMessageDetails> =
  {
    [NoDataMessageKeys.NoQueryResults]: {
      title: 'No search results.',
      description:
        'Start with vector search onboarding to explore sample data, or create an index and write queries in the smart editor.',
      icon: NoQueryResultsIcon,
    },
    [NoDataMessageKeys.ManageIndexes]: {
      title: 'No indexes.',
      description:
        'Start with vector search onboarding to explore sample data, or create an index and write queries in the smart editor.',
      icon: NoIndexesIcon,
    },
    [NoDataMessageKeys.SavedQueries]: {
      title: 'No saved queries.',
      description:
        'Start with vector search onboarding to explore sample data, or write queries in the smart editor.',
      icon: NoSavedQueries,
    },
  }
