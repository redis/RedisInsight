import { sentinelDatabasesResultColumnsConfig } from './SentinelDatabasesResultColumns.config'
import { SentinelDatabaseIds } from 'uiSrc/pages/autodiscover-sentinel/constants/constants'

describe('SentinelDatabasesResultColumns.config', () => {
  const mockHandleChangedInput = jest.fn((_name: string, _value: string) => {
    // Mock implementation
  })
  const mockHandleAddInstance = jest.fn((_masterName: string) => {
    // Mock implementation
  })
  const mockIsInvalid = false
  const mockCountSuccessAdded = 5
  const mockItemsLength = 10

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return all required column definitions in correct order', () => {
    const columns = sentinelDatabasesResultColumnsConfig(
      mockHandleChangedInput,
      mockHandleAddInstance,
      mockIsInvalid,
      mockCountSuccessAdded,
      mockItemsLength,
    )

    const columnIds = columns.map((col) => col.id)

    expect(columnIds).toEqual([
      SentinelDatabaseIds.Message,
      SentinelDatabaseIds.PrimaryGroup,
      SentinelDatabaseIds.Alias,
      SentinelDatabaseIds.Address,
      SentinelDatabaseIds.NumberOfReplicas,
      SentinelDatabaseIds.Username,
      SentinelDatabaseIds.Password,
      SentinelDatabaseIds.DatabaseIndex,
    ])
  })

  it('should include result column as first column', () => {
    const columns = sentinelDatabasesResultColumnsConfig(
      mockHandleChangedInput,
      mockHandleAddInstance,
      mockIsInvalid,
      mockCountSuccessAdded,
      mockItemsLength,
    )

    expect(columns).toHaveLength(8)
    expect(columns[0].id).toBe(SentinelDatabaseIds.Message)
    expect(columns[0].enableSorting).toBe(true)
  })

  it('should set correct minSize for result column based on addActions', () => {
    const columnsWithActions = sentinelDatabasesResultColumnsConfig(
      mockHandleChangedInput,
      mockHandleAddInstance,
      mockIsInvalid,
      5,
      10,
    )
    const columnsWithoutActions = sentinelDatabasesResultColumnsConfig(
      mockHandleChangedInput,
      mockHandleAddInstance,
      mockIsInvalid,
      10,
      10,
    )

    const resultColumnWithActions = columnsWithActions.find(
      (col) => col.id === SentinelDatabaseIds.Message,
    )
    const resultColumnWithoutActions = columnsWithoutActions.find(
      (col) => col.id === SentinelDatabaseIds.Message,
    )

    expect(resultColumnWithActions?.minSize).toBeTruthy()
    expect(resultColumnWithoutActions?.minSize).toBeTruthy()
  })

  it('should pass handleChangedInput via meta.props for columns that need it', () => {
    const columns = sentinelDatabasesResultColumnsConfig(
      mockHandleChangedInput,
      mockHandleAddInstance,
      mockIsInvalid,
      mockCountSuccessAdded,
      mockItemsLength,
    )

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

    expect(aliasColumn?.meta?.props.handleChangedInput).toBe(
      mockHandleChangedInput,
    )
    expect(usernameColumn?.meta?.props.handleChangedInput).toBe(
      mockHandleChangedInput,
    )
    expect(passwordColumn?.meta?.props.handleChangedInput).toBe(
      mockHandleChangedInput,
    )
    expect(dbIndexColumn?.meta?.props.handleChangedInput).toBe(
      mockHandleChangedInput,
    )
  })

  it('should pass isInvalid via meta.props for username and password columns', () => {
    const columns = sentinelDatabasesResultColumnsConfig(
      mockHandleChangedInput,
      mockHandleAddInstance,
      mockIsInvalid,
      mockCountSuccessAdded,
      mockItemsLength,
    )

    const usernameColumn = columns.find(
      (col) => col.id === SentinelDatabaseIds.Username,
    )
    const passwordColumn = columns.find(
      (col) => col.id === SentinelDatabaseIds.Password,
    )

    expect(usernameColumn?.meta?.props.isInvalid).toBe(mockIsInvalid)
    expect(passwordColumn?.meta?.props.isInvalid).toBe(mockIsInvalid)
  })

  it('should pass onAddInstance and addActions via meta.props for result column', () => {
    const columns = sentinelDatabasesResultColumnsConfig(
      mockHandleChangedInput,
      mockHandleAddInstance,
      mockIsInvalid,
      mockCountSuccessAdded,
      mockItemsLength,
    )

    const resultColumn = columns.find(
      (col) => col.id === SentinelDatabaseIds.Message,
    )

    expect(resultColumn?.meta?.props.onAddInstance).toBe(mockHandleAddInstance)
    expect(resultColumn?.meta?.props.addActions).toBe(true)
  })

  it('should not include meta.props for columns that do not need it', () => {
    const columns = sentinelDatabasesResultColumnsConfig(
      mockHandleChangedInput,
      mockHandleAddInstance,
      mockIsInvalid,
      mockCountSuccessAdded,
      mockItemsLength,
    )

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
