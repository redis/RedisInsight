import React, { useMemo, useState } from 'react'
import styled, { css } from 'styled-components'
import { useTheme } from '@redis-ui/styles'
import ReactMonacoEditor from 'react-monaco-editor'
import { Col, Grid, Row } from 'uiSrc/components/base/layout/flex'
import Tabs, { TabInfo } from 'uiSrc/components/base/layout/tabs'
import { ColorText, Text, Title } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'
import MonacoEnvironmentInitializer from 'uiSrc/components/MonacoEnvironmentInitializer/MonacoEnvironmentInitializer'
import { type Theme as ThemeType } from 'uiSrc/components/base/theme/types'

enum ThemeTabs {
  raw = 'raw',
  formatted = 'formatted',
}

/**
 * Converts a CSS value to pixels if it's not already in pixels
 * @param value CSS value (e.g., '1rem', '10px', '50%')
 * @returns The original value and the calculated pixel value if applicable
 */
const convertToPixels = (value: string) => {
  // If it's already in pixels, return as is
  if (value.endsWith('px')) {
    return { original: value, pixels: value }
  }

  // Handle rem values
  if (value.endsWith('rem')) {
    const remValue = parseFloat(value)
    // Get the root font size (default to 16px if not set)
    const rootFontSize =
      parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
    const pixelValue = remValue * rootFontSize
    return { original: value, pixels: `${pixelValue.toFixed(2)}px` }
  }

  // Handle em values (would need the element's font size)
  // This is more complex as it depends on the parent element

  // For other units, return null for pixels
  return { original: value, pixels: null }
}

export const Theme = () => {
  const theme = useTheme()
  const monacoOptions = {
    readOnly: true,
    automaticLayout: true,
    minimap: {
      enabled: false,
    },
  }
  const [viewTab, setViewTab] = useState(ThemeTabs.raw)
  const tabs: TabInfo[] = useMemo(() => {
    const visibleTabs: TabInfo[] = [
      {
        value: ThemeTabs.raw,
        content: (
          <ReactMonacoEditor
            language="json"
            value={JSON.stringify(theme, null, 2)}
            options={monacoOptions}
            theme={theme.name === 'dark' ? 'vs-dark' : 'vs'}
            height={500}
            width={800}
          />
        ),
        label: (
          <Text color="secondary" component="div">
            Raw
          </Text>
        ),
      },
      {
        value: ThemeTabs.formatted,
        content: (
          <Col
            style={{ padding: 20, maxHeight: 500, overflowY: 'scroll' }}
            gap="l"
          >
            <Title size="M">
              Name:&nbsp;
              <ColorText variant="semiBold" color="accent">
                {theme.name}
              </ColorText>
            </Title>
            <Title size="M">Core</Title>
            <Title size="S">Spaces</Title>
            <Spaces spaces={theme.core.space} />
            <Title size="S">Shadows</Title>
            <Shadows shadows={theme.core.shadow} />
            <Title size="S">Fonts</Title>
            <Fonts fonts={theme.core.font} />
          </Col>
        ),
        label: (
          <Text color="secondary" component="div">
            Formatted
          </Text>
        ),
      },
    ]

    return visibleTabs
  }, [viewTab, theme.name])
  const handleTabChange = (id: string) => {
    if (viewTab === id) return
    setViewTab(id as ThemeTabs)
  }
  return (
    <Col align="center" style={{ maxWidth: 1000, minWidth: 600 }}>
      <MonacoEnvironmentInitializer />
      <Tabs tabs={tabs} value={viewTab} onChange={handleTabChange} />
    </Col>
  )
}

const FontFacesContainer = styled(Col).attrs({
  gap: 'l',
  align: 'stretch',
})`
  padding: 10px;
  opacity: 0.8;
  min-width: 200px;
  flex-grow: 1;
  background-color: ${({ theme }: { theme: ThemeType }) =>
    theme.semantic.color.background.neutral100};
`

const StyledFontItem = styled.div`
  flex-grow: 1;
  padding: 10px;
  border: 1px solid
    ${({ theme }: { theme: ThemeType }) =>
      theme.semantic.color.border.neutral500};
  background-color: ${({ theme }: { theme: ThemeType }) =>
    theme.semantic.color.background.neutral100};
`

const Fonts = ({
  fonts,
}: {
  fonts: {
    fontFamily: Record<string, string>
    fontSize: Record<string, string>
  }
}) => (
  <FontFacesContainer>
    <Title size="S" variant="semiBold" color="primary">
      Font faces
    </Title>
    {Object.entries(fonts.fontFamily).map(([name, value]) => (
      <StyledFontItem>
        <dl>
          <dt style={{ marginBottom: 5 }}>
            <ColorText variant="semiBold" color="accent">
              {name}
            </ColorText>
          </dt>
          <dd>
            <Text
              size="L"
              variant="semiBold"
              style={{
                fontFamily: `${value}`,
              }}
            >
              {value}
            </Text>
          </dd>
        </dl>
      </StyledFontItem>
    ))}
    <Title size="S" variant="semiBold" color="primary">
      Font sizes
    </Title>

    {Object.entries(fonts.fontSize).map(([name, value]) => (
      <FontItem
        key={name}
        name={name}
        value={value}
        fontFaces={fonts.fontFamily}
      />
    ))}
  </FontFacesContainer>
)

const FontItem = ({
  name,
  value,
  fontFaces,
}: {
  name: string
  value: string
  fontFaces: Record<string, string>
}) => {
  const { pixels } = convertToPixels(value)

  return (
    <StyledFontItem>
      <dl>
        <dt style={{ marginBottom: 5 }}>
          <ColorText variant="semiBold" color="accent">
            {name}
          </ColorText>
        </dt>
        <dd>
          <Text variant="semiBold" color="primary">
            {value} {pixels && `(${pixels})`}
          </Text>
          {Object.values(fontFaces).map((fontFace) => (
            <Text
              color="secondary"
              key={`${name}-${value}`}
              style={{
                fontFamily: fontFace,
                fontSize: value,
              }}
            >
              Sample text 0124 ,.;:
            </Text>
          ))}
        </dd>
      </dl>
    </StyledFontItem>
  )
}

const ThemeContainer = styled(Grid).attrs({
  columns: 4,
  gap: 'm',
  centered: true,
  responsive: true,
})`
  padding: 10px;
  flex-grow: 1;
  background-color: ${({ theme }: { theme: ThemeType }) =>
    theme.semantic.color.background.neutral100};
`

const Shadows = ({ shadows }: { shadows: Record<string, string> }) => (
  <ThemeContainer>
    {Object.entries(shadows).map(([name, value]) => (
      <ShadowItem key={`shadow-${name}`} name={name} value={value} />
    ))}
  </ThemeContainer>
)

const StyledItemContainer = styled(Col).attrs({
  gap: 'l',
  align: 'start',
})`
  opacity: 0.8;
  padding: 30px;
  min-width: 200px;
  border: 1px solid
    ${({ theme }: { theme: ThemeType }) =>
      theme.semantic.color.border.neutral500};
  background-color: ${({ theme }: { theme: ThemeType }) =>
    theme.semantic.color.background.neutral100};
`
const StyledShadowItem = styled.div<{
  $value: string
  children?: React.ReactNode
}>`
  width: 100%;
  height: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  border: 1px solid
    ${({ theme }: { theme: ThemeType }) =>
      theme.semantic.color.border.neutral500};
  box-shadow: ${({ $value }) => css`
    ${$value}
  `};
`

const ShadowItem = ({ name, value }: { name: string; value: string }) => {
  return (
    <StyledItemContainer>
      <StyledShadowItem $value={value}>
        <RiTooltip title={value}>
          <Text color="accent">{name}</Text>
        </RiTooltip>
      </StyledShadowItem>
    </StyledItemContainer>
  )
}

const Spaces = ({ spaces }: { spaces: Record<string, string> }) => (
  <ThemeContainer>
    {Object.entries(spaces).map(([name, value]) => (
      <SpaceItem key={name} name={name} value={value} />
    ))}
  </ThemeContainer>
)
const StyledSpaceItem = styled.div`
  width: 50px;
  height: 15px;
  background-color: transparent;
  border: 1px solid
    ${({ theme }: { theme: ThemeType }) =>
      theme.semantic.color.border.neutral800};
`
const SpaceItem = ({ name, value }: { name: string; value: string }) => {
  const { pixels } = convertToPixels(value)

  return (
    <StyledItemContainer>
      <dl>
        <dt style={{ marginBottom: 5 }}>
          <ColorText variant="semiBold" color="accent">
            {name}
          </ColorText>
        </dt>
        <dd>
          <Text variant="semiBold" color="primary">
            {value} {pixels && `(${pixels})`}
          </Text>
        </dd>
      </dl>

      <Row style={{ gap: value }}>
        <StyledSpaceItem />
        <StyledSpaceItem />
      </Row>
    </StyledItemContainer>
  )
}
