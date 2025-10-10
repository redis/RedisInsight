import { DeepPartial } from '@reduxjs/toolkit'
import { ButtonGroupTheme, themeDark } from '@redis-ui/styles'
import { color } from 'uiSrc/styles/custom/dark_theme/color'

export const buttonGroup: DeepPartial<ButtonGroupTheme> = {
  button: {
    toggleStates: {
      on: {
        normal: {
          bgColor: themeDark.color.azure600,
          textColor: color.dusk000,
        },
      },
    },
  },
}
