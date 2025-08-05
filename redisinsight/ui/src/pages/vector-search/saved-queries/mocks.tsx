import React from 'react'

import { SavedIndex } from './types'
import { SavedQueriesScreen } from './SavedQueriesScreen'

export const savedIndexes: SavedIndex[] = [
  {
    value: 'bicycle_index',
    tags: ['tag', 'text', 'vector'],
    queries: [
      {
        label: 'Search for similar movies in the "Music" genre',
        value: 'FT.SEARCH idx:movie "@genre:Music"',
      },
      {
        label: 'Search for similar animated and sci-fi movies',
        value: 'FT.SEARCH idx:movie "@genre:Animation @genre:Sci-Fi"',
      },
      {
        label:
          'Look up "an exciting animated tale of mythical creatures and bravery" via semantic search.',
        value: 'FT.SEARCH idx:movie "@title:Inception"',
      },
    ],
  },
  {
    value: 'restaurant_index',
    tags: ['text', 'vector'],
    queries: [
      {
        label: 'Search for similar movies in the "Music" genre',
        value: 'FT.SEARCH idx:movie "@genre:Music"',
      },
      {
        label: 'Search for similar animated and sci-fi movies',
        value: 'FT.SEARCH idx:movie "@genre:Animation @genre:Sci-Fi"',
      },
    ],
  },
]

export const DummySavedQueriesScreen = () => (
  <SavedQueriesScreen
    savedIndexes={savedIndexes}
    selectedIndex={savedIndexes[0]}
    onIndexChange={() => {}}
    onQueryInsert={() => {}}
  />
)
