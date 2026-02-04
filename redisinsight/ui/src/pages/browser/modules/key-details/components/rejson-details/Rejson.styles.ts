import styled, { css } from 'styled-components'

export const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  padding: 16px;
  overflow-y: auto;
  overflow-x: auto;
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral000};
  color: ${({ theme }) => theme.semantic.color.text.neutral600};
  position: relative;

  input {
    font-family: 'Graphik', sans-serif;
  }

  .euiFieldText {
    font-size: 13px;
    max-width: initial;
    height: 26px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &.withoutBorder {
      &:not(:focus) {
        background-color: inherit;
        box-shadow: none;
      }
    }
  }

  .euiFormControlLayout {
    height: 24px;
  }
`

export const FullWidthContainer = styled.div`
  width: 100%;
  padding: 10px 0;
`

export const Placeholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 12px;
  width: 100%;
`

export const JsonData = styled.div`
  font-size: 14px;
  line-height: 25px;
  font-family: 'Inconsolata', monospace;
  letter-spacing: 0.15px;
  flex-grow: 1;

  input {
    width: 100%;
    min-width: 140px;
  }
`

export const MonacoEditorJsonData = styled.div`
  font-size: 14px;
  line-height: 25px;
  font-family: 'Inconsolata', monospace;
  letter-spacing: 0.15px;
  flex-grow: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
`

export const DefaultFont = styled.span`
  font-family: 'Graphik', sans-serif;
`

export const ErrorMessage = styled.div`
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral300};
  padding: 4px 8px 0 8px;
  width: 100%;
`

// Base styles for controls
const controlsBaseStyles = css`
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
  height: 24px;
  margin-bottom: 4px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 3px 3px rgba(0, 0, 0, 0.1);
`

export const Controls = styled.div`
  ${controlsBaseStyles}
  width: 80px;
  border-radius: 0 10px 10px 0;

  .euiButtonIcon {
    width: 50%;
    height: 100%;
  }
`

export const ControlsBottom = styled.div`
  ${controlsBaseStyles}
  height: 34px;
  top: 100%;
  right: 0;
  left: auto;
  border-radius: 0 0 10px 10px;
`

export const Row = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  &:before {
    content: '';
    display: block;
    position: absolute;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    margin: 0 -16px;
    z-index: 0;
  }

  &:nth-child(2n):before {
    background: ${({ theme }) => theme.semantic.color.background.neutral100};
  }

  &:hover:before {
    background: ${({ theme }) => theme.semantic.color.background.neutral200};
  }

  > div,
  span,
  button {
    z-index: 1;
  }
`

export const TopRow = styled(Row)`
  justify-content: space-between;
`

export const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`

export const KeyName = styled.span`
  color: ${({ theme }) => theme.semantic.color.text.primary500};
  width: max-content;
  word-break: break-all;
  max-width: 300px;
  box-sizing: content-box;
  flex-shrink: 0;
`

export const QuotedKeyName = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 1em;
`

export const DefaultFontExpandArray = styled.span`
  display: inline-block;
  cursor: pointer;
  padding-left: 8px;
`

export const DefaultFontOpenIndex = styled.span`
  display: inline-block;
  cursor: pointer;
  padding-left: 8px;
`

export const JsonValue = styled.span`
  font-size: 14px;
  line-height: 25px;
  font-family: 'Inconsolata', monospace;
  letter-spacing: 0.15px;
  padding: 0 8px;
  max-width: 1000px;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    outline: 1px solid #b5b6c0;
  }
`

export const KeyNameArray = styled.span`
  color: ${({ theme }) => theme.semantic.color.text.warning500};
`

export const JsonString = styled.span`
  color: ${({ theme }) => theme.semantic.color.text.success500};
`

export const JsonNumber = styled.span`
  color: ${({ theme }) => theme.semantic.color.text.primary500};
`

export const JsonBoolean = styled.span`
  color: ${({ theme }) => theme.semantic.color.text.danger500};
`

export const JsonNull = styled.span`
  color: ${({ theme }) => theme.semantic.color.text.neutral500};
`

export const JsonNonStringPrimitive = styled.span`
  color: ${({ theme }) => theme.semantic.color.text.primary500};
`

export const NewValue = styled.span`
  color: ${({ theme }) => theme.semantic.color.text.danger500};
`

export const StringStyle = styled.span`
  word-break: break-all;
`

export const Quoted = styled.span`
  &:before,
  &:after {
    content: '"';
  }
`

export const ActionButtons = styled.div`
  margin-left: 1em;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 24px;
`

export const DeleteBtn = styled.div`
  margin-left: 1em;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 24px;
`

export const Spinner = styled.div`
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const FullWidthTextArea = styled.textarea`
  height: 150px;
  width: 100%;
  max-width: none;
`

export const EditorWrapper = styled.div`
  height: calc(100% - 2px);
`

export const Editor = styled.div`
  height: calc(100% - 2px);
`

// Class names for compatibility with existing code
export const containerClassName = 'rejson-container'
export const fullWidthContainerClassName = 'rejson-full-width-container'
export const placeholderClassName = 'rejson-placeholder'
export const jsonDataClassName = 'rejson-json-data'
export const monacoEditorJsonDataClassName = 'rejson-monaco-editor-json-data'
export const defaultFontClassName = 'rejson-default-font'
export const errorMessageClassName = 'rejson-error-message'
export const controlsClassName = 'rejson-controls'
export const controlsBottomClassName = 'rejson-controls-bottom'
export const rowClassName = 'rejson-row'
export const topRowClassName = 'rejson-top-row'
export const rowContainerClassName = 'rejson-row-container'
export const keyNameClassName = 'rejson-key-name'
export const quotedKeyNameClassName = 'rejson-quoted-key-name'
export const defaultFontExpandArrayClassName =
  'rejson-default-font-expand-array'
export const defaultFontOpenIndexClassName = 'rejson-default-font-open-index'
export const jsonValueClassName = 'rejson-json-value'
export const keyNameArrayClassName = 'rejson-key-name-array'
export const jsonStringClassName = 'rejson-json-string'
export const jsonNumberClassName = 'rejson-json-number'
export const jsonBooleanClassName = 'rejson-json-boolean'
export const jsonNullClassName = 'rejson-json-null'
export const jsonNonStringPrimitiveClassName =
  'rejson-json-non-string-primitive'
export const newValueClassName = 'rejson-new-value'
export const stringStyleClassName = 'rejson-string-style'
export const quotedClassName = 'rejson-quoted'
export const actionButtonsClassName = 'rejson-action-buttons'
export const deleteBtnClassName = 'rejson-delete-btn'
export const spinnerClassName = 'rejson-spinner'
export const fullWidthTextAreaClassName = 'rejson-full-width-textarea'
export const editorWrapperClassName = 'rejson-editor-wrapper'
export const editorClassName = 'rejson-editor'

// Wrapper to inject all class styles
export const ClassStyles = styled.div`
  .${containerClassName} {
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
    padding: 16px;
    overflow-y: auto;
    overflow-x: auto;
    background-color: ${({ theme }) =>
      theme.semantic.color.background.neutral000};
    color: ${({ theme }) => theme.semantic.color.text.neutral600};
    position: relative;

    input {
      font-family: 'Graphik', sans-serif;
    }

    .euiFieldText {
      font-size: 13px;
      max-width: initial;
      height: 26px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &.withoutBorder {
        &:not(:focus) {
          background-color: inherit;
          box-shadow: none;
        }
      }
    }

    .euiFormControlLayout {
      height: 24px;
    }
  }

  .${fullWidthContainerClassName} {
    width: 100%;
    padding: 10px 0;
  }

  .${placeholderClassName} {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: 12px;
    width: 100%;
  }

  .${jsonDataClassName} {
    font-size: 14px;
    line-height: 25px;
    font-family: 'Inconsolata', monospace;
    letter-spacing: 0.15px;
    flex-grow: 1;

    input {
      width: 100%;
      min-width: 140px;
    }
  }

  .${monacoEditorJsonDataClassName} {
    font-size: 14px;
    line-height: 25px;
    font-family: 'Inconsolata', monospace;
    letter-spacing: 0.15px;
    flex-grow: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .${defaultFontClassName} {
    font-family: 'Graphik', sans-serif;
  }

  .${errorMessageClassName} {
    background-color: ${({ theme }) =>
      theme.semantic.color.background.neutral300};
    padding: 4px 8px 0 8px;
    width: 100%;
  }

  .${controlsClassName} {
    background-color: ${({ theme }) =>
      theme.semantic.color.background.neutral100};
    height: 24px;
    margin-bottom: 4px;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    box-shadow: 0 3px 3px rgba(0, 0, 0, 0.1);
    width: 80px;
    border-radius: 0 10px 10px 0;

    .euiButtonIcon {
      width: 50%;
      height: 100%;
    }
  }

  .${controlsBottomClassName} {
    background-color: ${({ theme }) =>
      theme.semantic.color.background.neutral100};
    height: 34px;
    margin-bottom: 4px;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    box-shadow: 0 3px 3px rgba(0, 0, 0, 0.1);
    top: 100%;
    right: 0;
    left: auto;
    border-radius: 0 0 10px 10px;
  }

  .${rowClassName} {
    position: relative;
    display: flex;
    align-items: center;

    &:before {
      content: '';
      display: block;
      position: absolute;
      height: 100%;
      top: 0;
      left: 0;
      right: 0;
      margin: 0 -16px;
      z-index: 0;
    }

    &:nth-child(2n):before {
      background: ${({ theme }) => theme.semantic.color.background.neutral100};
    }

    &:hover:before {
      background: ${({ theme }) => theme.semantic.color.background.neutral200};
    }

    > div,
    span,
    button {
      z-index: 1;
    }
  }

  .${topRowClassName} {
    justify-content: space-between;
  }

  .${rowContainerClassName} {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
  }

  .${keyNameClassName} {
    color: ${({ theme }) => theme.semantic.color.text.primary500};
    width: max-content;
    word-break: break-all;
    max-width: 300px;
    box-sizing: content-box;
    flex-shrink: 0;
  }

  .${quotedKeyNameClassName} {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-left: 1em;
  }

  .${defaultFontExpandArrayClassName}, .${defaultFontOpenIndexClassName} {
    display: inline-block;
    cursor: pointer;
    padding-left: 8px;
  }

  .${jsonValueClassName} {
    font-size: 14px;
    line-height: 25px;
    font-family: 'Inconsolata', monospace;
    letter-spacing: 0.15px;
    padding: 0 8px;
    max-width: 1000px;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
      outline: 1px solid #b5b6c0;
    }
  }

  .${keyNameArrayClassName} {
    color: ${({ theme }) => theme.semantic.color.text.warning500};
  }

  .${jsonStringClassName} {
    color: ${({ theme }) => theme.semantic.color.text.success500};
  }

  .${jsonNumberClassName} {
    color: ${({ theme }) => theme.semantic.color.text.primary500};
  }

  .${jsonBooleanClassName} {
    color: ${({ theme }) => theme.semantic.color.text.danger500};
  }

  .${jsonNullClassName} {
    color: ${({ theme }) => theme.semantic.color.text.neutral500};
  }

  .${jsonNonStringPrimitiveClassName} {
    color: ${({ theme }) => theme.semantic.color.text.primary500};
  }

  .${newValueClassName} {
    color: ${({ theme }) => theme.semantic.color.text.danger500};
  }

  .${stringStyleClassName} {
    word-break: break-all;
  }

  .${quotedClassName} {
    &:before,
    &:after {
      content: '"';
    }
  }

  .${actionButtonsClassName}, .${deleteBtnClassName} {
    margin-left: 1em;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 24px;
  }

  .${spinnerClassName} {
    width: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .${fullWidthTextAreaClassName} {
    height: 150px;
    width: 100%;
    max-width: none;
  }

  .${editorWrapperClassName}, .${editorClassName} {
    height: calc(100% - 2px);
  }
`
