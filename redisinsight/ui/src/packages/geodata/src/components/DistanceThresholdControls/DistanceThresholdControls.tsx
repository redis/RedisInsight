import React, { useState } from 'react'

import { Slider } from 'uiSrc/components/base/inputs'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { TextButton } from 'uiSrc/components/base/forms/buttons/TextButton'
import { Text } from 'uiSrc/components/base/text'

import { DEFAULT_DISTANCE_THRESHOLDS } from '../GeoPlot/GeoPlot.constants'
import { DistanceThresholdControlsProps } from './DistanceThresholdControls.types'
import * as S from './DistanceThresholdControls.styles'

const CLOSE_MIN = 0.2
const CLOSE_MAX = 0.6
const MIDDLE_MIN = 0.6
const MIDDLE_MAX = 0.95
const STEP = 0.05

export const DistanceThresholdControls = ({
  thresholds,
  onChange,
}: DistanceThresholdControlsProps) => {
  const [expanded, setExpanded] = useState(false)
  const isDefault =
    thresholds.close === DEFAULT_DISTANCE_THRESHOLDS.close &&
    thresholds.middle === DEFAULT_DISTANCE_THRESHOLDS.middle

  const updateClose = (value: number) =>
    onChange({
      close: Math.min(value, thresholds.middle - STEP),
      middle: thresholds.middle,
    })

  const updateMiddle = (value: number) =>
    onChange({
      close: thresholds.close,
      middle: Math.max(value, thresholds.close + STEP),
    })

  return (
    <S.Panel data-testid="threshold-controls">
      <Col gap="m">
        <Row gap="m" justify="between" align="center">
          <TextButton
            size="small"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
          >
            Distance thresholds
          </TextButton>
          {expanded && (
            <TextButton
              size="small"
              onClick={() => onChange(DEFAULT_DISTANCE_THRESHOLDS)}
              disabled={isDefault}
            >
              Reset
            </TextButton>
          )}
        </Row>
        {expanded && (
          <Row gap="m" wrap>
            <Col gap="xs">
              <Text size="XS">
                Close {Math.round(thresholds.close * 100)}%
              </Text>
              <Slider
                min={CLOSE_MIN}
                max={CLOSE_MAX}
                step={STEP}
                value={[thresholds.close]}
                onChange={(values: number[]) => updateClose(values[0])}
                aria-label="Close threshold"
              />
            </Col>
            <Col gap="xs">
              <Text size="XS">
                Mid {Math.round(thresholds.middle * 100)}%
              </Text>
              <Slider
                min={MIDDLE_MIN}
                max={MIDDLE_MAX}
                step={STEP}
                value={[thresholds.middle]}
                onChange={(values: number[]) => updateMiddle(values[0])}
                aria-label="Mid threshold"
              />
            </Col>
          </Row>
        )}
      </Col>
    </S.Panel>
  )
}
