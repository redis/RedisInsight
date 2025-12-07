import { monaco as monacoEditor } from 'react-monaco-editor'

export enum MonacoAction {
  Submit = 'submit',
  ChangeGroupMode = 'change-group-mode',
}

export const getMonacoAction = (
  actionId: MonacoAction,
  action: (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    ...args: any[]
  ) => void | Promise<void>,
  monaco: typeof monacoEditor,
): monacoEditor.editor.IActionDescriptor => {
  if (actionId === MonacoAction.Submit) {
    return {
      id: 'submit',
      label: 'Run Commands',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: action,
    }
  }

  return { id: '', label: '', run: () => {} }
}

export const actionTriggerParameterHints = (
  editor: monacoEditor.editor.IStandaloneCodeEditor,
) => editor.trigger('', 'editor.action.triggerParameterHints', '')
