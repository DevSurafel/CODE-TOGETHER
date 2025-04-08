import React, { useEffect, useRef } from 'react';
import { javascript } from '@codemirror/lang-javascript';
import { material } from '@uiw/codemirror-theme-material';
import CodeMirror from '@uiw/react-codemirror';
import { closeBrackets } from '@codemirror/autocomplete';
import { foldGutter, foldKeymap } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { ACTIONS } from '../Action';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function Editor({ socketRef, id, setLiveCode, editorRef }) {
  const location = useLocation();

  // Handle code changes and emit to socket
  const handleCodeChange = (value, viewUpdate) => {
    setLiveCode(value);
    // Only emit if change originated from user input
    if (viewUpdate?.origin !== 'setValue' && socketRef.current) {
      socketRef.current.emit(ACTIONS.CODE_CHANGE, {
        id,
        code: value,
      });
    }
  };

  // Sync code and access changes via socket
  useEffect(() => {
    if (!socketRef.current || !editorRef.current) return;

    const syncHandler = ({ code }) => {
      if (code !== null) {
        editorRef.current.view.dispatch({
          changes: {
            from: 0,
            to: editorRef.current.view.state.doc.length,
            insert: code,
          },
          // Mark this as a programmatic change to avoid feedback loop
          annotations: [{
            type: 'origin',
            value: 'setValue'
          }]
        });
        setLiveCode(code);
      }
    };

    const accessHandler = ({ access }) => {
      toast.success(`Editor is ${access ? 'locked' : 'unlocked'}`);
      if (editorRef.current) {
        editorRef.current.setEditable(!access);
      }
    };

    socketRef.current.on(ACTIONS.SYNC_CODE, syncHandler);
    socketRef.current.on('access_change', accessHandler);

    return () => {
      socketRef.current.off(ACTIONS.SYNC_CODE, syncHandler);
      socketRef.current.off('access_change', accessHandler);
    };
  }, [socketRef, id, setLiveCode]);

  return (
    <div className="editor-container">
      <CodeMirror
        ref={editorRef}
        value=""
        height="100%"
        theme={material}
        extensions={[
          javascript({ jsx: true }),
          closeBrackets(),
          foldGutter(),
          EditorView.lineWrapping
        ]}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          bracketMatching: true,
          autocompletion: true,
          closeBrackets: true,
          closeTags: true,
          foldKeymap
        }}
        onChange={handleCodeChange}
        editable={true}
      />
    </div>
  );
}

export default Editor;
