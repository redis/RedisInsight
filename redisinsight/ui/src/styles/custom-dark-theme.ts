import {
  ActionIconButtonTheme,
  ButtonGroupTheme,
  ButtonTheme,
  InputTheme, SelectTheme,
  TextButtonTheme,
  themeDark,
} from '@redis-ui/styles'
import { merge } from 'lodash'
import { DeepPartial } from '@reduxjs/toolkit'
import { CheckboxTheme } from '@redis-ui/styles/dist/themes/types/theme/components'

const dusk000 = '#ffffff'

const buttonGroup: DeepPartial<ButtonGroupTheme> = {
  button: {
    toggleStates: {
      on: {
        normal: {
          bgColor: themeDark.color.azure600,
          textColor: dusk000,
        },
      },
    },
  },
}

const button: DeepPartial<ButtonTheme> = {
  variants: {
    primary: {
      normal: {
        bgColor: themeDark.color.dark50,
        textColor: themeDark.color.dark800,
      },
      hover: {
        bgColor: themeDark.color.dark100,
        textColor: themeDark.color.dark800,
      },
      active: {
        bgColor: themeDark.color.dark200,
        textColor: themeDark.color.dark800,
      },
    },
    'secondary-invert': {
      normal: {
        borderColor: '',
        bgColor: themeDark.color.azure800,
        textColor: themeDark.color.azure400,
      },
      hover: {
        borderColor: '',
        bgColor: themeDark.color.azure700,
        textColor: themeDark.color.azure400,
      },
      active: {
        bgColor: themeDark.color.azure900,
        textColor: themeDark.color.azure500,
      },
    },
    'secondary-fill': {
      normal: {
        bgColor: themeDark.color.azure600,
        textColor: themeDark.color.azure100,
      },
      hover: {
        bgColor: themeDark.color.azure500,
        textColor: themeDark.color.azure100,
      },
      active: {
        bgColor: themeDark.color.azure700,
        textColor: themeDark.color.azure100,
      },
    },
    'secondary-ghost': {
      normal: {
        borderColor: themeDark.color.dark50,
        textColor: themeDark.color.dark50,
      },
      hover: {
        borderColor: themeDark.color.dark200,
        textColor: themeDark.color.dark200,
      },
      active: {
        borderColor: themeDark.color.dark300,
        textColor: themeDark.color.dark300,
      },
    }
  },
}

const textButton: DeepPartial<TextButtonTheme> = {
  variants: {
    'primary-inline': {
      states: {
        normal: {
          textColor: themeDark.color.azure500,
        },
        hover: {
          textColor: themeDark.color.azure600,
        },
        active: {
          textColor: themeDark.color.azure700,
        },
      },
    },
  },
}

const actionIconButton: DeepPartial<ActionIconButtonTheme> = {
  variants: {
    secondary: {
      normal: {
        bgColor: themeDark.color.azure600,
        textColor: dusk000,
      },
      hover: {
        bgColor: themeDark.color.azure500,
        textColor: dusk000,
      },
      active: {
        bgColor: themeDark.color.azure700,
        textColor: dusk000,
      },
    },
  },
}

const checkbox: DeepPartial<CheckboxTheme> = {
  variants: {
    primary: {
      on: {
        normal: {
          bgColor: themeDark.color.azure600,
          iconColor: dusk000,
          textColor: themeDark.color.dark50,
        },
      },
      off: {
        normal: {
          bgColor: themeDark.color.dark800,
          borderColor: themeDark.color.dark500,
          textColor: themeDark.color.dark50,
        },
      },
    },
  },
}

const input: DeepPartial<InputTheme> = {
  states: {
    focused: {
      borderColor: themeDark.color.azure600,
    }
  }
}

const select: DeepPartial<SelectTheme> = {
  states: {
    focused: {
      borderColor: themeDark.color.azure600,
    },
    opened: {
      borderColor: themeDark.color.azure600,
    }
  }
}

const themeOverrides: DeepPartial<typeof themeDark> = {
  components: {
    buttonGroup,
    button,
    textButton,
    actionIconButton,
    checkbox,
    input,
    select,
  },
}

// Create modified dark theme with legacy colors
export const customDarkTheme = merge({}, themeDark, themeOverrides)
