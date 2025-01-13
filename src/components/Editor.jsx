import React, { useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { EditorView } from '@codemirror/view';
import { materialDark } from '@uiw/codemirror-theme-material';
import ACTIONS from '../Action';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function Editor({ socketRef, id, setLiveCode, editorRef }) {
  const location = useLocation();
  const [isReadOnly, setIsReadOnly] = React.useState(false);
  const [editorValue, setEditorValue] = React.useState('');

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.SYNC_CODE, ({ code }) => {
        if (code !== null) {
          setEditorValue(code);
          setLiveCode(code);
        }
      });

      socketRef.current.on('access_change', ({ access }) => {
        toast.success(`Editor is ${access ? 'lock' : 'unlock'}`);
        setIsReadOnly(access);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off(ACTIONS.SYNC_CODE);
        socketRef.current.off('access_change');
      }
    };
  }, [socketRef.current]);

  const handleChange = (value, viewUpdate) => {
    setEditorValue(value);
    setLiveCode(value);
    
    if (viewUpdate.docChanged) {
      socketRef.current.emit(ACTIONS.CODE_CHANGE, {
        id,
        code: value
      });
    }
  };

  return (
    <div style={{ height: '100%' }}>
      <CodeMirror
        ref={editorRef}
        value={editorValue}
        height="100%"
        theme={materialDark}
        extensions={[
          javascript({ jsx: true, json: true }),
          EditorView.lineWrapping
        ]}
        readOnly={isReadOnly}
        onChange={handleChange}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          autocompletion: true,
          closeBrackets: true,
          closeBracketsKeymap: true,
          highlightActiveLine: true,
          keymap: {
            'Ctrl-q': cm => {
              // Fold code implementation
              const line = cm.state.doc.lineAt(cm.state.selection.main.head);
              cm.dispatch({
                effects: EditorView.foldCode.of(line.from)
              });
            }
          }
        }}
      />
    </div>
  );
}

export default Editor;
