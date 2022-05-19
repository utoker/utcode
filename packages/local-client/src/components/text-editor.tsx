import './text-editor.css';
import MDEditor from '@uiw/react-md-editor';
import { useEffect, useRef, useState } from 'react';
import { Cell } from '../state';
import { useActions } from '../hooks/use-actions';

interface TextEditorProps {
  cell: Cell;
}

const TextEditor: React.FC<TextEditorProps> = ({ cell }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [editing, setEditing] = useState(false);
  const { updateCell } = useActions();

  useEffect(() => {
    const listener = (ev: MouseEvent) => {
      if (ref.current && ev.target && ref.current.contains(ev.target as Node)) {
        return;
      }
      setEditing(false);
    };
    document.addEventListener('click', listener, { capture: true });
    return () => {
      document.removeEventListener('click', listener, { capture: true });
    };
  }, []);

  if (editing) {
    return (
      <div ref={ref} className="text-editor card">
        <div className="card-content">
          <MDEditor
            value={cell.content}
            onChange={(v) => updateCell(cell.id, v || '')}
          />
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => setEditing(true)} className="text-editor card">
      <MDEditor.Markdown source={cell.content || 'Click to edit'} />
    </div>
  );
};
export default TextEditor;
