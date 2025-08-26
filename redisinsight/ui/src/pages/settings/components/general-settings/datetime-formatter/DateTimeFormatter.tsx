import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { formatTimestamp } from 'uiSrc/utils'
import { DATETIME_FORMATTER_DEFAULT, TimezoneOption } from 'uiSrc/constants'
import { userSettingsConfigSelector } from 'uiSrc/slices/user/user-settings'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { HorizontalSpacer, Spacer } from 'uiSrc/components/base/layout'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import TimezoneForm from './components/timezone-form/TimezoneForm'
import DatetimeForm from './components/datetime-form/DatetimeForm'
import styles from './styles.module.scss'

const DateTimeFormatter = () => {
  const [preview, setPreview] = useState('')
  const config = useSelector(userSettingsConfigSelector)

  useEffect(() => {
    setPreview(
      formatTimestamp(
        new Date(),
        config?.dateFormat || DATETIME_FORMATTER_DEFAULT,
        config?.timezone || TimezoneOption.Local,
      ),
    )
  }, [config?.dateFormat, config?.timezone])

  return (
    <>
      <Title size="M">Date and Time Format</Title>
      <Spacer size="m" />
      <Text color="primary" className={styles.dateTimeSubtitle}>
        Specifies the date and time format to be used in Redis Insight:
      </Text>
      <Spacer size="m" />
      <DatetimeForm onFormatChange={(newPreview) => setPreview(newPreview)} />
      <Spacer size="m" />
      <Text color="primary" className={styles.dateTimeSubtitle}>
        Specifies the time zone to be used in Redis Insight:
      </Text>
      <Spacer size="s" />
      <div>
        <Row align="center" gap="m" responsive>
          <FlexItem grow={1}>
            <TimezoneForm />
          </FlexItem>
          <Row align="center">
            <Text color="primary" size="m">
              Preview:
            </Text>
            <HorizontalSpacer size="s" />
            <Text data-testid="data-preview" size="m">
              {preview}
            </Text>
          </Row>
        </Row>
      </div>
      <Spacer />
    </>
  )
}

export default DateTimeFormatter
