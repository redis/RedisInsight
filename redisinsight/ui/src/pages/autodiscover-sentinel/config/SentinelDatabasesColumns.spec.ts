import { sentinelDatabasesColumnsConfig } from './SentinelDatabasesColumns.config'
import { SentinelDatabaseIds } from 'uiSrc/pages/autodiscover-sentinel/constants/constants'

describe('SentinelDatabasesColumns.config', () => {
  const mockHandleChangedInput = jest.fn((_name: string, _value: string) => {
    // Mock implementation
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return all required column definitions in correct order', () => {
    const columns = sentinelDatabasesColumnsConfig(mockHandleChangedInput)

    const columnIds = columns.map((col) => col.id)

    expect(columnIds).toEqual([
      'row-selection',
      SentinelDatabaseIds.PrimaryGroup,
      SentinelDatabaseIds.Alias,
      SentinelDatabaseIds.Address,
      SentinelDatabaseIds.NumberOfReplicas,
      SentinelDatabaseIds.Username,
      SentinelDatabaseIds.Password,
      SentinelDatabaseIds.DatabaseIndex,
    ])
  })

  it('should include selection column as first column', () => {
    const columns = sentinelDatabasesColumnsConfig(mockHandleChangedInput)

    expect(columns).toHaveLength(8)
    expect(columns[0].id).toBe('row-selection')
    expect(columns[0].isHeaderCustom).toBe(true)
    expect(columns[0].maxSize).toBe(50)
    expect(columns[0].size).toBe(50)
  })

  it('should pass handleChangedInput via meta.props for columns that need it', () => {
    const columns = sentinelDatabasesColumnsConfig(mockHandleChangedInput)

    const aliasColumn = columns.find(
      (col) => col.id === SentinelDatabaseIds.Alias,
    )
    const usernameColumn = columns.find(
      (col) => col.id === SentinelDatabaseIds.Username,
    )
    const passwordColumn = columns.find(
      (col) => col.id === SentinelDatabaseIds.Password,
    )
    const dbIndexColumn = columns.find(
      (col) => col.id === SentinelDatabaseIds.DatabaseIndex,
    )
    debugger
    expect(usernameColumn?.meta?.props.handleChangedInput).toBe(
      mockHandleChangedInput,
    )
    expect(passwordColumn?.meta?.props.handleChangedInput).toBe(
      mockHandleChangedInput,
    )
    expect(dbIndexColumn?.meta?.props.handleChangedInput).toBe(
      mockHandleChangedInput,
    )
    expect(aliasColumn?.meta?.props.handleChangedInput).toBe(
      mockHandleChangedInput,
    )
  })

  it('should not include meta.props for columns that do not need it', () => {
    const columns = sentinelDatabasesColumnsConfig(mockHandleChangedInput)

    const primaryGroupColumn = columns.find(
      (col) => col.id === SentinelDatabaseIds.PrimaryGroup,
    )
    const addressColumn = columns.find(
      (col) => col.id === SentinelDatabaseIds.Address,
    )
    const numberOfReplicasColumn = columns.find(
      (col) => col.id === SentinelDatabaseIds.NumberOfReplicas,
    )

    expect(primaryGroupColumn?.meta?.props).toBeUndefined()
    expect(addressColumn?.meta?.props).toBeUndefined()
    expect(numberOfReplicasColumn?.meta?.props).toBeUndefined()
  })
})
