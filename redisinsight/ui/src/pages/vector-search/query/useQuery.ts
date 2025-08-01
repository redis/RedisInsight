import { useCallback, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Nullable, scrollIntoView } from 'uiSrc/utils'
import { CodeButtonParams } from 'uiSrc/constants'
import { RunQueryMode, ResultsMode } from 'uiSrc/slices/interfaces'
import {
  vectorSearchQuerySelector,
  sendVectorSearchQueryAction,
  deleteVectorSearchCommandAction,
  clearVectorSearchResultsAction,
  changeVectorSearchResultsMode,
  changeVectorSearchActiveRunQueryMode,
} from 'uiSrc/slices/vector-search/query'

const useQuery = () => {
  const dispatch = useDispatch()
  const scrollDivRef = useRef<HTMLDivElement>(null)

  const {
    items,
    clearing,
    processing,
    isLoaded,
    resultsMode,
    activeRunQueryMode,
  } = useSelector(vectorSearchQuerySelector)

  const [query, setQuery] = useState('')

  const handleSubmit = useCallback(
    (
      commandInit: string = query,
      commandId?: Nullable<string>,
      executeParams: CodeButtonParams = {},
    ) => {
      if (!commandInit?.length) return

      dispatch(
        sendVectorSearchQueryAction(commandInit, commandId, executeParams, {
          afterEach: () => {
            const isNewCommand = !commandId
            isNewCommand && scrollResults('start')
          },
        }),
      )
    },
    [dispatch, query],
  )

  const scrollResults = (inline: ScrollLogicalPosition = 'start') => {
    requestAnimationFrame(() => {
      scrollIntoView(scrollDivRef?.current, {
        behavior: 'smooth',
        block: 'nearest',
        inline,
      })
    })
  }

  const handleQueryDelete = useCallback(
    (commandId: string) => {
      dispatch(deleteVectorSearchCommandAction(commandId))
    },
    [dispatch],
  )

  const handleAllQueriesDelete = useCallback(() => {
    dispatch(clearVectorSearchResultsAction())
  }, [dispatch])

  const handleChangeQueryRunMode = useCallback(() => {
    const nextMode =
      activeRunQueryMode === RunQueryMode.ASCII
        ? RunQueryMode.Raw
        : RunQueryMode.ASCII
    dispatch(changeVectorSearchActiveRunQueryMode(nextMode))
  }, [dispatch, activeRunQueryMode])

  const handleChangeGroupMode = useCallback(() => {
    const nextMode =
      resultsMode === ResultsMode.Default
        ? ResultsMode.GroupMode
        : ResultsMode.Default
    dispatch(changeVectorSearchResultsMode(nextMode))
  }, [dispatch, resultsMode])

  const handleQueryReRun = useCallback(
    (
      query: string,
      commandId?: Nullable<string>,
      executeParams?: CodeButtonParams,
    ) => {
      handleSubmit(query, commandId, executeParams)
    },
    [handleSubmit],
  )

  const handleQueryOpen = useCallback(() => {}, [])
  const handleQueryProfile = useCallback(() => {}, [])

  return {
    query,
    setQuery,
    items,
    clearing,
    processing,
    isResultsLoaded: isLoaded,
    activeMode: activeRunQueryMode,
    resultsMode,
    scrollDivRef,
    onSubmit: handleSubmit,
    onQueryOpen: handleQueryOpen,
    onQueryDelete: handleQueryDelete,
    onAllQueriesDelete: handleAllQueriesDelete,
    onQueryChangeMode: handleChangeQueryRunMode,
    onChangeGroupMode: handleChangeGroupMode,
    onQueryReRun: handleQueryReRun,
    onQueryProfile: handleQueryProfile,
  }
}

export { useQuery }
