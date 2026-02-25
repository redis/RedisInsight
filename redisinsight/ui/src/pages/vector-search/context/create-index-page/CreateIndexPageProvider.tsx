import React, { useCallback, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'

import { IndexField } from '../../components/index-details/IndexDetails.types'
import { FieldTypeModalMode } from '../../components/field-type-modal'
import { useCreateIndexCommand, useCreateIndexFlow } from '../../hooks'
import {
  getFieldsBySampleData,
  getDisplayNameBySampleData,
  getIndexPrefixBySampleData,
} from '../../utils/sampleData'
import { CreateIndexTab } from '../../pages/VectorSearchCreateIndexPage/VectorSearchCreateIndexPage.types'

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

export const CreateIndexPageProvider = ({
  instanceId,
  sampleData,
  children,
}: CreateIndexPageProviderProps) => {
  const [activeTab, setActiveTab] = useState<CreateIndexTab>(
    CreateIndexTab.Table,
  )
  const [isReadonly] = useState(true)
  const [fieldModal, setFieldModal] = useState<FieldModalState>(
    INITIAL_FIELD_MODAL_STATE,
  )

  const history = useHistory()

  const { command } = useCreateIndexCommand(sampleData)
  const { run: createIndexFlow, loading } = useCreateIndexFlow()

  const [editableFields, setEditableFields] = useState<IndexField[] | null>(
    null,
  )

  const sampleFields = useMemo(
    () => getFieldsBySampleData(sampleData),
    [sampleData],
  )
  const fields = editableFields ?? sampleFields

  const displayName = useMemo(
    () => getDisplayNameBySampleData(sampleData),
    [sampleData],
  )
  const indexPrefix = useMemo(
    () => getIndexPrefixBySampleData(sampleData),
    [sampleData],
  )

  const handleCreateIndex = useCallback(() => {
    createIndexFlow(instanceId, sampleData)
  }, [createIndexFlow, instanceId, sampleData])

  const handleCancel = useCallback(() => {
    history.push(Pages.vectorSearch(instanceId))
  }, [history, instanceId])

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
        const currentFields = prev ?? sampleFields

        if (fieldModal.mode === FieldTypeModalMode.Create) {
          return [...currentFields, updatedField]
        }

        return currentFields.map((f) =>
          f.id === updatedField.id ? updatedField : f,
        )
      })
      setFieldModal(INITIAL_FIELD_MODAL_STATE)
    },
    [fieldModal.mode, sampleFields],
  )

  const value = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      isReadonly,
      displayName,
      indexPrefix,
      fields,
      command,
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
      activeTab,
      isReadonly,
      displayName,
      indexPrefix,
      fields,
      command,
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
