import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  QueryLibraryService,
  QueryLibraryItem,
} from 'uiSrc/services/query-library'

/**
 * Temporary debug component for verifying the Query Library service.
 * Delete after manual verification.
 */
export const QueryLibraryDebug = () => {
  const { instanceId, indexName } = useParams<{
    instanceId: string
    indexName: string
  }>()

  const service = useMemo(() => new QueryLibraryService(), [])

  const [items, setItems] = useState<QueryLibraryItem[]>([])
  const [name, setName] = useState('')
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const effectiveIndex = indexName || 'idx:test'

  const refresh = useCallback(async () => {
    if (!instanceId) return
    setLoading(true)
    const data = await service.getList(instanceId, {
      indexName: effectiveIndex,
      ...(search && { search }),
    })
    setItems(data)
    setLoading(false)
  }, [instanceId, effectiveIndex, search, service])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleCreate = async () => {
    if (!instanceId || !name || !query) return
    await service.create(instanceId, {
      indexName: effectiveIndex,
      name,
      query,
    })
    setName('')
    setQuery('')
    await refresh()
  }

  const handleSeed = async () => {
    if (!instanceId) return
    await service.seed(instanceId, [
      {
        indexName: effectiveIndex,
        name: 'Sample: Find all',
        description: 'Returns all documents',
        query: `FT.SEARCH ${effectiveIndex} "*"`,
      },
      {
        indexName: effectiveIndex,
        name: 'Sample: Count',
        description: 'Count all documents',
        query: `FT.SEARCH ${effectiveIndex} "*" LIMIT 0 0`,
      },
    ])
    await refresh()
  }

  const handleDelete = async (id: string) => {
    if (!instanceId) return
    await service.delete(instanceId, id)
    await refresh()
  }

  const containerStyle: React.CSSProperties = {
    padding: 16,
    fontFamily: 'monospace',
    fontSize: 13,
    maxWidth: 800,
  }

  const inputStyle: React.CSSProperties = {
    padding: '4px 8px',
    marginRight: 8,
    border: '1px solid #666',
    borderRadius: 4,
    background: 'transparent',
    color: 'inherit',
  }

  const btnStyle: React.CSSProperties = {
    padding: '4px 12px',
    marginRight: 8,
    border: '1px solid #666',
    borderRadius: 4,
    cursor: 'pointer',
    background: 'transparent',
    color: 'inherit',
  }

  const itemStyle: React.CSSProperties = {
    padding: 8,
    marginBottom: 8,
    border: '1px solid #444',
    borderRadius: 4,
  }

  return (
    <div style={containerStyle}>
      <h3>Query Library Debug (index: {effectiveIndex})</h3>

      <div style={{ marginBottom: 16 }}>
        <strong>Create saved query:</strong>
        <div style={{ marginTop: 8 }}>
          <input
            style={inputStyle}
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            style={inputStyle}
            placeholder="Query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="button" style={btnStyle} onClick={handleCreate}>
            Save Query
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <button type="button" style={btnStyle} onClick={handleSeed}>
          Seed Samples
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong>Search:</strong>{' '}
        <input
          style={inputStyle}
          placeholder="Search term..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" style={btnStyle} onClick={refresh}>
          Refresh
        </button>
      </div>

      <div>
        <strong>
          Items ({items.length}){loading && ' — loading...'}
        </strong>
        {items.map((item) => (
          <div key={item.id} style={itemStyle}>
            <div>
              <strong>{item.name}</strong>{' '}
              <span style={{ opacity: 0.6 }}>
                [{item.type}] {item.id.slice(0, 8)}...
              </span>
            </div>
            {item.description && (
              <div style={{ opacity: 0.7 }}>{item.description}</div>
            )}
            <div style={{ marginTop: 4 }}>
              <code>{item.query}</code>
            </div>
            <div style={{ marginTop: 4 }}>
              <button
                type="button"
                style={{ ...btnStyle, color: '#f66', fontSize: 11 }}
                onClick={() => handleDelete(item.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && (
          <div style={{ opacity: 0.5, padding: 8 }}>No items</div>
        )}
      </div>
    </div>
  )
}
