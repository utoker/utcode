import MonacoEditor, { OnChange } from '@monaco-editor/react';
import prettier from 'prettier';
import parser from 'prettier/parser-babel';
import './code-editor.css';

interface CodeEditorProps {
  value: string;
  onChange(value: string): void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange }) => {
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
          scrollBeyondLine: false,
          automaticLayout: true,
          tabsize: 2,
        }}
      />
    </div>
  );
};
export default CodeEditor;
