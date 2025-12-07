import styled from 'styled-components'
import type { HTMLAttributes } from 'react'
import { Theme } from 'uiSrc/components/base/theme/types'

export const DatabaseListOptionsContainer = styled.div`
  padding-left: 7px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`

export type ValidOptionIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

type OptionColor = { bg: string; fg?: string }
type ThemePalette = Record<ValidOptionIndex, OptionColor>

type OptionsIconProps = {
  theme: Theme
  $icon: ValidOptionIndex
}

const getIconStyle = ({ $icon, theme }: OptionsIconProps) => {
  // todo: move to theme
  const customFgDarkColor = theme.semantic.color.text.primary50
  // const customFgDarkColor = '#202020'
  const customFgLightColor = theme.semantic.color.text.primary700
  // const customFgLightColor = #1A3091
  const optionColors: { dark: ThemePalette; light: ThemePalette } = {
    dark: {
      0: { bg: '#293152' },
      1: { bg: '#323e6c' },
      2: { bg: '#465282' },
      3: { bg: '#606c98' },
      4: { bg: '#737fa8' },
      5: { bg: '#8f99bc', fg: customFgDarkColor },
      6: { bg: '#adb5d3', fg: customFgDarkColor },
      7: { bg: '#cdd4ea', fg: customFgDarkColor },
    },
    light: {
      0: { bg: '#587AB2' },
      1: { bg: '#6A8BC1' },
      2: { bg: '#97B4E3', fg: customFgLightColor },
      3: { bg: '#ADC5ED', fg: customFgLightColor },
      4: { bg: '#C6D8F7', fg: customFgLightColor },
      5: { bg: '#DEEAFF', fg: customFgLightColor },
      6: { bg: '#EAF1FF', fg: customFgLightColor },
      7: { bg: '#EFF4FF', fg: customFgLightColor },
    },
  }
  const themeColors =
    theme.name === 'dark' ? optionColors.dark : optionColors.light
  return `
    background-color: ${themeColors[$icon].bg};
    ${themeColors[$icon].fg ? `color: ${themeColors[$icon].fg};` : ''}
`
}

export const OptionsIcon = styled.div<
  HTMLAttributes<HTMLDivElement> & OptionsIconProps
>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ theme }) => theme.core.space.space300};
  height: ${({ theme }) => theme.core.space.space300};
  border-radius: 100%;
  cursor: pointer;
  line-height: ${({ theme }) => theme.core.space.space300};
  text-align: center;
  text-transform: uppercase;
  margin-left: -${({ theme }) => theme.core.space.space050};
  color: #fff;

  &:hover {
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(1px);
  }
  ${getIconStyle};
`
