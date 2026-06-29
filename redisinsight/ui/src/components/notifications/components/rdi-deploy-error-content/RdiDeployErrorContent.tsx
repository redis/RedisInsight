import React, { useEffect, useMemo } from 'react'
import { useTranslation } from 'uiSrc/i18n'
import { Link } from 'uiSrc/components/base/link/Link'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { DestructiveButton } from 'uiSrc/components/base/forms/buttons'
import { ColorText } from 'uiSrc/components/base/text'

export interface Props {
  message: string
  // eslint-disable-next-line react/no-unused-prop-types
  onClose?: () => void
}

const RdiDeployErrorContent = (props: Props) => {
  const { message } = props
  const { t } = useTranslation()

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
            <div>{t('notification.error.code.11401.reviewLog')}</div>
            <Link
              variant="inline"
              size="S"
              href={fileUrl}
              download="error-log.txt"
              data-testid="donwload-log-file-btn"
              style={{ marginTop: '10px', paddingLeft: 0 }}
            >
              {t('notification.error.code.11401.button.downloadLog')}
            </Link>
          </FlexItem>
        </Col>
      </ColorText>

      <Spacer />
      {/* // TODO remove display none when logs column will be available */}
      <Row style={{ display: 'none' }} justify="end">
        <FlexItem>
          <DestructiveButton
            size="s"
            onClick={() => {}}
            className="toast-danger-btn"
            data-testid="see-errors-btn"
          >
            Remove API key
          </DestructiveButton>
        </FlexItem>
      </Row>
    </>
  )
}

export default RdiDeployErrorContent
