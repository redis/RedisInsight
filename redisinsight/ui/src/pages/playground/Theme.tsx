import React, { useMemo, useState } from 'react'
import { useTheme } from '@redis-ui/styles'
import ReactMonacoEditor from 'react-monaco-editor'
import { Col, Grid, Row } from 'uiSrc/components/base/layout/flex'
import Tabs, { TabInfo } from 'uiSrc/components/base/layout/tabs'
import { ColorText, Text, Title } from 'uiSrc/components/base/text'
import { Link } from 'uiSrc/components/base/link/Link'
import { RiTooltip } from 'uiSrc/components'
import MonacoEnvironmentInitializer from 'uiSrc/components/MonacoEnvironmentInitializer/MonacoEnvironmentInitializer'

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
            width={600}
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
          <Col style={{ padding: 20 }} gap="l">
            <Title size="M">
              Name:{' '}
              <ColorText variant="semiBold" color="accent">
                {theme.name}
              </ColorText>
            </Title>
            <Title size="M">
              <Link href="#colors" variant="inline" target="_self">
                Colors
              </Link>
            </Title>
            <Title size="M">Core</Title>
            <Title size="S">Spaces</Title>
            <Spaces spaces={theme.core.space} />
            <Title size="S">Shadows</Title>
            <Shadows shadows={theme.core.shadow} />
            <Title size="S">Fonts</Title>
            <Fonts fonts={theme.core.font} />
            <Title size="S">Z-Index</Title>
            <Row gap="s">
              {Object.entries(theme.core.zIndex).map(([name, value]) => (
                <ZIndexItem key={name} name={name} value={`${value}`} />
              ))}
            </Row>
            <Title size="S">Focus</Title>
            <dl
              style={{
                display: 'flex',
                gap: 8,
              }}
            >
              {Object.entries(theme.core.focus).map(([name, value]) => (
                <React.Fragment key={`${name}-${value}`}>
                  <dt style={{}}>{name}</dt>
                  <dd style={{ fontWeight: 'bold' }}>{value}</dd>
                </React.Fragment>
              ))}
            </dl>
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
/*

        "focus": {
      "margin": "2px",
      "size": "2px",
      "color": "#091a23"
    }
 */
const ZIndexItem = ({ name, value }: { name: string; value: string }) => (
  <Col
    gap="l"
    align="start"
    style={{
      backgroundColor: '#fff',
      opacity: 0.8,
      padding: 10,
      minWidth: 200,
      border: '1px solid',
    }}
  >
    <dl>
      <dt style={{ marginBottom: 5 }}>{name}</dt>
      <dd>
        <Text variant="semiBold">{value}</Text>
      </dd>
    </dl>
  </Col>
)

const Fonts = ({
  fonts,
}: {
  fonts: {
    fontFamily: Record<string, string>
    fontSize: Record<string, string>
  }
}) => (
  <Col gap="m">
    <Title size="XS">Font faces</Title>
    {Object.entries(fonts.fontFamily).map(([name, value]) => (
      <div
        style={{
          padding: 10,
          border: '1px solid',
          backgroundColor: '#fff',
        }}
      >
        <dl>
          <dt style={{ marginBottom: 5 }}>{name}</dt>
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
      </div>
    ))}
    <Title size="XS">Font sizes</Title>

    {Object.entries(fonts.fontSize).map(([name, value]) => (
      <FontItem
        key={name}
        name={name}
        value={value}
        fontFaces={fonts.fontFamily}
      />
    ))}
  </Col>
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
    <Col
      gap="l"
      align="start"
      style={{
        backgroundColor: '#fff',
        opacity: 0.8,
        padding: 10,
        minWidth: 200,
        border: '1px solid',
      }}
    >
      <dl>
        <dt style={{ marginBottom: 5 }}>{name}</dt>
        <dd>
          <Text variant="semiBold">
            {value} {pixels && `(${pixels})`}
          </Text>
          {Object.values(fontFaces).map((fontFace) => (
            <Text
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
    </Col>
  )
}

const Shadows = ({ shadows }: { shadows: Record<string, string> }) => (
  <Grid
    columns={4}
    gap="m"
    centered
    responsive
    style={{ flexGrow: 1, padding: 10, backgroundColor: '#eee' }}
  >
    {Object.entries(shadows).map(([name, value]) => (
      <ShadowItem key={name} name={name} value={value} />
    ))}
  </Grid>
)

const ShadowItem = ({ name, value }: { name: string; value: string }) => {
  const style = {
    width: '100%',
    height: 35,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    border: '1px solid #00000022',
    boxShadow: value,
  }

  return (
    <Col
      gap="l"
      align="start"
      style={{
        backgroundColor: '#fff',
        opacity: 0.8,
        padding: '30px',
        minWidth: 200,
        border: '1px solid',
      }}
    >
      <div style={style}>
        <RiTooltip title={value}>
          <Text>{name}</Text>
        </RiTooltip>
      </div>
    </Col>
  )
}
const Spaces = ({ spaces }: { spaces: Record<string, string> }) => (
  <Grid
    columns={4}
    gap="m"
    centered
    responsive
    style={{ flexGrow: 1, padding: 10, backgroundColor: '#eee' }}
  >
    {Object.entries(spaces).map(([name, value]) => (
      <SpaceItem key={name} name={name} value={value} />
    ))}
  </Grid>
)

const SpaceItem = ({ name, value }: { name: string; value: string }) => {
  const style = {
    width: 50,
    height: 15,
    backgroundColor: 'transparent',
    border: '1px solid black',
  }

  const { pixels } = convertToPixels(value)

  return (
    <Col
      gap="l"
      align="start"
      style={{
        backgroundColor: '#eee',
        opacity: 0.8,
        padding: 10,
        minWidth: 200,
        border: '1px solid',
      }}
    >
      <dl>
        <dt style={{ marginBottom: 5 }}>{name}</dt>
        <dd>
          <Text variant="semiBold">
            {value} {pixels && `(${pixels})`}
          </Text>
        </dd>
      </dl>

      <Row style={{ gap: value }}>
        <div style={style} />
        <div style={style} />
      </Row>
    </Col>
  )
}
