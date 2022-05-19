import MonacoEditor, { OnChange, OnMount } from '@monaco-editor/react';
import prettier from 'prettier';
import parser from 'prettier/parser-babel';
import './syntax.css';
import './code-editor.css';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import MonacoJSXHighlighter from 'monaco-jsx-highlighter';

interface CodeEditorProps {
  value: string;
  onChange(value: string): void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange }) => {
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    const monacoJSXHighlighter = new MonacoJSXHighlighter(
      monaco, // references Range and other APIs
      parse, // obtains an AST, internally passes to parse options: {...options, sourceType: "module",plugins: ["jsx"],errorRecovery: true}
      traverse, // helps collecting the JSX expressions within the AST
      editor // highlights the content of that editor via decorations
    );

    monacoJSXHighlighter.highlightOnDidChangeModelContent();
  };

  const handleEditorChange: OnChange = (code) => {
    onChange(code || '');
  };

  const onFormatClick = () => {
    const formattedCode = prettier
      .format(value, {
        parser: 'babel',
        plugins: [parser],
        useTabs: false,
        semi: true,
        singleQuote: true,
      })
      .replace(/\n$/, '');
    onChange(formattedCode);
  };

  return (
    <div className="editor-wrapper">
      <button
        className="button button-format is-primary is-small"
        onClick={onFormatClick}
      >
        Format
      </button>
      <MonacoEditor
        onMount={handleEditorDidMount}
        theme="vs-dark"
        height="100%"
        defaultLanguage="javascript"
        defaultValue="const a = 1"
        onChange={handleEditorChange}
        value={value}
        options={{
          wordWrap: 'on',
          minimap: { enabled: false },
          showUnused: false,
          folding: false,
          lineNumbersMinChars: 3,
          fontSize: 16,
          // scrollBeyondLine: false,
          automaticLayout: true,
          // tabsize: 2,
        }}
      />
    </div>
  );
};
export default CodeEditor;
