import React from 'react'
import { DrawerProps } from '@redis-ui/components'
import { useParams } from 'react-router-dom'
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
} from 'uiSrc/components/base/layout/drawer'
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
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      onDrawerDidOpen={onDrawerDidOpen}
      onDrawerDidClose={onDrawerDidClose}
      data-testid="manage-indexes-drawer"
      {...rest}
    >
      <DrawerHeader title="Manage indexes" />
      <DrawerBody data-testid="manage-indexes-drawer-body">
        <ManageIndexesList />
      </DrawerBody>
    </Drawer>
  )
}
