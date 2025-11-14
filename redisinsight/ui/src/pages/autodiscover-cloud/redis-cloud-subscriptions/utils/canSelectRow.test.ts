import {
  RedisCloudSubscription,
  RedisCloudSubscriptionStatus,
} from 'uiSrc/slices/interfaces'
import { canSelectRow } from './canSelectRow'

describe('canSelectRow', () => {
  it('should return true when subscription is active and has databases', () => {
    const row = {
      original: {
        id: 1,
        status: RedisCloudSubscriptionStatus.Active,
        numberOfDatabases: 5,
      } as RedisCloudSubscription,
    } as any

    expect(canSelectRow(row)).toBe(true)
  })

  it('should return false when subscription is not active', () => {
    const row = {
      original: {
        id: 1,
        status: RedisCloudSubscriptionStatus.Deleting,
        numberOfDatabases: 5,
      } as RedisCloudSubscription,
    } as any

    expect(canSelectRow(row)).toBe(false)
  })

  it('should return false when subscription has no databases', () => {
    const row = {
      original: {
        id: 1,
        status: RedisCloudSubscriptionStatus.Active,
        numberOfDatabases: 0,
      } as RedisCloudSubscription,
    } as any

    expect(canSelectRow(row)).toBe(false)
  })

  it('should return false when subscription is not active and has no databases', () => {
    const row = {
      original: {
        id: 1,
        status: RedisCloudSubscriptionStatus.Error,
        numberOfDatabases: 0,
      } as RedisCloudSubscription,
    } as any

    expect(canSelectRow(row)).toBe(false)
  })
})
