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
  onDidFocusEditorWidget: jest.fn(),
  onDidBlurEditorWidget: jest.fn(),
  onDidChangeModelContent: jest.fn(),
  onDidLayoutChange: jest.fn(),
  getLayoutInfo: jest.fn().mockReturnValue({ contentLeft: 0 }),
  onDidAttemptReadOnlyEdit: jest.fn(),
  executeEdits: jest.fn(),
  updateOptions: jest.fn(),
  setSelection: jest.fn(),
  setPosition: jest.fn(),
  createDecorationsCollection: jest
    .fn()
    .mockReturnValue({ set: jest.fn(), clear: jest.fn() }),
  getValue: jest.fn().mockReturnValue(''),
  getModel: jest.fn().mockReturnValue({
    getOffsetAt: jest.fn().mockReturnValue(0),
    getWordUntilPosition: jest.fn().mockReturnValue(''),
  }),
  getPosition: jest.fn().mockReturnValue({}),
  trigger: jest.fn(),
};

const editorApi = {
  ...editor,
  registerCommand: jest.fn(),
  colorize: jest.fn().mockImplementation((data) => Promise.resolve(data)),
  defineTheme: jest.fn(),
  setTheme: jest.fn(),
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
  editor: editorApi,
};

export default function MonacoEditor(props) {
  const {
    editorDidMount,
    editorWillMount,
    onChange,
    value,
    defaultValue,
    className,
    style,
    disabled,
    readOnly,
    placeholder,
    id,
    name,
    autoFocus,
    ...restProps
  } = props;

  delete restProps.language;
  delete restProps.options;
  delete restProps.theme;
  delete restProps.width;
  delete restProps.height;
  delete restProps.overrideServices;
  delete restProps['data-testid'];

  useEffect(() => {
    editorDidMount && editorDidMount(editor, monacoEditor);
    editorWillMount && editorWillMount(monacoEditor);
  }, [editorDidMount, editorWillMount]);

  return (
    <textarea
      {...restProps}
      value={value}
      defaultValue={defaultValue}
      className={className}
      style={style}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={placeholder}
      id={id}
      name={name}
      autoFocus={autoFocus}
      onChange={(e) => onChange && onChange(e.target.value)}
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
  editor: editorApi,
  Range: monacoEditor.Range,
};
