import React, { useState } from 'react'
import { FlexItem, Grid } from 'uiSrc/components/base/layout/flex'
import { AllIconsType, RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import * as Icons from 'uiSrc/components/base/icons/iconRegistry'
import styled from 'styled-components'
import { Text } from 'uiSrc/components/base/text'
import { type Theme as ThemeType } from 'uiSrc/components/base/theme/types'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { SearchInput } from 'uiSrc/components/base/inputs'
import { ColorText } from '../../garnetinsight/ui/src/components/base/text'

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

export const Gallery = () => {
  const [search, setSearch] = useState('')
  const filteredIcons = Object.keys(Icons).filter((icon) => {
    if (skip.includes(icon)) {
      return false
    }
    if (!search) {
      return true
    }
    // Create regex pattern: each character from search with .* in between
    // Escape special regex characters
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = escapedSearch.split('').join('.*')
    const regex = new RegExp(pattern, 'i')
    return regex.test(icon)
  })
  return (
    <Col gap="l" align="start" justify="start">
      <Row gap="l" align="center">
        <SearchInput
          allowReset
          placeholder="Search icons"
          onChange={(value) => setSearch(value)}
          value={search}
          variant="underline"
        />
        {search !== '' ? (
          <Text size="s">
            <ColorText size="XL" color="accent" variant="italic">
              {search}
            </ColorText>
            :&nbsp;&nbsp;found {filteredIcons.length} icons
          </Text>
        ) : (
          <Text>{filteredIcons.length} icons</Text>
        )}
      </Row>
      <StyledContainer>
        {filteredIcons.map((icon) => {
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
    </Col>
  )
}
