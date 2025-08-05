import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { formatTimestamp } from 'uiSrc/utils'
import { DATETIME_FORMATTER_DEFAULT, TimezoneOption } from 'uiSrc/constants'
import { userSettingsConfigSelector } from 'uiSrc/slices/user/user-settings'
import { RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
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
      <RiSpacer size="m" />
      <Text color="subdued" className={styles.dateTimeSubtitle}>
        Specifies the date and time format to be used in Redis Insight:
      </Text>
      <RiSpacer size="m" />
      <DatetimeForm onFormatChange={(newPreview) => setPreview(newPreview)} />
      <RiSpacer size="m" />
      <Text className={styles.dateTimeSubtitle} color="subdued">
        Specifies the time zone to be used in Redis Insight:
      </Text>
      <RiSpacer size="s" />
      <div>
        <RiRow align="center" gap="m" responsive>
          <RiFlexItem grow={1}>
            <TimezoneForm />
          </RiFlexItem>
          <RiFlexItem grow={2}>
            <div className={styles.previewContainer}>
              <Text className={styles.dateTimeSubtitle} color="subdued">
                Preview:
              </Text>
              <Text className={styles.preview} data-testid="data-preview">
                {preview}
              </Text>
            </div>
          </RiFlexItem>
        </RiRow>
      </div>
      <RiSpacer />
    </>
  )
}

export default DateTimeFormatter
