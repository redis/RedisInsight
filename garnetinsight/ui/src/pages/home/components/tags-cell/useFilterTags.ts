import { useState, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { tagsSelector, setSelectedTags } from 'uiSrc/slices/instances/tags'

export const useFilterTags = () => {
  const dispatch = useDispatch()
  const { data: tagsData, selectedTags } = useSelector(tagsSelector)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [tagSearch, setTagSearch] = useState('')

  const onPopoverToggle = () => {
    setIsPopoverOpen(!isPopoverOpen)
  }

  const onTagChange = useCallback(
    (tag: string, checked: boolean) => {
      const newSelectedTags = new Set(selectedTags)
      const setMethod = checked ? 'add' : 'delete'
      newSelectedTags[setMethod](tag)
      dispatch(setSelectedTags(newSelectedTags))
    },
    [dispatch, selectedTags],
  )

  const onKeyChange = useCallback(
    (key: string, checked: boolean) => {
      const tagsWithKey = tagsData
        .filter((tag) => tag.key === key)
        .map((tag) => `${tag.key}:${tag.value}`)
      const newSelectedTags = new Set(selectedTags)
      const setMethod = checked ? 'add' : 'delete'
      tagsWithKey.forEach((tag) => newSelectedTags[setMethod](tag))
      dispatch(setSelectedTags(newSelectedTags))
    },
    [dispatch, tagsData, selectedTags],
  )

  const filteredTags = useMemo(
    () =>
      tagsData.filter((tag) => `${tag.key}:${tag.value}`.includes(tagSearch)),
    [tagSearch, tagsData],
  )

  const groupedTags = useMemo(
    () =>
      filteredTags.reduce(
        (acc, tag) => {
          if (!acc[tag.key]) {
            acc[tag.key] = []
          }
          acc[tag.key].push(tag.value)
          return acc
        },
        {} as Record<string, string[]>,
      ),
    [filteredTags],
  )

  return {
    isPopoverOpen,
    tagSearch,
    tagsData,
    selectedTags,
    setTagSearch,
    onPopoverToggle,
    onTagChange,
    onKeyChange,
    groupedTags,
  }
}
