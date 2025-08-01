import React from 'react'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Title } from 'uiSrc/components/base/text/Title'
import { Theme } from './Theme'
import { Gallery } from './Gallery'
import { Colors } from './Colors'

export const PlaygroundPage = () => (
  <Row
    gap="m"
    style={{
      padding: '2rem',
      // backgroundColor: 'yellow',
      maxWidth: '100%',
      position: 'relative',
      maxHeight: '100%',
      overflow: 'auto',
    }}
  >
    <Col
      gap="m"
      style={{ minWidth: 300, position: 'fixed', top: 100, left: 100 }}
    >
      <Title size="L">Playground</Title>
      <ul
        style={{
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <li>
          <a href="#theme">Theme</a>
        </li>
        <li>
          <a href="#icons">Icons</a>
        </li>
        <li>
          <a href="#colors">Colors</a>
        </li>
      </ul>
    </Col>
    <Col gap="xl" align="center">
      <Title id="theme" size="XL" style={{ textAlign: 'center' }}>
        Theme
      </Title>
      <Theme />
      <Title id="icons" size="XL" style={{ textAlign: 'center' }}>
        Icons
      </Title>
      <Gallery />
      <Title
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
    </Col>
  </Row>
)
