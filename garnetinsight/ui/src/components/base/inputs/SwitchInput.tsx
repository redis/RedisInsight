import React from 'react'

import { Switch } from '@redis-ui/components'

type SwitchInputProps = Omit<React.ComponentProps<typeof Switch>, 'titleOn'>

const SwitchInput = ({
  style,
  title,
  titleOff,
  ...props
}: SwitchInputProps) => (
  <Switch
    {...props}
    titleOn={title}
    titleOff={titleOff !== undefined ? titleOff : title}
    style={{
      alignItems: 'center',
      ...style,
    }}
  />
)

export default SwitchInput
