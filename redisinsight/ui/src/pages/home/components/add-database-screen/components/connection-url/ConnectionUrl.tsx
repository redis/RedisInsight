import React from 'react'
import styled from 'styled-components'

import { FormField } from 'uiSrc/components/base/forms/FormField'
import { TextArea } from 'uiSrc/components/base/inputs'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { RiTooltip } from 'uiSrc/components'
import { FlexGroup, FlexItem } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

const PointerIcon = styled(RiIcon)`
  cursor: pointer;
`

export interface Props {
  value: string
  onChange: (e: React.ChangeEvent<any>) => void
}

const ConnectionUrl = ({ value, onChange }: Props) => (
  <FormField
    label={
      <FlexGroup gap="s" align="center">
        <Text>Connection URL</Text>
        <RiTooltip
          title="The following connection URLs are supported:"
          className="homePage_tooltip"
          position="right"
          content={
            <ul className="homePage_toolTipUl">
              <li>
                <span className="dot" />
                redis://[[username]:[password]]@host:port
              </li>
              <li>
                <span className="dot" />
                rediss://[[username]:[password]]@host:port
              </li>
              <li>
                <span className="dot" />
                host:port
              </li>
            </ul>
          }
        >
          <FlexItem>
            <PointerIcon type="InfoIcon" />
          </FlexItem>
        </RiTooltip>
      </FlexGroup>
    }
  >
    <TextArea
      name="connectionURL"
      id="connectionURL"
      value={value}
      onChangeCapture={onChange}
      placeholder="redis://default@127.0.0.1:6379"
      data-testid="connection-url"
    />
  </FormField>
)

export default ConnectionUrl
