import React, { useEffect } from 'react';

const editor = {
  addCommand: jest.fn(),
  getContribution: jest.fn(),
  onKeyDown: jest.fn(),
  onMouseDown: jest.fn(),
  addAction: jest.fn(),
  getAction: jest.fn(),
  deltaDecorations: jest.fn(),
  createContextKey: jest.fn(),
  focus: jest.fn(),
  onDidChangeCursorPosition: jest.fn(),
  onDidAttemptReadOnlyEdit: jest.fn(),
  executeEdits: jest.fn(),
  updateOptions: jest.fn(),
  setSelection: jest.fn(),
  setPosition: jest.fn(),
  createDecorationsCollection: jest.fn(),
  getValue: jest.fn().mockReturnValue(''),
  getModel: jest.fn().mockReturnValue({
    getOffsetAt: jest.fn().mockReturnValue(0),
    getWordUntilPosition: jest.fn().mockReturnValue(''),
  }),
  getPosition: jest.fn().mockReturnValue({}),
  trigger: jest.fn(),
};

const monacoEditor = {
  Range: jest
    .fn()
    .mockImplementation(
      (startLineNumber, startColumn, endLineNumber, endColumn) => ({
        startLineNumber,
        startColumn,
        endLineNumber,
        endColumn,
      }),
    ),
  languages: {
    getLanguages: jest.fn(),
    register: jest.fn(),
    registerCompletionItemProvider: jest.fn().mockReturnValue({
      dispose: jest.fn(),
    }),
    registerSignatureHelpProvider: jest.fn().mockReturnValue({
      dispose: jest.fn(),
    }),
    setLanguageConfiguration: jest.fn(),
    setMonarchTokensProvider: jest.fn(),
    json: {
      jsonDefaults: {
        setDiagnosticsOptions: jest.fn(),
      },
    },
  },
  KeyMod: {},
  KeyCode: {},
};

export default function MonacoEditor(props) {
  useEffect(() => {
    props.editorDidMount && props.editorDidMount(editor, monacoEditor);
    props.editorWillMount && props.editorWillMount(monacoEditor);
  }, []);
  return (
    <textarea
      {...props}
      onChange={(e) => props.onChange && props.onChange(e.target.value)}
      data-testid={props['data-testid'] ? props['data-testid'] : 'monaco'}
    />
  );
}

export const languages = {
  CompletionItemKind: {
    Function: 1,
  },
  CompletionItemInsertTextRule: {
    InsertAsSnippet: 4,
  },
  ...monacoEditor.languages,
};

export const monaco = {
  languages,
  Selection: jest.fn().mockImplementation(() => ({})),
  editor: {
    ...editor,
    colorize: jest.fn().mockImplementation((data) => Promise.resolve(data)),
    defineTheme: jest.fn(),
    setTheme: jest.fn(),
  },
  Range: monacoEditor.Range,
};
