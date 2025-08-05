import React, { useEffect, useMemo } from 'react'
import { Link } from 'uiSrc/components/base/link/Link'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { RiDestructiveButton } from 'uiSrc/components/base/forms'
import { ColorText } from 'uiSrc/components/base/text'

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
      <ColorText color="danger">
        <Col>
          <FlexItem>
            <div>Review the error log for details.</div>
            <Link
              variant="small"
              isExternalLink
              href={fileUrl}
              download="error-log.txt"
              data-testid="donwload-log-file-btn"
              style={{ marginTop: '10px', paddingLeft: 0 }}
            >
              Download Error Log File
            </Link>
          </FlexItem>
        </Col>
      </ColorText>

      <Spacer />
      {/* // TODO remove display none when logs column will be available */}
      <Row style={{ display: 'none' }} justify="end">
        <FlexItem>
          <RiDestructiveButton
            size="s"
            onClick={() => {}}
            className="toast-danger-btn"
            data-testid="see-errors-btn"
          >
            Remove API key
          </RiDestructiveButton>
        </FlexItem>
      </Row>
    </>
  )
}

export default RdiDeployErrorContent
