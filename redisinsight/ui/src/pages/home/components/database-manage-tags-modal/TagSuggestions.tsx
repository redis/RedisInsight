import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { uniqBy } from 'lodash'
import { tagsSelector } from 'uiSrc/slices/instances/tags'
import { Text, Title } from 'uiSrc/components/base/text'
import { presetTagSuggestions } from './constants'
import { SuggestionsListWrapper } from './TagSuggestions.styles'

type SelectOption = {
  label: string
  value: string
}

export type TagSuggestionsProps = {
  targetKey?: string
  searchTerm: string
  currentTagKeys: Set<string>
  onChange: (value: string) => void
}

export const TagSuggestions = ({
  targetKey,
  searchTerm,
  currentTagKeys,
  onChange,
}: TagSuggestionsProps) => {
  const { data: allTags } = useSelector(tagsSelector)
  const tagsSuggestions: SelectOption[] = useMemo(() => {
      const options = uniqBy(presetTagSuggestions.concat(allTags), (tag) =>
        targetKey ? tag.value : tag.key,
      )
        .filter(({ key, value }) => {
          if (targetKey !== undefined) {
            return (
              key === targetKey && value !== '' && value.includes(searchTerm)
            )
          }

          return (
            key.includes(searchTerm) &&
            (!currentTagKeys.has(key) || key === searchTerm)
          )
        })
        .map(({ key, value }) => ({
          label: targetKey ? value : key,
          value: targetKey ? value : key,
        }))

      const isNewTag = options.length === 0 && searchTerm

      if (isNewTag) {
        options.push({
          label: `${searchTerm} (new ${targetKey ? 'value' : 'tag'})`,
          value: searchTerm,
        })
      }

      return options
    }, [allTags, targetKey, searchTerm, currentTagKeys])

  if (tagsSuggestions.length === 0) {
    return null
  }

  return (
    <SuggestionsListWrapper data-testid="tag-suggestions">
      <Title size="XS" color="primary">
        Suggestions
      </Title>
      <ul role="list">
        {tagsSuggestions.map((option) => (
          <li
            role="listitem"
            key={option.value}
            onClick={() => onChange(option.value)}
          >
            <Text>{option.label}</Text>
          </li>
        ))}
      </ul>
    </SuggestionsListWrapper>
  )
}
