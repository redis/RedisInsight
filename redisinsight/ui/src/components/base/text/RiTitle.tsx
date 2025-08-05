import React from 'react'
import { Typography } from '@redis-ui/components'

export type TitleProps = React.ComponentProps<typeof Typography.Heading> & {}
export type TitleSize = TitleProps['size']
export const RiTitle = (props: TitleProps) => <Typography.Heading {...props} />
