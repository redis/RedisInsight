import React, { useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useDispatch } from 'react-redux'
import { BuildType } from 'uiSrc/constants/env'
import { ConnectionType, Instance } from 'uiSrc/slices/interfaces'

import InstanceHeader from './InstanceHeader'
import { DBInstanceFactory } from 'uiSrc/mocks/factories/database/DBInstance.factory'
import {
  getDatabaseConfigInfoSuccess,
  setConnectedInfoInstanceSuccess,
  setConnectedInstanceSuccess,
} from 'uiSrc/slices/instances/instances'
import { getServerInfoSuccess } from 'uiSrc/slices/app/info'
import { setDbIndexState } from 'uiSrc/slices/app/context'
import { fn } from 'storybook/test'

interface InstanceHeaderArgs {
  instance?: Partial<Instance>
  databases?: number
  buildType?: BuildType | null
  dbIndexDisabled?: boolean
  returnUrl?: string | null
  onChangeDbIndex?: (index: number) => void
}

const StorePopulator = ({ args }: { args: InstanceHeaderArgs }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    // Build instance from factory with optional overrides
    const instance = DBInstanceFactory.build({
      db: 0,
      loading: false,
      ...args.instance,
    })

    dispatch(setConnectedInstanceSuccess(instance))

    // Set instance info (includes databases count)
    dispatch(
      setConnectedInfoInstanceSuccess({
        version: instance.version ?? '7.0.0',
        server: {},
        databases: args.databases ?? 1,
      } as any),
    )

    // Set instance overview (includes version)
    dispatch(
      getDatabaseConfigInfoSuccess({
        version: instance.version ?? '7.0.0',
      } as any),
    )

    // Set server info (buildType)
    if (args.buildType) {
      dispatch(
        getServerInfoSuccess({
          buildType: args.buildType,
        } as any),
      )
    }

    // Set db index disabled state
    if (args.dbIndexDisabled !== undefined) {
      dispatch(setDbIndexState(args.dbIndexDisabled))
    }
  }, [dispatch, args])

  return null
}

const meta: Meta<typeof InstanceHeader> = {
  component: InstanceHeader,
  decorators: [
    (Story, context) => {
      // storeArgs is a custom parameter (not built-in) used to pass data for Redux store setup
      const storeArgs =
        (context.parameters?.storeArgs as InstanceHeaderArgs) || {}

      return (
        <>
          <StorePopulator args={storeArgs} />
          <Story />
        </>
      )
    },
  ],
  args: {
    onChangeDbIndex: fn(),
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithMultipleDatabases: Story = {
  parameters: {
    storeArgs: {
      databases: 16,
      instance: {
        db: 5,
      },
    } as InstanceHeaderArgs,
  },
}

export const WithLongDatabaseName: Story = {
  parameters: {
    storeArgs: {
      instance: {
        name: 'Very Long Database Name That Should Truncate With Ellipsis',
      },
    } as InstanceHeaderArgs,
  },
}

export const RedisStack: Story = {
  parameters: {
    storeArgs: {
      buildType: BuildType.RedisStack,
      instance: {
        name: 'Redis Stack Instance',
        modules: [
          { name: 'search', version: 20400, semanticVersion: '2.4.0' },
          { name: 'json', version: 20000, semanticVersion: '2.0.0' },
        ],
      },
    } as InstanceHeaderArgs,
  },
}

export const WithReturnUrl: Story = {
  parameters: {
    storeArgs: {
      returnUrl: '/some/path',
    } as InstanceHeaderArgs,
  },
}

export const Loading: Story = {
  parameters: {
    storeArgs: {
      instance: {
        loading: true,
      },
    } as InstanceHeaderArgs,
  },
}

export const DbIndexDisabled: Story = {
  parameters: {
    storeArgs: {
      databases: 16,
      instance: {
        db: 3,
      },
      dbIndexDisabled: true,
    } as InstanceHeaderArgs,
  },
}

export const ClusterConnection: Story = {
  parameters: {
    storeArgs: {
      instance: {
        connectionType: ConnectionType.Cluster,
        name: 'Redis Cluster',
        host: 'cluster.example.com',
        port: 7000,
      },
    } as InstanceHeaderArgs,
  },
}
