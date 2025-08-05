import React, { useContext, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import {
  updateUserConfigSettingsAction,
  userSettingsSelector,
} from 'uiSrc/slices/user/user-settings'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { DEFAULT_THEME, THEMES } from 'uiSrc/constants'
import {
  defaultValueRender,
  RiSelect,
  RiFormField,
} from 'uiSrc/components/base/forms'
import { RiTitle } from 'uiSrc/components/base/text'

const ThemeSettings = () => {
  const dispatch = useDispatch()
  const [selectedTheme, setSelectedTheme] = useState<string>(DEFAULT_THEME)
  const options = THEMES
  const themeContext = useContext(ThemeContext)
  const { theme, changeTheme } = themeContext
  const { config } = useSelector(userSettingsSelector)
  const previousThemeRef = useRef<string>(theme)

  useEffect(() => {
    if (config && config.theme) {
      const configTheme = config.theme
      setSelectedTheme(configTheme)
      previousThemeRef.current = configTheme
    }
  }, [config])

  const onChange = (value: string) => {
    const previousValue = previousThemeRef.current
    if (previousValue === value) {
      return
    }
    changeTheme(value)
    dispatch(updateUserConfigSettingsAction({ theme: value }))
    sendEventTelemetry({
      event: TelemetryEvent.SETTINGS_COLOR_THEME_CHANGED,
      eventData: {
        previousColorTheme: previousValue,
        currentColorTheme: value,
      },
    })
  }

  return (
    <form>
      <RiTitle size="XS">Color Theme</RiTitle>
      <RiSpacer size="m" />
      <RiFormField label="Specifies the color theme to be used in Redis Insight:">
        <RiSelect
          valueRender={defaultValueRender}
          options={options}
          value={selectedTheme}
          onChange={onChange}
          style={{ marginTop: '12px' }}
          data-test-subj="select-theme"
          data-testid="select-theme"
        />
      </RiFormField>
      <RiSpacer size="xl" />
    </form>
  )
}

export default ThemeSettings
