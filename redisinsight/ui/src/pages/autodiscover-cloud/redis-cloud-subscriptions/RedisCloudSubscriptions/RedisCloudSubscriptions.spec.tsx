import React from 'react'
import { instance, mock } from 'ts-mockito'
import { faker } from '@faker-js/faker'
import {
  RedisCloudSubscription,
  RedisCloudSubscriptionStatus,
  RedisCloudSubscriptionType,
} from 'uiSrc/slices/interfaces'
import { fireEvent, render, screen, waitFor } from 'uiSrc/utils/test-utils'
import RedisCloudSubscriptions, { Props } from './RedisCloudSubscriptions'

const mockedProps = mock<Props>()

const columnsMock = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    enableSorting: true,
  },
  {
    id: 'id',
    accessorKey: 'id',
    header: 'Subscription ID',
    enableSorting: true,
  },
]

const createSubscription = (
  overrides?: Partial<RedisCloudSubscription>,
): RedisCloudSubscription => ({
  id: faker.number.int(),
  name: faker.company.name(),
  numberOfDatabases: faker.number.int({ min: 1, max: 10 }),
  provider: faker.helpers.arrayElement(['AWS', 'GCP', 'Azure']),
  region: faker.helpers.arrayElement(['us-east-1', 'eu-west-1', 'ap-south-1']),
  status: RedisCloudSubscriptionStatus.Active,
  type: RedisCloudSubscriptionType.Fixed,
  free: faker.datatype.boolean(),
  ...overrides,
})

describe('RedisCloudSubscriptions', () => {
  const defaultProps: Partial<Props> = {
    columns: columnsMock,
    subscriptions: [],
    selection: [],
    loading: false,
    account: null,
    error: '',
    onClose: jest.fn(),
    onBack: jest.fn(),
    onSubmit: jest.fn(),
    onSelectionChange: jest.fn(),
  }

  const renderComponent = (propsOverride?: Partial<Props>) => {
    const props = { ...defaultProps, ...propsOverride } as Props
    return render(
      <RedisCloudSubscriptions {...instance(mockedProps)} {...props} />,
    )
  }

  it('should render', () => {
    const subscriptionsMock: RedisCloudSubscription[] = [createSubscription()]
    expect(renderComponent({ subscriptions: subscriptionsMock })).toBeTruthy()
  })

  describe('search functionality', () => {
    const subscriptions: RedisCloudSubscription[] = [
      createSubscription({
        id: 111,
        name: 'Production Database',
        provider: 'AWS',
        region: 'us-east-1',
        status: RedisCloudSubscriptionStatus.Active,
        type: RedisCloudSubscriptionType.Flexible,
      }),
      createSubscription({
        id: 222,
        name: 'Staging Environment',
        provider: 'GCP',
        region: 'eu-west-1',
        status: RedisCloudSubscriptionStatus.Active,
        type: RedisCloudSubscriptionType.Fixed,
      }),
      createSubscription({
        id: 333,
        name: 'Development',
        provider: 'Azure',
        region: 'ap-south-1',
        status: RedisCloudSubscriptionStatus.Error,
        type: RedisCloudSubscriptionType.Fixed,
      }),
    ]

    it('should filter by name', async () => {
      renderComponent({ subscriptions })

      const searchInput = screen.getByTestId('search')
      fireEvent.change(searchInput, { target: { value: 'Production' } })

      await waitFor(() => {
        expect(screen.getByText('Production Database')).toBeInTheDocument()
        expect(
          screen.queryByText('Staging Environment'),
        ).not.toBeInTheDocument()
      })
    })

    it('should filter by id', async () => {
      renderComponent({ subscriptions })

      const searchInput = screen.getByTestId('search')
      fireEvent.change(searchInput, { target: { value: '222' } })

      await waitFor(() => {
        expect(screen.getByText('Staging Environment')).toBeInTheDocument()
        expect(
          screen.queryByText('Production Database'),
        ).not.toBeInTheDocument()
      })
    })

    it('should filter by provider', async () => {
      renderComponent({ subscriptions })

      const searchInput = screen.getByTestId('search')
      fireEvent.change(searchInput, { target: { value: 'AWS' } })

      await waitFor(() => {
        expect(screen.getByText('Production Database')).toBeInTheDocument()
        expect(
          screen.queryByText('Staging Environment'),
        ).not.toBeInTheDocument()
      })
    })

    it('should filter by region', async () => {
      renderComponent({ subscriptions })

      const searchInput = screen.getByTestId('search')
      fireEvent.change(searchInput, { target: { value: 'eu-west' } })

      await waitFor(() => {
        expect(screen.getByText('Staging Environment')).toBeInTheDocument()
        expect(
          screen.queryByText('Production Database'),
        ).not.toBeInTheDocument()
      })
    })

    it('should filter by status', async () => {
      renderComponent({ subscriptions })

      const searchInput = screen.getByTestId('search')
      fireEvent.change(searchInput, { target: { value: 'error' } })

      await waitFor(() => {
        expect(screen.getByText('Development')).toBeInTheDocument()
        expect(
          screen.queryByText('Production Database'),
        ).not.toBeInTheDocument()
      })
    })

    it('should filter by type', async () => {
      renderComponent({ subscriptions })

      const searchInput = screen.getByTestId('search')
      fireEvent.change(searchInput, { target: { value: 'flexible' } })

      await waitFor(() => {
        expect(screen.getByText('Production Database')).toBeInTheDocument()
        expect(
          screen.queryByText('Staging Environment'),
        ).not.toBeInTheDocument()
      })
    })

    it('should be case-insensitive', async () => {
      renderComponent({ subscriptions })

      const searchInput = screen.getByTestId('search')
      fireEvent.change(searchInput, { target: { value: 'PRODUCTION' } })

      await waitFor(() => {
        expect(screen.getByText('Production Database')).toBeInTheDocument()
      })
    })
  })
})
