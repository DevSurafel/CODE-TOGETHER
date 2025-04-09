import React, { useEffect, useRef } from 'react';
import { javascript } from '@codemirror/lang-javascript';
import { material } from '@uiw/codemirror-theme-material';
import CodeMirror from '@uiw/react-codemirror';
import { closeBrackets } from '@codemirror/autocomplete';
import { foldGutter, foldKeymap } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { ACTIONS } from '../Action';
import { toast } from 'react-hot-toast';

function Editor({ socketRef, id, setLiveCode, access, editorRef }) {
  const internalEditorRef = useRef(null);

  // Properly assign the ref
  useEffect(() => {
    if (internalEditorRef.current && editorRef) {
      editorRef.current = internalEditorRef.current;
    }
  }, [editorRef]);

  // Handle code changes and emit to socket
  const handleCodeChange = (value, viewUpdate) => {
    setLiveCode(value);
    // Only emit if change originated from user input
    if (viewUpdate?.transactions?.[0]?.annotation?.type !== 'setValue' && socketRef.current) {
      socketRef.current.emit(ACTIONS.CODE_CHANGE, {
        id,
        code: value,
      });
    }
  };

  // Sync code and access changes via socket
  useEffect(() => {
    if (!socketRef.current) return;

    const syncHandler = ({ code }) => {
      if (code !== null && internalEditorRef.current) {
        const view = internalEditorRef.current.view;
        view.dispatch({
          changes: {
            from: 0,
            to: view.state.doc.length,
            insert: code,
          },
          annotations: [{
            type: 'setValue'
          }]
        });
        setLiveCode(code);
      }
    };

    const accessHandler = ({ access }) => {
      toast.success(`Editor is ${access ? 'locked' : 'unlocked'}`);
      if (internalEditorRef.current) {
        internalEditorRef.current.view.dispatch({
          effects: EditorView.editable.of(!access)
        });
      }
    };

    socketRef.current.on(ACTIONS.SYNC_CODE, syncHandler);
    socketRef.current.on('lock_access', accessHandler); // Changed from 'access_change' to match backend

    // Request initial sync when connecting
    socketRef.current.emit(ACTIONS.SYNC_CODE, { id });

    return () => {
      socketRef.current.off(ACTIONS.SYNC_CODE, syncHandler);
      socketRef.current.off('lock_access', accessHandler);
    };
  }, [socketRef, id, setLiveCode]);

  return (
    <div className="editor-container">
      <CodeMirror
        ref={internalEditorRef}
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
        }}
        onChange={handleCodeChange}
        editable={!access}
      />
    </div>
  );
}

export default Editor;
