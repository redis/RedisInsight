import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiSpacer } from 'uiBase/layout/spacer'
import { RiTitle, RiText } from 'uiBase/text'
import { formatTimestamp } from 'uiSrc/utils'
import { DATETIME_FORMATTER_DEFAULT, TimezoneOption } from 'uiSrc/constants'
import { userSettingsConfigSelector } from 'uiSrc/slices/user/user-settings'
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
      <RiTitle size="M">Date and Time Format</RiTitle>
      <RiSpacer size="m" />
      <RiText color="subdued" className={styles.dateTimeSubtitle}>
        Specifies the date and time format to be used in Redis Insight:
      </RiText>
      <RiSpacer size="m" />
      <DatetimeForm onFormatChange={(newPreview) => setPreview(newPreview)} />
      <RiSpacer size="m" />
      <RiText className={styles.dateTimeSubtitle} color="subdued">
        Specifies the time zone to be used in Redis Insight:
      </RiText>
      <RiSpacer size="s" />
      <div>
        <RiRow align="center" gap="m" responsive>
          <RiFlexItem grow={1}>
            <TimezoneForm />
          </RiFlexItem>
          <RiFlexItem grow={2}>
            <div className={styles.previewContainer}>
              <RiText className={styles.dateTimeSubtitle} color="subdued">
                Preview:
              </RiText>
              <RiText className={styles.preview} data-testid="data-preview">
                {preview}
              </RiText>
            </div>
          </RiFlexItem>
        </RiRow>
      </div>
      <RiSpacer />
    </>
  )
}

export default DateTimeFormatter
