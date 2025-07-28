import React from 'react'
import { useTheme } from '@redis-ui/styles'
import { Col, Grid } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { Title } from 'uiSrc/components/base/text/Title'

const ColorItem = ({
  color,
  colorName,
}: {
  color: string
  colorName: string
}) => (
  <Col
    gap="m"
    style={{
      alignItems: 'center',
      backgroundColor: '#aaa',
      opacity: 0.8,
      padding: 10,
      minWidth: 200,
    }}
  >
    <Text variant="semiBold">{colorName}</Text>
    <div
      style={{
        width: 50,
        height: 50,
        backgroundColor: color,
        border: '1px solid',
      }}
    />
    <Text variant="semiBold"> {color}</Text>
  </Col>
)
const ColorSectionTitle = ({ title }: { title: string }) => (
  <Title size="S" style={{ textAlign: 'center', marginTop: 10 }}>
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
