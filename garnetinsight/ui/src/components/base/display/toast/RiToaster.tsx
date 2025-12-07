import React from 'react'
import { toast, Toaster } from '@redis-ui/components'

type RiToasterProps = React.ComponentProps<typeof Toaster>
const DEFAULT_LIFETIME = 6000

export const RiToaster = (props: RiToasterProps) => (
  <Toaster
    position={toast.Position.BottomRight}
    newestOnTop
    pauseOnHover
    autoClose={DEFAULT_LIFETIME}
    {...props}
  />
)
