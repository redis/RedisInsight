import React from 'react'
import { FlexItem, Grid } from 'uiSrc/components/base/layout/flex'
import { AllIconsType, RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import * as Icons from 'uiSrc/components/base/icons/iconRegistry'

const skip = [
  'IconProps',
  'Icon',
  'IconSizeType',
  'IconColorType',
  'ColorIconProps',
  'MonochromeIconProps',
  'IconType',
]
export const Gallery = () => (
  <Grid
    columns={4}
    gap="m"
    centered
    responsive
    style={{
      padding: 10,
      flexGrow: 1,
    }}
  >
    {Object.keys(Icons).map((icon) => {
      if (skip.includes(icon)) {
        return null
      }
      return (
        <FlexItem
          key={icon}
          style={{
            alignItems: 'center',
            backgroundColor: '#ccc',
            padding: '10px',
          }}
        >
          <RiIcon
            type={icon as AllIconsType}
            size="XL"
            color="informative400"
          />
          <span>{icon}</span>
        </FlexItem>
      )
    })}
  </Grid>
)
