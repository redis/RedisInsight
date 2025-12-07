import cx from 'classnames'
import React from 'react'
import JSONBigInt from 'json-bigint'

import JsonPretty from 'uiSrc/components/json-viewer/components/json-pretty'
import { formatLongName } from 'uiSrc/utils'
import { TOOLTIP_CONTENT_MAX_LENGTH } from 'uiSrc/constants'

interface Props {
  value: string
  expanded?: boolean
  space?: number
  useNativeBigInt?: boolean
  tooltip?: boolean
}

const JSONViewer = (props: Props) => {
  const {
    value,
    expanded = false,
    space = 2,
    useNativeBigInt = true,
    tooltip = false,
  } = props

  try {
    const className = cx('jsonViewer', {
      'jsonViewer-collapsed': !expanded && !tooltip,
    })
    const data = JSONBigInt({ useNativeBigInt }).parse(value)

    if (tooltip && value?.length > TOOLTIP_CONTENT_MAX_LENGTH) {
      return { value: formatLongName(value), isValid: true }
    }

    return {
      value: (
        <div className={className} data-testid="value-as-json">
          <JsonPretty data={data} space={space} />
        </div>
      ),
      isValid: true,
    }
  } catch (e) {
    return {
      value,
      isValid: false,
    }
  }
}

export default JSONViewer
