import { RedisCloudSubscriptionStatus } from 'uiSrc/slices/interfaces'
import { canSelectRow } from './canSelectRow'
import { RedisCloudSubscriptionFactory } from 'uiSrc/mocks/factories/cloud/RedisCloudSubscription.factory'

describe('canSelectRow', () => {
  it('should return true when subscription is active and has databases', () => {
    const row = {
      original: RedisCloudSubscriptionFactory.build({
        status: RedisCloudSubscriptionStatus.Active,
        numberOfDatabases: 5,
      }),
    }

    expect(canSelectRow(row)).toBe(true)
  })

  it('should return false when subscription is not active', () => {
    const row = {
      original: RedisCloudSubscriptionFactory.build({
        status: RedisCloudSubscriptionStatus.Deleting,
        numberOfDatabases: 5,
      }),
    }

    expect(canSelectRow(row)).toBe(false)
  })

  it('should return false when subscription has no databases', () => {
    const row = {
      original: RedisCloudSubscriptionFactory.build({
        status: RedisCloudSubscriptionStatus.Active,
        numberOfDatabases: 0,
      }),
    } as any

    expect(canSelectRow(row)).toBe(false)
  })

  it('should return false when subscription is not active and has no databases', () => {
    const row = {
      original: RedisCloudSubscriptionFactory.build({
        status: RedisCloudSubscriptionStatus.Error,
        numberOfDatabases: 0,
      }),
    }

    expect(canSelectRow(row)).toBe(false)
  })
})
