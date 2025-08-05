import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { EuiSelectable, EuiSelectableOption } from '@elastic/eui'
import { uniqBy } from 'lodash'
import { tagsSelector } from 'uiSrc/slices/instances/tags'
import { RiText } from 'uiSrc/components/base/text'
import { presetTagSuggestions } from './constants'
import styles from './styles.module.scss'

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
  const tagsSuggestions: EuiSelectableOption<{ value: string }>[] =
    useMemo(() => {
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
    <EuiSelectable
      data-testid="tag-suggestions"
      options={tagsSuggestions}
      singleSelection
      listProps={{ showIcons: false }}
      className={styles.suggestions}
      onChange={(options) => {
        const value = options.find((o) => o.checked)?.value

        if (value) {
          onChange(value)
        }
      }}
    >
      {(list) => (
        <>
          <RiText size="m" color="subdued" className={styles.suggestionsTitle}>
            Suggestions
          </RiText>
          {list}
        </>
      )}
    </EuiSelectable>
  )
}
