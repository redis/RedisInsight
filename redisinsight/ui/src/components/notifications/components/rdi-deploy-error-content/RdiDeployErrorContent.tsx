import React, { useEffect, useMemo } from 'react'
import { RiLink } from 'uiBase/display'
import { RiCol, RiFlexItem, RiRow } from 'uiBase/layout'
import { RiSpacer } from 'uiBase/layout/spacer'
import { RiDestructiveButton } from 'uiBase/forms'
import { RiColorText } from 'uiBase/text'

export interface Props {
  message: string
  // eslint-disable-next-line react/no-unused-prop-types
  onClose?: () => void
}

const RdiDeployErrorContent = (props: Props) => {
  const { message } = props

  const fileUrl = useMemo(() => {
    const blob = new Blob([message], { type: 'text/plain' })
    return URL.createObjectURL(blob)
  }, [message])

  useEffect(
    () => () => {
      URL.revokeObjectURL(fileUrl)
    },
    [fileUrl],
  )

  return (
    <>
      <RiColorText color="danger">
        <RiCol>
          <RiFlexItem>
            <div>Review the error log for details.</div>
            <RiLink
              variant="small"
              isExternalLink
              href={fileUrl}
              download="error-log.txt"
              data-testid="donwload-log-file-btn"
              style={{ marginTop: '10px', paddingLeft: 0 }}
            >
              Download Error Log File
            </RiLink>
          </RiFlexItem>
        </RiCol>
      </RiColorText>

      <RiSpacer />
      {/* // TODO remove display none when logs column will be available */}
      <RiRow style={{ display: 'none' }} justify="end">
        <RiFlexItem>
          <RiDestructiveButton
            size="s"
            onClick={() => {}}
            className="toast-danger-btn"
            data-testid="see-errors-btn"
          >
            Remove API key
          </RiDestructiveButton>
        </RiFlexItem>
      </RiRow>
    </>
  )
}

export default RdiDeployErrorContent
