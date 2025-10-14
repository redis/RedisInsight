import React from 'react'
import { FlexItem, Grid } from 'uiSrc/components/base/layout/flex'
import { AllIconsType, RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import * as Icons from 'uiSrc/components/base/icons/iconRegistry'
import styled from 'styled-components'
import { Text } from 'uiSrc/components/base/text'
import { type Theme as ThemeType } from 'uiSrc/components/base/theme/types'

const skip = [
  'IconProps',
  'Icon',
  'IconSizeType',
  'IconColorType',
  'ColorIconProps',
  'MonochromeIconProps',
  'IconType',
]

const StyledContainer = styled(Grid).attrs({
  columns: 3,
  gap: 'm',
  centered: true,
  responsive: true,
})`
  height: 600px;
  width: 100%;
  overflow-y: scroll;
  flex-shrink: 0;
  flex-grow: 0;
  gap: 1rem;
`

const StyledIcon = styled(FlexItem)`
  height: 70px;
  padding: 5px;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  svg {
    display: block;
  }
  background-color: ${({ theme }: { theme: ThemeType }) =>
    theme.semantic.color.background.neutral300};
  border: 1px solid
    ${({ theme }: { theme: ThemeType }) =>
      theme.semantic.color.border.neutral500};
`

export const Gallery = () => (
  <StyledContainer>
    {Object.keys(Icons).map((icon) => {
      if (skip.includes(icon)) {
        return null
      }
      return (
        <StyledIcon key={icon}>
          <RiIcon
            type={icon as AllIconsType}
            size="XL"
            color="informative400"
          />
          <Text color="primary" size="S" component="span">
            {icon}
          </Text>
        </StyledIcon>
      )
    })}
  </StyledContainer>
)
