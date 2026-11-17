import React, { useMemo } from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'
import { uniqBy } from 'lodash'
import { tagsSelector } from 'uiSrc/slices/instances/tags'
import { Text, Title } from 'uiSrc/components/base/text'
import { useTranslation } from 'uiSrc/i18n'
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
  const { t } = useTranslation()
  const { data: allTags } = useAppSelector(tagsSelector)
  const tagsSuggestions: SelectOption[] = useMemo(() => {
    const options = uniqBy(presetTagSuggestions.concat(allTags), (tag) =>
      targetKey ? tag.value : tag.key,
    )
      .filter(({ key, value }) => {
        if (targetKey !== undefined) {
          return key === targetKey && value !== '' && value.includes(searchTerm)
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
        label: targetKey
          ? t('home.databaseList.manageTags.suggestions.newValue', {
              term: searchTerm,
            })
          : t('home.databaseList.manageTags.suggestions.newTag', {
              term: searchTerm,
            }),
        value: searchTerm,
      })
    }

    return options
  }, [allTags, targetKey, searchTerm, currentTagKeys, t])

  if (tagsSuggestions.length === 0) {
    return null
  }

  return (
    <SuggestionsListWrapper data-testid="tag-suggestions">
      <Title size="XS" color="primary">
        {t('home.databaseList.manageTags.suggestions.title')}
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
