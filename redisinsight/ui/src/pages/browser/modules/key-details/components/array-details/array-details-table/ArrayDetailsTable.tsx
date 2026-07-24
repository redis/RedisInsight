import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'

import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { appContextSelectedKey } from 'uiSrc/slices/app/context'
import {
  selectedKeyDataSelector,
  selectedKeySelector,
  setSelectedKeyRefreshDisabled,
} from 'uiSrc/slices/browser/keys'
import {
  arraySelector,
  isSameKey,
  updateArrayElementAction,
} from 'uiSrc/slices/browser/array'
import { KeyValueCompressor } from 'uiSrc/constants'
import { Nullable, stringToSerializedBufferFormat } from 'uiSrc/utils'
import { Row, Table } from 'uiSrc/components/base/layout/table'
import {
  BrowserConfirmationCommandId,
  useProductionWriteConfirmation,
} from 'uiSrc/components/production-write-confirmation'
import { ArrayDataElement } from 'uiSrc/slices/interfaces/array'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { useTranslation } from 'uiSrc/i18n'
import { ParseKeys } from 'i18next'

import {
  ARRAY_TABLE_EMPTY_MESSAGE,
  ARRAY_TABLE_LOADING_MESSAGE,
  SELECTION_COLUMN_CELL_CLASS,
  SELECTION_COLUMN_WIDTH_REM,
} from './constants'
import { getArrayElementEditState } from './getArrayElementEditState'
import { ArrayValueEditorDrawer } from './components/ArrayValueEditorDrawer'
import {
  actionsColumn,
  arrayColumns,
  getTableMinWidth,
  TEST_ID,
} from './ArrayDetailsTable.config'
import {
  ArrayDetailsTableProps,
  ArrayTableConfig,
} from './ArrayDetailsTable.types'
import * as S from './ArrayDetailsTable.styles'

/**
 * Renders the array slice's currently-loaded `elements` through the
 * redis-ui `Table` (`@redis-ui/table`). Populated values are editable in
 * place (ARSET) via the value cell's inline editor; empty slots stay
 * read-only (see ArrayValueCell). Shows a per-row delete affordance when the
 * consumer passes `deleteConfig`.
 */
const ArrayDetailsTable = memo(
  ({
    elements,
    loading,
    error,
    isActive,
    renderExpandedRow,
    getIsRowExpandable,
    expandRowOnClick,
    deleteConfig,
    selectionConfig,
    bulkDeleteConfig,
  }: ArrayDetailsTableProps) => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const { compressor = null, id: connectedInstanceId } = useAppSelector(
      connectedInstanceSelector,
    ) as unknown as {
      compressor: Nullable<KeyValueCompressor>
      id?: string
    }
    const { viewFormat } = useAppSelector(selectedKeySelector)
    const {
      updating,
      loading: rangeLoading,
      search,
    } = useAppSelector(arraySelector)
    // Block opening an edit while any read that writes a patched view is in
    // flight — range/scan (data.elements) or search (search.data), from either
    // tab — so a late response can't overwrite the optimistic patch. Read from
    // the slice, not the `loading` prop, so the View table also sees a search
    // loading on the hidden Search tab (and vice-versa).
    const readLoading = rangeLoading || search.loading
    // Use the selected key's name, not the array slice's `data.keyName` —
    // the latter is only set after a View range/scan succeeds, but this table
    // is also rendered by the Search tab, so an edit there (or before View
    // loads) would otherwise POST ARSET with an empty key.
    const { name: keyName } = useAppSelector(selectedKeyDataSelector) ?? {
      name: '',
    }
    // The live selection — updated on key click, before fetchKeyInfo. Unlike
    // `keyName` (from selectedKeyData) it doesn't lag a switch.
    const liveSelectedKey = useAppSelector(appContextSelectedKey)

    const { requestConfirmation } = useProductionWriteConfirmation()

    const [editingIndex, setEditingIndex] = useState<Nullable<string>>(null)
    // Row open in the Monaco drawer, plus its open-time seed. Held table-level
    // (not per-row) so the drawer shares the inline editor's guards.
    const [drawerIndex, setDrawerIndex] = useState<Nullable<string>>(null)
    const [drawerSeed, setDrawerSeed] = useState('')
    // Mirrors `drawerIndex` for reads inside the async production-write
    // confirmation callback, so a pending save can tell whether the drawer was
    // abandoned (closed, or moved to another row) while the dialog was open.
    const drawerIndexRef = useRef<Nullable<string>>(null)
    useEffect(() => {
      drawerIndexRef.current = drawerIndex
    }, [drawerIndex])
    // Identifies the current edit session. Bumped whenever an editor opens, so
    // a still-in-flight save from a previous session can't close an editor the
    // user has since reopened (which would discard the new input).
    const editSessionRef = useRef(0)
    // Live mirror of the connected database id, so the stable open/apply
    // callbacks can read it without a stale closure.
    const connectedInstanceIdRef = useRef(connectedInstanceId)
    useEffect(() => {
      connectedInstanceIdRef.current = connectedInstanceId
    }, [connectedInstanceId])
    // Database connected when the inline editor opened. Its Save confirmation
    // (in EditableTextArea) can be confirmed after a database switch, so the
    // write is guarded with this id to avoid saving into the new database.
    const inlineEditInstanceIdRef = useRef<string | undefined>(undefined)
    // Same guard for the drawer, captured when it opens (not at Save) so a
    // switch before the save still skips the write.
    const drawerEditInstanceIdRef = useRef<string | undefined>(undefined)

    // Only the visible tab's table drives the editor-driven refresh pause, so
    // a hidden table can't re-enable refresh while the active one has an editor
    // open. Stays paused until the editor closes AND the ARSET settles, so a
    // stale reload can't overwrite the optimistic patch mid-write. (This effect
    // intentionally omits `editingIndex` from the inactive path — only the
    // active table reacts to it.)
    useEffect(() => {
      if (!isActive) return
      dispatch(
        setSelectedKeyRefreshDisabled(
          editingIndex !== null || drawerIndex !== null || updating,
        ),
      )
    }, [isActive, editingIndex, drawerIndex, updating, dispatch])

    // When a table is hidden (tab switch) or unmounts, it releases the shared
    // flag but still respects an in-flight write (global), so switching to a
    // tab without a table can't leave refresh stuck disabled.
    useEffect(() => {
      if (isActive) return
      dispatch(setSelectedKeyRefreshDisabled(updating))
    }, [isActive, updating, dispatch])

    // Abandon an open editor (inline or drawer) when this table is hidden (tab
    // switch) or the key changes, so a background editor can't keep refresh
    // disabled, leave a portaled drawer visible over the other tab, or carry
    // stale editing state across keys.
    useEffect(() => {
      if (!isActive) {
        setEditingIndex(null)
        setDrawerIndex(null)
      }
    }, [isActive])

    // Abandon an open editor on a real key change, keyed off the live
    // selection — `keyName` lags a switch during fetchKeyInfo, which would let
    // a pending drawer save ARSET the old key. Compare by value so a same-key
    // info refresh (a fresh buffer for the same key) doesn't close the editor.
    const prevKeyRef = useRef(liveSelectedKey)
    useEffect(() => {
      if (isSameKey(prevKeyRef.current, liveSelectedKey)) return
      prevKeyRef.current = liveSelectedKey
      setEditingIndex(null)
      setDrawerIndex(null)
    }, [liveSelectedKey])

    // Abandon an open editor when the value formatter changes. The editor seed
    // was serialized under the previous format, but a save re-serializes with
    // the current `viewFormat` — saving the unchanged seed under a new format
    // would write different bytes (e.g. "41" as Unicode vs the byte 0x41 as
    // HEX).
    const prevFormatRef = useRef(viewFormat)
    useEffect(() => {
      if (prevFormatRef.current === viewFormat) return
      prevFormatRef.current = viewFormat
      setEditingIndex(null)
      setDrawerIndex(null)
    }, [viewFormat])

    // Re-enable refresh when the table unmounts (panel close), and abandon a
    // pending drawer save — otherwise Confirm could ARSET the old key after a
    // key switch unmounts the table.
    useEffect(
      () => () => {
        dispatch(setSelectedKeyRefreshDisabled(false))
        drawerIndexRef.current = null
      },
      [dispatch],
    )

    const handleEditElement = useCallback(
      (index: string, isEditing: boolean) => {
        // Opening an editor starts a new session; a stale save's callback that
        // compares against its captured session id will then no-op.
        if (isEditing) {
          editSessionRef.current += 1
          // Capture the connected database to guard a save confirmed later.
          inlineEditInstanceIdRef.current = connectedInstanceIdRef.current
          // Inline and drawer are one mutually-exclusive edit session — opening
          // inline closes any open drawer.
          setDrawerIndex(null)
        }
        setEditingIndex(isEditing ? index : null)
      },
      [],
    )

    const handleApplyEditElement = useCallback(
      (
        index: string,
        value: string,
        options?: { startInstanceId?: string; onSuccess?: () => void },
      ) => {
        const editSession = editSessionRef.current
        dispatch(
          updateArrayElementAction(
            {
              key: keyName,
              index,
              value: stringToSerializedBufferFormat(viewFormat, value),
              // Inline saves fall back to the open-time id; the drawer passes
              // its own save-time id.
              startInstanceId:
                options?.startInstanceId ?? inlineEditInstanceIdRef.current,
            },
            options?.onSuccess ??
              (() => {
                // Ignore a completion whose editor the user has since closed
                // and reopened (a newer session) — closing it would discard the
                // new input. handleEditElement's guard runs for the live session.
                if (editSessionRef.current === editSession) {
                  handleEditElement(index, false)
                }
              }),
          ),
        )
      },
      [dispatch, keyName, viewFormat, handleEditElement],
    )

    // Open the Monaco drawer for a row, capturing its serialized value as the
    // seed. Guarded like the inline editor: refresh pauses while it's open.
    const handleOpenValueEditor = useCallback(
      (index: string) => {
        const element = elements.find((el) => el.index === index)
        if (!element?.value) return
        const { serialize } = getArrayElementEditState(
          element.value as RedisResponseBuffer,
          compressor,
          viewFormat,
        )
        setDrawerSeed(serialize())
        // Capture the connected database to guard a save confirmed later.
        drawerEditInstanceIdRef.current = connectedInstanceIdRef.current
        // Opening the drawer starts a new edit session (like inline) so a
        // stale save's onSuccess can't close a drawer the user has since
        // reopened.
        editSessionRef.current += 1
        // Inline and drawer are one mutually-exclusive edit session — opening
        // the drawer closes any open inline edit, so a later drawer save can't
        // clear a still-open inline editor on another row.
        setEditingIndex(null)
        setDrawerIndex(index)
      },
      [elements, compressor, viewFormat],
    )

    const handleDrawerSave = useCallback(
      (value: string) => {
        const savedIndex = drawerIndex
        const savedInstanceId = drawerEditInstanceIdRef.current
        if (savedIndex === null) return
        requestConfirmation({
          title: t('browser.keyDetails.editable.confirmTitle'),
          actionDescription: t('browser.keyDetails.editable.confirmMessage'),
          confirmButtonText: t('browser.keyDetails.editable.confirmButton'),
          commandId: BrowserConfirmationCommandId.EditValue,
          disableConfirmationInput: true,
          onConfirm: () => {
            // Skip if the drawer was abandoned (Cancel, key/format change, tab
            // switch) while the confirmation was pending.
            if (drawerIndexRef.current !== savedIndex) return
            const editSession = editSessionRef.current
            handleApplyEditElement(savedIndex, value, {
              // Skip the write if the database changed since Save.
              startInstanceId: savedInstanceId,
              // Close the drawer only on a successful write for the current
              // session — a skipped, failed or superseded save leaves the edit
              // in place.
              onSuccess: () => {
                if (editSessionRef.current === editSession) setDrawerIndex(null)
              },
            })
          },
        })
      },
      [drawerIndex, requestConfirmation, handleApplyEditElement],
    )

    // Pass shared per-cell config via the table's `meta` so the static
    // column defs in `ArrayDetailsTable.config` don't need to close over
    // them and can be rebuilt only when their inputs change.
    const meta = useMemo<ArrayTableConfig>(
      () => ({
        compressor,
        viewFormat,
        editingIndex,
        isValueDrawerOpen: drawerIndex !== null,
        onEditElement: handleEditElement,
        onApplyEditElement: handleApplyEditElement,
        onOpenValueEditor: handleOpenValueEditor,
        updating,
        loading: readLoading,
        deleteConfig,
        bulkDeleteConfig,
      }),
      [
        compressor,
        viewFormat,
        editingIndex,
        drawerIndex,
        handleEditElement,
        handleApplyEditElement,
        handleOpenValueEditor,
        updating,
        readLoading,
        deleteConfig,
        bulkDeleteConfig,
      ],
    )

    // The redis-ui selection checkbox column is opt-in: the plugin only sets up
    // selection state, the column itself has to be added explicitly. Hide the
    // header select-all when nothing in the current view is selectable (e.g. an
    // all-empty View range) so it isn't a dead, clickable-looking control.
    const hasSelectableRows =
      !!selectionConfig &&
      elements.some((element) => selectionConfig.getRowCanSelect(element))
    // `useRowSelectionColumn` is a plain column-def factory (it calls no hooks
    // despite the name) that returns a fresh object every render; alias it so
    // it isn't treated as a hook, and memoize on its only input so `columns`
    // below stays referentially stable across unrelated re-renders.
    const buildSelectionColumn = Table.useRowSelectionColumn
    const selectionColumn = useMemo(
      () =>
        buildSelectionColumn<ArrayDataElement>({
          disableSelectAll: !hasSelectableRows,
          // Override redis-ui's default 4.2rem so the column hugs the checkbox;
          // the class trims the cell's side padding (see ArrayDetailsTable.styles).
          size: SELECTION_COLUMN_WIDTH_REM,
          sizeUnit: 'rem',
          getCellProps: () => ({ className: SELECTION_COLUMN_CELL_CLASS }),
          getHeaderCellProps: () => ({
            className: SELECTION_COLUMN_CELL_CLASS,
          }),
        }),
      [buildSelectionColumn, hasSelectableRows],
    )

    // Selection checkbox (leading) and delete column (trailing) are each
    // appended only when the consumer opts in. Depend on their presence, not
    // the config objects' identity: the cells read live popover/selection state
    // from `meta`, so rebuilding `columns` on every toggle would needlessly
    // reset table state (e.g. expanded Search context rows).
    const hasSelectionColumn = Boolean(selectionConfig)
    // The actions column hosts the per-row edit + expand triggers (editing is
    // always wired on this table) alongside the optional delete trigger, so it
    // is always present.
    const hasActionsColumn = true
    const columns = useMemo(() => {
      // Column defs are static (module-level); translate their string headers
      // at render so the header cells read the locale, not the raw key.
      const localized = arrayColumns.map((col) =>
        typeof col.header === 'string'
          ? { ...col, header: t(col.header as ParseKeys) }
          : col,
      )
      const cols = hasSelectionColumn
        ? [selectionColumn, ...localized]
        : [...localized]
      if (hasActionsColumn) cols.push(actionsColumn)
      return cols
    }, [hasSelectionColumn, hasActionsColumn, selectionColumn, t])

    // Use `||` rather than `??` here: the array slice clears `error` to `''`
    // after a successful request, and `''` is not nullish, so `??` would
    // surface the empty string and the table would render with no text on
    // an empty-but-successful range/scan.
    const emptyState = loading
      ? t(ARRAY_TABLE_LOADING_MESSAGE)
      : error || t(ARRAY_TABLE_EMPTY_MESSAGE)

    // Multi-select is opt-in. Selection keys are element indexes (`getRowId`),
    // and gaps/non-deletable rows have their checkbox disabled.
    const selectionProps = selectionConfig
      ? {
          rowSelectionMode: 'multiple' as const,
          rowSelection: selectionConfig.rowSelection,
          onRowSelectionChange: selectionConfig.onRowSelectionChange,
          getRowCanSelect: (row: Row<ArrayDataElement>) =>
            selectionConfig.getRowCanSelect(row.original),
          getRowId: (element: ArrayDataElement) => element.index,
        }
      : {}

    return (
      <S.Container data-testid={TEST_ID}>
        <S.StyledTable
          columns={columns}
          data={elements}
          meta={meta}
          stripedRows
          minWidth={getTableMinWidth({ hasSelectionColumn, hasActionsColumn })}
          emptyState={emptyState}
          renderExpandedRow={renderExpandedRow}
          getIsRowExpandable={getIsRowExpandable}
          expandRowOnClick={expandRowOnClick}
          {...selectionProps}
          data-testid={`${TEST_ID}-table`}
        />
        <ArrayValueEditorDrawer
          isOpen={drawerIndex !== null}
          index={drawerIndex ?? ''}
          initialValue={drawerSeed}
          isSaveDisabled={updating || readLoading}
          onSave={handleDrawerSave}
          onClose={() => setDrawerIndex(null)}
        />
      </S.Container>
    )
  },
)

export { ArrayDetailsTable }
