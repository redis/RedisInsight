import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { Pages } from 'uiSrc/constants'
import { RowSelectionState } from 'uiSrc/components/base/layout/table'
import { RedisearchIndexKeyType } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import {
  CommandExecutionType,
  ResultsMode,
  RunQueryMode,
} from 'uiSrc/slices/interfaces'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import { addMessageNotification } from 'uiSrc/slices/app/notifications'
import { fetchRedisearchListAction } from 'uiSrc/slices/browser/redisearch'
import CommandsHistoryService from 'uiSrc/services/commands-history/commandsHistoryService'

import { IndexField } from '../../components/index-details/IndexDetails.types'
import { FieldTypeModalMode } from '../../components/field-type-modal'
import {
  useCreateIndexCommand,
  useCreateIndexFlow,
  useIndexNameValidation,
} from '../../hooks'
import {
  getFieldsBySampleData,
  getDisplayNameBySampleData,
  getIndexPrefixBySampleData,
  getIndexNameBySampleData,
} from '../../utils/sampleData'
import { generateDynamicFtCreateCommand } from '../../utils/generateDynamicFtCreateCommand'
import { deriveIndexName } from '../../utils'
import {
  CreateIndexTab,
  CreateIndexMode,
} from '../../pages/VectorSearchCreateIndexPage/VectorSearchCreateIndexPage.types'
import { createIndexNotifications } from '../../constants'

import {
  CreateIndexPageProviderProps,
  FieldModalState,
} from './CreateIndexPageContext.types'
import { CreateIndexPageContext } from './CreateIndexPageContext'

const INITIAL_FIELD_MODAL_STATE: FieldModalState = {
  isOpen: false,
  mode: FieldTypeModalMode.Create,
  field: undefined,
}

const DEFAULT_INDEX_PREFIX = ''

export const CreateIndexPageProvider = ({
  instanceId,
  sampleData,
  mode: modeProp,
  showBrowser: showBrowserProp = true,
  children,
}: CreateIndexPageProviderProps) => {
  const mode = modeProp ?? CreateIndexMode.SampleData
  const isSampleData = mode === CreateIndexMode.SampleData

  const [activeTab, setActiveTab] = useState<CreateIndexTab>(
    CreateIndexTab.Table,
  )
  const [fieldModal, setFieldModal] = useState<FieldModalState>(
    INITIAL_FIELD_MODAL_STATE,
  )

  const history = useHistory()
  const dispatch = useDispatch()

  // --- Sample data mode hooks (only meaningful when isSampleData) ---
  const { command: sampleCommand } = useCreateIndexCommand(sampleData)
  const { run: createSampleIndexFlow, loading: sampleLoading } =
    useCreateIndexFlow()

  // --- Fields ---
  const sampleFields = useMemo(
    () => (sampleData ? getFieldsBySampleData(sampleData) : []),
    [sampleData],
  )
  const [editableFields, setEditableFields] = useState<IndexField[] | null>(
    null,
  )
  const fields = isSampleData
    ? (editableFields ?? sampleFields)
    : (editableFields ?? [])

  const [skippedFields, setSkippedFields] = useState<string[]>([])

  const setFields = useCallback(
    (newFields: IndexField[], skipped?: string[]) => {
      setEditableFields(newFields)
      setSkippedFields(skipped ?? [])
      const initialSelection: RowSelectionState = {}
      newFields.forEach((f) => {
        initialSelection[f.id] = true
      })
      setRowSelection(initialSelection)
      setIsFieldsDirty(false)
    },
    [],
  )

  // --- Index name ---
  const [indexName, setIndexName] = useState<string>(() => {
    if (isSampleData && sampleData) return getIndexNameBySampleData(sampleData)
    return deriveIndexName('')
  })

  // --- Index prefix ---
  const [indexPrefix, setIndexPrefix] = useState<string>(() => {
    if (isSampleData && sampleData)
      return getIndexPrefixBySampleData(sampleData)
    return DEFAULT_INDEX_PREFIX
  })

  // --- Key type (only for existing data) ---
  const [keyType, setKeyType] = useState<RedisearchIndexKeyType>(
    RedisearchIndexKeyType.HASH,
  )

  // --- Row selection ---
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  // --- Dirty tracking ---
  const [isFieldsDirty, setIsFieldsDirty] = useState(false)
  const resetFieldsDirty = useCallback(() => setIsFieldsDirty(false), [])

  // --- Validation ---
  const indexNameError = useIndexNameValidation(!isSampleData ? indexName : '')

  // --- Derived values ---
  const isReadonly = isSampleData

  const displayName = useMemo(() => {
    if (isSampleData && sampleData)
      return getDisplayNameBySampleData(sampleData)
    return 'existing data'
  }, [isSampleData, sampleData])

  const showBrowser = !isSampleData && showBrowserProp

  const selectedFields = useMemo(() => {
    if (isSampleData) return fields
    return fields.filter((f) => rowSelection[f.id])
  }, [isSampleData, fields, rowSelection])

  const dynamicCommand = useMemo(() => {
    if (isSampleData) return sampleCommand
    if (selectedFields.length === 0) return ''
    return generateDynamicFtCreateCommand({
      indexName: indexName.trim(),
      keyType,
      prefix: indexPrefix,
      fields: selectedFields,
    })
  }, [
    isSampleData,
    sampleCommand,
    selectedFields,
    indexName,
    keyType,
    indexPrefix,
  ])

  const createDisabledReason = useMemo((): string | null => {
    if (isSampleData) return null
    if (selectedFields.length === 0)
      return 'Select a key and at least one field to index.'
    if (indexNameError !== null) return indexNameError
    return null
  }, [isSampleData, indexNameError, selectedFields])

  const isCreateDisabled = createDisabledReason !== null

  // --- Command execution for existing data ---
  const commandsHistoryService = useRef(
    new CommandsHistoryService(CommandExecutionType.Search),
  ).current
  const [existingDataLoading, setExistingDataLoading] = useState(false)

  const handleCreateExistingDataIndex = useCallback(async () => {
    if (!dynamicCommand || isCreateDisabled) return

    setExistingDataLoading(true)
    try {
      const results = await commandsHistoryService.addCommandsToHistory(
        instanceId,
        [dynamicCommand],
        {
          activeRunQueryMode: RunQueryMode.Raw,
          resultsMode: ResultsMode.Default,
        },
      )

      const failedResult = results[0]?.result?.find(
        (r) => r.status === CommandExecutionStatus.Fail,
      )

      if (failedResult) {
        const errorMessage =
          typeof failedResult.response === 'string'
            ? failedResult.response
            : undefined
        dispatch(
          addMessageNotification(
            createIndexNotifications.createFailed(errorMessage),
          ),
        )
        return
      }

      dispatch(fetchRedisearchListAction())
      dispatch(addMessageNotification(createIndexNotifications.indexCreated()))
      history.push(Pages.vectorSearchQuery(instanceId, indexName.trim()))
    } catch {
      dispatch(addMessageNotification(createIndexNotifications.createFailed()))
    } finally {
      setExistingDataLoading(false)
    }
  }, [
    dynamicCommand,
    isCreateDisabled,
    instanceId,
    indexName,
    commandsHistoryService,
    dispatch,
    history,
  ])

  // --- Actions ---
  const loading = isSampleData ? sampleLoading : existingDataLoading

  const handleCreateIndex = useCallback(() => {
    if (isSampleData && sampleData) {
      createSampleIndexFlow(instanceId, sampleData)
      return
    }
    handleCreateExistingDataIndex()
  }, [
    isSampleData,
    sampleData,
    createSampleIndexFlow,
    instanceId,
    handleCreateExistingDataIndex,
  ])

  const handleCancel = useCallback(() => {
    history.push(Pages.vectorSearch(instanceId))
  }, [history, instanceId])

  // --- Field modal ---
  const openAddFieldModal = useCallback(() => {
    setFieldModal({
      isOpen: true,
      mode: FieldTypeModalMode.Create,
      field: undefined,
    })
  }, [])

  const openEditFieldModal = useCallback((field: IndexField) => {
    setFieldModal({
      isOpen: true,
      mode: FieldTypeModalMode.Edit,
      field,
    })
  }, [])

  const closeFieldModal = useCallback(() => {
    setFieldModal(INITIAL_FIELD_MODAL_STATE)
  }, [])

  const handleFieldSubmit = useCallback(
    (updatedField: IndexField) => {
      setEditableFields((prev) => {
        const currentFields = isSampleData
          ? (prev ?? sampleFields)
          : (prev ?? [])

        if (fieldModal.mode === FieldTypeModalMode.Create) {
          return [...currentFields, updatedField]
        }

        return currentFields.map((f) =>
          f.id === updatedField.id ? updatedField : f,
        )
      })

      if (fieldModal.mode === FieldTypeModalMode.Create) {
        setRowSelection((prev) => ({ ...prev, [updatedField.id]: true }))
      }

      setFieldModal(INITIAL_FIELD_MODAL_STATE)
      setIsFieldsDirty(true)
    },
    [fieldModal.mode, sampleFields, isSampleData],
  )

  const onRowSelectionChange = useCallback((selection: RowSelectionState) => {
    setRowSelection(selection)
    setIsFieldsDirty(true)
  }, [])

  // --- Context value ---
  const value = useMemo(
    () => ({
      mode,
      activeTab,
      setActiveTab,
      isReadonly,
      showBrowser,
      displayName,
      indexName,
      setIndexName,
      indexPrefix,
      setIndexPrefix,
      keyType,
      setKeyType,
      fields,
      setFields,
      skippedFields,
      rowSelection,
      onRowSelectionChange,
      command: dynamicCommand,
      indexNameError,
      isFieldsDirty,
      resetFieldsDirty,
      isCreateDisabled,
      createDisabledReason,
      loading,
      handleCreateIndex,
      handleCancel,
      fieldModal,
      openAddFieldModal,
      openEditFieldModal,
      closeFieldModal,
      handleFieldSubmit,
    }),
    [
      mode,
      activeTab,
      isReadonly,
      showBrowser,
      displayName,
      indexName,
      indexPrefix,
      keyType,
      fields,
      setFields,
      skippedFields,
      rowSelection,
      onRowSelectionChange,
      dynamicCommand,
      indexNameError,
      isFieldsDirty,
      resetFieldsDirty,
      isCreateDisabled,
      createDisabledReason,
      loading,
      handleCreateIndex,
      handleCancel,
      fieldModal,
      openAddFieldModal,
      openEditFieldModal,
      closeFieldModal,
      handleFieldSubmit,
    ],
  )

  return (
    <CreateIndexPageContext.Provider value={value}>
      {children}
    </CreateIndexPageContext.Provider>
  )
}
