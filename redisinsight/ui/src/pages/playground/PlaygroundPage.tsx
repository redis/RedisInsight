import React, { useState } from 'react'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Title } from 'uiSrc/components/base/text/Title'
import { Theme } from './Theme'
import { Gallery } from './Gallery'
import { Colors } from './Colors'
import styled, { ThemeProvider } from 'styled-components'
import { themeDark, themeLight, themeOld } from '@redis-ui/styles'
import { type Theme as ThemeType } from 'uiSrc/components/base/theme/types'
import { Text } from 'uiSrc/components/base/text'

const Container = styled(Row).attrs({ gap: 'm' })`
  padding: 2rem;
  background-color: ${({ theme }: { theme: ThemeType }) =>
    theme.semantic.color.background.neutral100};
  max-width: 100%;
`
const MainContent = styled(Col).attrs({ gap: 'xl', align: 'center' })`
  flex-grow: 1;
`
const NavContainer = styled(Col).attrs({ gap: 'm', grow: false })`
  height: 100%;
  min-width: 200px;
  background-color: rgb(
    from
      ${({ theme }: { theme: ThemeType }) =>
        theme.semantic.color.background.neutral100}
      r g b / 0.75
  );
`

const NavContent = styled.ul`
  position: sticky;
  top: 10px;
  z-index: 100;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

export const PlaygroundPage = () => {
  const [uiTheme, setUiTheme] = useState(themeLight)

  return (
    <ThemeProvider theme={uiTheme}>
      <Container>
        <NavContainer>
          <Title color="primary" size="L">
            Playground
          </Title>
          <NavContent>
            <li>
              <label>
                <Text variant="semiBold" color="primary" component="span">
                  Theme:
                </Text>
                &nbsp;
                <select
                  style={{
                    height: 30,
                    width: 100,
                    fontWeight: 'bold',
                  }}
                  onChange={(event) => {
                    let theme = uiTheme
                    switch (event.target.value) {
                      case 'd':
                        theme = themeDark
                        break
                      case 'l':
                        theme = themeLight
                        break
                      default:
                        theme = themeOld
                    }
                    setUiTheme(theme)
                  }}
                >
                  <option value="l">Light</option>
                  <option value="d">Dark</option>
                  <option value="o">Old theme</option>
                </select>
              </label>
            </li>
            <li>
              <Text variant="semiBold" color="primary" component="span">
                <a href="#theme">Theme</a>
              </Text>
            </li>
            <li>
              <Text variant="semiBold" color="primary" component="span">
                <a href="#icons">Icons</a>
              </Text>
            </li>
            <li>
              <Text variant="semiBold" color="primary" component="span">
                <a href="#colors">Colors</a>
              </Text>
            </li>
          </NavContent>
          <div
            style={{
              height: 10000,
            }}
          />
        </NavContainer>
        <MainContent>
          <Title
            color="primary"
            id="theme"
            size="XL"
            style={{ textAlign: 'center' }}
          >
            Theme
          </Title>
          <Theme />
          <Title
            color="primary"
            id="icons"
            size="XL"
            style={{ textAlign: 'center' }}
          >
            Icons
          </Title>
          <Gallery />
          <Title
            color="primary"
            id="colors"
            size="XL"
            style={{
              textAlign: 'center',
              marginTop: 100,
            }}
          >
            Colors
          </Title>
          <Colors />
        </MainContent>
      </Container>
    </ThemeProvider>
  )
}
