import { createGlobalStyle } from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'

/**
 * Generate CSS variables for Monaco editor based on the theme.
 *
 * Rebrand themes (light-2/dark-2) use the secondary scale for
 * backgrounds (secondary900/950) and borders (secondary700/800) instead
 * of the neutral palette. These neutral-based tokens will need
 * secondary-scale overrides once the rebrand themes are adopted.
 *
 * It is either this approach, or defining a separate theme color config for each theme.
 */
const monacoStyle = (theme: Theme) => {
  const { name, semantic, core } = theme
  const colors = semantic.color
  const fontSize = core.font.fontSize
  let bgColor = colors.background.neutral100
  let bgWidgetColor = colors.background.neutral200
  let borderWidgetColor = colors.border.neutral400
  let hoverBgWidgetColor = colors.background.neutral300
  let hoverBorderWidgetColor = colors.border.neutral500
  let titleWidgetColor = colors.text.neutral700
  let shortcutWidgetColor = colors.text.neutral700

  // Rebrand dark theme uses the secondary scale
  if (name === 'dark-2') {
    bgColor = colors.background.secondary950
    bgWidgetColor = colors.background.secondary900
    borderWidgetColor = colors.border.secondary700
    hoverBgWidgetColor = colors.background.secondary950
    hoverBorderWidgetColor = colors.border.secondary800
    titleWidgetColor = colors.text.secondary300
    shortcutWidgetColor = colors.text.secondary400
  }
  return `
    /* Colors */
    --monaco-docs-link-color: ${colors.text.secondary300};
    --monaco-widget-bg: ${bgWidgetColor};
    --monaco-widget-border: ${borderWidgetColor};
    --monaco-widget-hover-bg: ${hoverBgWidgetColor};
    --monaco-widget-hover-border: ${hoverBorderWidgetColor};
    --monaco-widget-title-color: ${titleWidgetColor};
    --monaco-widget-shortcut-color: ${shortcutWidgetColor};
    --monaco-color-submit: ${colors.icon.success500};
    --monaco-color-bg: ${bgColor};
    --monaco-color-params: ${colors.text.discovery200};
    
    /* Font sizes */
    --monaco-font-size-s: ${fontSize.s13};
    --monaco-font-size-m: ${fontSize.s16};
    --monaco-font-size-l: ${fontSize.s18};
    `
}

/**
 * Global styles for Monaco editor overrides.
 * Rendered inside CodeEditor so they are only injected when a Monaco
 * instance is mounted. styled-components deduplicates automatically
 * when multiple CodeEditors are on screen at the same time.
 */
export const MonacoGlobalStyles = createGlobalStyle<{ theme: Theme }>`
  :root {
    ${({ theme }) => monacoStyle(theme)}

    /* Sizes */
    --monaco-size-xs: 5px;
    --monaco-size-s: 10px;
    --monaco-size-m: 12px;
    --monaco-size-l: 14px;
    --monaco-size-xl: 16px;
    --monaco-widget-height: 30px;
    --monaco-widget-width: 220px;

    /* Opacity */
    --monaco-opacity-muted: 0.5;
  }

  /* Editor background */
  .monaco-editor,
  .monaco-editor .margin,
  .monaco-editor .minimap-decorations-layer,
  .monaco-editor-background {
    background-color: var(--monaco-color-bg) !important;
  }

  /* Markdown docs inside hover/suggestion widgets */
  .monaco-editor .markdown-docs {
    h1,
    h2,
    h3 {
      font-weight: bold;
      margin: var(--monaco-size-m) 0;
      font-size: var(--monaco-font-size-s);
    }

    h2 {
      margin: var(--monaco-size-l) 0;
      font-size: var(--monaco-font-size-m);
    }

    h1 {
      margin: var(--monaco-size-xl) 0;
      font-size: var(--monaco-font-size-l);
    }

    a {
      color: var(--monaco-docs-link-color) !important;
      text-decoration: underline !important;

      &:hover {
        text-decoration: none !important;
      }
    }
  }

  .monaco-editor .accessibilityHelpWidget {
    overflow: auto;
  }

  .monaco-editor .suggest-widget {
    max-width: 100% !important;
    overflow: hidden;
  }

  /* Params line decoration */
  .monaco-params-line {
    color: var(--monaco-color-params) !important;
  }

  /* Run command glyph margin icon */
  .monaco-glyph-run-command {
    color: var(--monaco-color-submit);
    margin-left: var(--monaco-size-s);
    opacity: var(--monaco-opacity-muted) !important;

    &::before {
      content: "";
      width: var(--monaco-size-xl);
      height: var(--monaco-size-xl);
      mask-image: url("uiSrc/assets/img/play_icon.svg");
      -webkit-mask-image: url("uiSrc/assets/img/play_icon.svg");
      background-color: var(--monaco-color-submit);
      background-size: contain;
      font-size: var(--monaco-size-xl);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
  }

  /* DSL syntax content widget */
  .monaco-widget {
    display: flex !important;
    align-items: center;
    justify-content: space-around;
    background: var(--monaco-widget-bg);
    border: 1px solid var(--monaco-widget-border);
    width: var(--monaco-widget-width);
    height: var(--monaco-widget-height);
    padding: var(--monaco-size-xs);
    font-size: var(--monaco-size-m);
    cursor: pointer;

    &:hover {
      background: var(--monaco-widget-hover-bg);
      border-color: var(--monaco-widget-hover-border);
    }
  }

  .monaco-widget__title {
    color: var(--monaco-widget-title-color);
  }

  .monaco-widget__shortcut {
    color: var(--monaco-widget-shortcut-color);
  }

  .monaco-widget * {
    background: transparent;
  }

  /* Editor bounder overlay */
  .editorBounder {
    position: absolute;
    top: var(--monaco-size-m);
    bottom: 0;
    left: 0;
    right: 0;
  }
`
