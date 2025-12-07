import { monaco as monacoEditor } from 'react-monaco-editor'

export interface ILightWeightDecoration {
  id: string
  range: monacoEditor.IRange
}

interface IModelDeltaDecoration
  extends monacoEditor.editor.IModelDeltaDecoration {}

export const toModelDeltaDecoration = (
  dec: ILightWeightDecoration,
): IModelDeltaDecoration => ({
  range: dec.range,
  options: {
    className: dec.id,
    isWholeLine: false,
    glyphMarginClassName: 'monaco-glyph-run-command',
    // glyphMarginHoverMessage: { value: 'Run command' }
  },
})

export const decoration = (
  monaco: typeof monacoEditor,
  id: string,
  startLineNumber: number,
  startColumn: number,
  endLineNumber: number,
  endColum: number,
): ILightWeightDecoration => ({
  id,
  range: new monaco.Range(
    startLineNumber,
    startColumn,
    endLineNumber,
    endColum,
  ),
})
