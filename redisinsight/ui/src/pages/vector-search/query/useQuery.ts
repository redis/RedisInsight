import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { CodeButtonParams } from 'uiSrc/constants'
import {
  RunQueryMode,
  ResultsMode,
  CommandExecutionType,
} from 'uiSrc/slices/interfaces'
import {
  fetchWBHistoryAction,
  workbenchResultsSelector,
  sendWbQueryAction,
  deleteWBCommandAction,
  clearWbResultsAction,
  fetchWBCommandAction,
  toggleOpenWBResult,
} from 'uiSrc/slices/workbench/wb-results'
import { Nullable } from 'uiSrc/utils'

const useQuery = () => {
  const { instanceId } = useParams<{ instanceId: string }>()
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const dispatch = useDispatch()

  const [query, setQuery] = useState('')
  const { items, clearing, processing, isLoaded } = useSelector(
    workbenchResultsSelector,
  )

  const resultsMode = ResultsMode.Default
  const activeRunQueryMode = RunQueryMode.ASCII
  const executionType = CommandExecutionType.Search

  useEffect(() => {
    dispatch(fetchWBHistoryAction(instanceId, executionType))
  }, [dispatch, instanceId, executionType])

  const onSubmit = useCallback(
    async (
      commandInit: string = query,
      commandId?: Nullable<string>,
      executeParams: CodeButtonParams = {},
    ) => {
      if (!commandInit?.length) return

      dispatch(
        sendWbQueryAction(
          commandInit,
          commandId,
          {
            ...executeParams,
            executionType,
          },
          {
            afterAll: () => {
              // Scroll to top after all commands are executed
              scrollDivRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
            },
          },
        ),
      )
    },
    [query, dispatch, activeRunQueryMode, resultsMode, executionType],
  )

  const handleQueryDelete = useCallback(
    async (commandId: string) => {
      dispatch(deleteWBCommandAction(commandId))
    },
    [dispatch],
  )

  const handleAllQueriesDelete = useCallback(async () => {
    dispatch(clearWbResultsAction(executionType))
  }, [dispatch, executionType])

  const handleQueryOpen = useCallback(
    async (commandId: string) => {
      const command = items.find((item) => item.id === commandId)

      // If command already has result data, just toggle
      if (command?.result) {
        dispatch(toggleOpenWBResult(commandId))
      } else {
        // Otherwise fetch the command details
        dispatch(fetchWBCommandAction(commandId))
      }
    },
    [dispatch, items],
  )

  const handleQueryProfile = useCallback(() => {}, [])
  const handleChangeQueryRunMode = useCallback(() => {}, [])
  const handleChangeGroupMode = useCallback(() => {}, [])

  return {
    // State
    query,
    setQuery,
    items,
    clearing,
    processing,
    isResultsLoaded: isLoaded,

    // Configuration
    activeMode: activeRunQueryMode,
    resultsMode,
    scrollDivRef,

    // Actions
    onSubmit,
    onQueryOpen: handleQueryOpen,
    onQueryDelete: handleQueryDelete,
    onAllQueriesDelete: handleAllQueriesDelete,
    onQueryChangeMode: handleChangeQueryRunMode,
    onChangeGroupMode: handleChangeGroupMode,
    onQueryReRun: onSubmit,
    onQueryProfile: handleQueryProfile,
  }
}

export { useQuery }
