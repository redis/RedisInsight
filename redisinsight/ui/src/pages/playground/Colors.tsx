import React from 'react'
import { useTheme } from '@redis-ui/styles'
import { Col, Grid } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { Title } from 'uiSrc/components/base/text/Title'
import { type Theme as ThemeType } from 'uiSrc/components/base/theme/types'
import styled from 'styled-components'

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
  return (
    <>
      <ColorSection title="Root colors" colors={Object.entries(rootColors)} />
      <ColorSectionTitle title="Semantic colors" />
      {Object.entries(semanticColors).map(([colorSection, colors]) => (
        <ColorSection
          title={`Semantic: ${colorSection}`}
          colors={Object.entries(colors)}
          key={`semantic-${colorSection}`}
        />
      ))}
    </>
  )
}
