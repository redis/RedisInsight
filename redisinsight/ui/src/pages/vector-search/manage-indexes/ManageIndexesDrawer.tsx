import React from 'react'
import { DrawerProps } from '@redis-ui/components'
import { useParams } from 'react-router-dom'

import { RiDrawer, RiDrawerBody, RiDrawerHeader } from 'uiBase/layout'

import { ManageIndexesList } from './ManageIndexesList'
import {
  collectManageIndexesDrawerClosedTelemetry,
  collectManageIndexesDrawerOpenedTelemetry,
} from '../telemetry'

export interface ManageIndexesDrawerProps extends DrawerProps {}

export const ManageIndexesDrawer = ({
  open,
  onOpenChange,
  ...rest
}: ManageIndexesDrawerProps) => {
  const { instanceId } = useParams<{ instanceId: string }>()

  const onDrawerDidOpen = () => {
    collectManageIndexesDrawerOpenedTelemetry({
      instanceId,
    })
  }

  const onDrawerDidClose = () => {
    collectManageIndexesDrawerClosedTelemetry({
      instanceId,
    })
  }

  return (
    <RiDrawer
      open={open}
      onOpenChange={onOpenChange}
      onDrawerDidOpen={onDrawerDidOpen}
      onDrawerDidClose={onDrawerDidClose}
      data-testid="manage-indexes-drawer"
      {...rest}
    >
      <RiDrawerHeader title="Manage indexes" />
      <RiDrawerBody data-testid="manage-indexes-drawer-body">
        <ManageIndexesList />
      </RiDrawerBody>
    </RiDrawer>
  )
}
