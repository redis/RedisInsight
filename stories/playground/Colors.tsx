import React, { useState } from 'react'
import styled from 'styled-components'
import { useTheme } from '@redis-ui/styles'
import { Col, Grid, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { Title } from 'uiSrc/components/base/text/Title'
import { type Theme as ThemeType } from 'uiSrc/components/base/theme/types'
import { ColorText } from 'uiSrc/components/base/text'
import SearchInput from 'uiSrc/components/base/inputs/SearchInput'

const StyledColorContainer = styled(Col).attrs({
  gap: 'l',
  justify: 'start',
})`
  max-height: 600px;
  height: 600px;
  overflow-y: auto;
  background-color: ${({ theme }: { theme: ThemeType }) =>
    theme.semantic.color.background.neutral300};
`

const StyledColorItem = styled(Col).attrs({
  gap: 's',
  justify: 'center',
  align: 'center',
})`
  background-color: ${({ theme }: { theme: ThemeType }) =>
    theme.semantic.color.background.neutral300};
  opacity: 0.8;
  padding: 5px;
  min-width: 100;
  border: 1px solid
    ${({ theme }: { theme: ThemeType }) =>
      theme.semantic.color.border.neutral500};
`

const ColorSquare = styled.div<{
  $color: any
}>`
  width: 40px;
  height: 40px;
  border: 1px solid;
  background-color: ${({ $color }) => $color};
`
const ColorItem = ({
  color,
  colorName,
}: {
  color: string
  colorName: string
}) => (
  <StyledColorItem>
    <Text variant="semiBold" component="span" color="primary">
      {colorName}
    </Text>
    <ColorSquare $color={color} />
    <Text variant="semiBold" component="span" color="primary">
      {color}
    </Text>
  </StyledColorItem>
)
const ColorSectionTitle = ({ title }: { title: string }) => (
  <Title
    size="S"
    color="secondary"
    style={{ textAlign: 'center', marginTop: 10 }}
  >
    {title}
  </Title>
)

const ColorSection = ({
  title,
  colors,
}: {
  title: string
  colors: [string, string][]
}) => (
  <>
    <ColorSectionTitle title={title} />
    <Grid
      columns={4}
      gap="m"
      centered
      responsive
      style={{
        flexGrow: 1,
        padding: 10,
      }}
    >
      {colors.map(([colorName, color]) => (
        <ColorItem key={colorName} color={color} colorName={colorName} />
      ))}
    </Grid>
  </>
)

export const Colors = () => {
  const theme = useTheme()
  const { color: rootColors, semantic } = theme
  const { color: semanticColors } = semantic
  const [search, setSearch] = useState('')
  // Create regex pattern: each character from search with .* in between
  // Escape special regex characters
  const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = escapedSearch.split('').join('.*')
  const regex = new RegExp(pattern, 'i')
  let semanticCount = 0

  const filteredSemanticColors = Object.keys(semanticColors).reduce(
    (acc, colorSection) => {
      const tempColors = semanticColors[colorSection as keyof typeof semanticColors]
      Object.entries(tempColors).forEach(([colorName, color]) => {
        if (!search || regex.test(colorName)) {
          semanticCount++
          if (acc[colorSection] === undefined) {
            acc[colorSection] = {}
          }
          acc[colorSection][colorName] = color
        }
      })
      return acc
    },
    {} as Record<string, Record<string, string>>,
  )
  const filteredRootColors = Object.entries(rootColors).filter(
    ([colorName]) => {
      if (!search) {
        return true
      }
      // Create regex pattern: each character from search with .* in between
      // Escape special regex characters
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const pattern = escapedSearch.split('').join('.*')
      const regex = new RegExp(pattern, 'i')
      return regex.test(colorName)
    },
  )

  return (
    <StyledColorContainer>
      <Row gap="l" align="center" grow={false}>
        <SearchInput
          allowReset
          placeholder="Search colors"
          onChange={(value) => setSearch(value)}
          value={search}
          variant="underline"
        />
        {search !== '' ? (
          <Text size="s">
            <ColorText size="XL" color="accent" variant="italic">
              {search}
            </ColorText>
            :&nbsp;&nbsp;found {filteredRootColors.length + semanticCount}{' '}
            colors
          </Text>
        ) : (
          <Text>{filteredRootColors.length + semanticCount} colors</Text>
        )}
      </Row>

      <ColorSection title="Root colors" colors={filteredRootColors} />
      <ColorSectionTitle title="Semantic colors" />
      {Object.entries(filteredSemanticColors).map(([colorSection, colors]) => (
        <ColorSection
          title={`Semantic: ${colorSection}`}
          colors={Object.entries(colors)}
          key={`semantic-${colorSection}`}
        />
      ))}
    </StyledColorContainer>
  )
}
