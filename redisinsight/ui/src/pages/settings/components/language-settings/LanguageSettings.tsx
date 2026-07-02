import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import {
  updateUserConfigSettingsAction,
  userSettingsSelector,
} from 'uiSrc/slices/user/user-settings'
import i18n, {
  DEFAULT_LANGUAGE,
  LANGUAGE_NAMES,
  SUPPORTED_LANGUAGES,
} from 'uiSrc/i18n'
import {
  defaultValueRender,
  RiSelect,
  RiSelectOption,
} from 'uiSrc/components/base/forms/select/RiSelect'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { Title } from 'uiSrc/components/base/text'

const options: RiSelectOption[] = SUPPORTED_LANGUAGES.map((language) => ({
  value: language,
  inputDisplay: LANGUAGE_NAMES[language],
}))

const LanguageSettings = () => {
  const dispatch = useAppDispatch()
  const { config } = useAppSelector(userSettingsSelector)
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    config?.language ?? i18n.language ?? DEFAULT_LANGUAGE,
  )

  useEffect(() => {
    if (config?.language) {
      setSelectedLanguage(config.language)
    }
  }, [config])

  const onChange = (value: string) => {
    if (value === selectedLanguage) {
      return
    }
    setSelectedLanguage(value)
    i18n.changeLanguage(value)
    dispatch(updateUserConfigSettingsAction({ language: value }))
  }

  return (
    <form>
      <Title size="XS">Language</Title>
      <Spacer size="m" />
      <FormField label="Specifies the display language:">
        <Spacer size="m" />
        <RiSelect
          valueRender={defaultValueRender}
          options={options}
          value={selectedLanguage}
          onChange={onChange}
          data-testid="select-language"
        />
      </FormField>
      <Spacer size="xl" />
    </form>
  )
}

export default LanguageSettings
