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
    const dispatch = useAppDispatch()
    const { compressor = null } = useAppSelector(
      connectedInstanceSelector,
    ) as unknown as { compressor: Nullable<KeyValueCompressor> }
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

    const { requestConfirmation } = useProductionWriteConfirmation()

    // Index of the row currently being edited; only one row edits at a time.
    const [editingIndex, setEditingIndex] = useState<Nullable<string>>(null)
    // Index whose value is open in the Monaco drawer, plus its seed captured at
    // open time. Held at the table level (not per-row) so the drawer shares the
    // inline editor's refresh-pause, tab-switch / key-change abandon and
    // in-flight-write guards.
    const [drawerIndex, setDrawerIndex] = useState<Nullable<string>>(null)
    const [drawerSeed, setDrawerSeed] = useState('')
    // Identifies the current edit session. Bumped whenever an editor opens, so
    // a still-in-flight save from a previous session can't close an editor the
    // user has since reopened (which would discard the new input).
    const editSessionRef = useRef(0)

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

    // Abandon an open editor only on a *real* key change. `keyName` is the
    // selected key's name buffer, and the post-ARSET `refreshKeyInfoAction`
    // swaps in a new buffer instance for the same key — comparing by value
    // (not reference) stops that refresh from closing an editor the user has
    // meanwhile reopened on another row.
    const prevKeyRef = useRef(keyName)
    useEffect(() => {
      if (isSameKey(prevKeyRef.current, keyName)) return
      prevKeyRef.current = keyName
      setEditingIndex(null)
      setDrawerIndex(null)
    }, [keyName])

    // Re-enable refresh when the table unmounts entirely (panel close).
    useEffect(
      () => () => {
        dispatch(setSelectedKeyRefreshDisabled(false))
      },
      [dispatch],
    )

    const handleEditElement = useCallback(
      (index: string, isEditing: boolean) => {
        // Opening an editor starts a new session; a stale save's callback that
        // compares against its captured session id will then no-op.
        if (isEditing) {
          editSessionRef.current += 1
          // Inline and drawer are one mutually-exclusive edit session — opening
          // inline closes any open drawer.
          setDrawerIndex(null)
        }
        setEditingIndex(isEditing ? index : null)
      },
      [],
    )

    const handleApplyEditElement = useCallback(
      (index: string, value: string) => {
        const editSession = editSessionRef.current
        dispatch(
          updateArrayElementAction(
            {
              key: keyName,
              index,
              value: stringToSerializedBufferFormat(viewFormat, value),
            },
            () => {
              // Ignore a completion whose editor the user has since closed and
              // reopened (a newer session) — closing it would discard the new
              // input. handleEditElement's own guard runs for the live session.
              if (editSessionRef.current === editSession) {
                handleEditElement(index, false)
              }
            },
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
        if (drawerIndex === null) return
        requestConfirmation({
          title: 'Edit value on production database?',
          actionDescription:
            'You are about to modify a value on a production database.',
          confirmButtonText: 'Save',
          commandId: BrowserConfirmationCommandId.EditValue,
          disableConfirmationInput: true,
          onConfirm: () => {
            handleApplyEditElement(drawerIndex, value)
            setDrawerIndex(null)
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
      const cols = hasSelectionColumn
        ? [selectionColumn, ...arrayColumns]
        : [...arrayColumns]
      if (hasActionsColumn) cols.push(actionsColumn)
      return cols
    }, [hasSelectionColumn, hasActionsColumn, selectionColumn])

    // Use `||` rather than `??` here: the array slice clears `error` to `''`
    // after a successful request, and `''` is not nullish, so `??` would
    // surface the empty string and the table would render with no text on
    // an empty-but-successful range/scan.
    const emptyState = loading
      ? ARRAY_TABLE_LOADING_MESSAGE
      : error || ARRAY_TABLE_EMPTY_MESSAGE

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
