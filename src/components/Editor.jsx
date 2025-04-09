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

  useEffect(() => {
    console.log('Editor component mounted');
    if (internalEditorRef.current && editorRef) {
      editorRef.current = internalEditorRef.current;
      console.log('Editor ref assigned');
    }
  }, [editorRef]);

  const handleCodeChange = (value, viewUpdate) => {
    console.log('Code changed:', value);
    setLiveCode(value);
    if (viewUpdate?.transactions?.[0]?.annotation?.type !== 'setValue' && socketRef.current) {
      socketRef.current.emit(ACTIONS.CODE_CHANGE, {
        id,
        code: value,
      });
    }
  };

  useEffect(() => {
    if (!socketRef.current) return;

    const syncHandler = ({ code }) => {
      console.log('SYNC_CODE received:', code);
      if (code !== null && internalEditorRef.current) {
        const view = internalEditorRef.current.view;
        view.dispatch({
          changes: {
            from: 0,
            to: view.state.doc.length,
            insert: code,
          },
          annotations: [{ type: 'setValue' }]
        });
        setLiveCode(code);
      }
    };

    const accessHandler = ({ access }) => {
      console.log('lock_access received:', access);
      toast.success(`Editor is ${access ? 'locked' : 'unlocked'}`);
      if (internalEditorRef.current) {
        internalEditorRef.current.view.dispatch({
          effects: EditorView.editable.of(!access)
        });
      }
    };

    socketRef.current.on(ACTIONS.SYNC_CODE, syncHandler);
    socketRef.current.on('lock_access', accessHandler);
    socketRef.current.emit(ACTIONS.SYNC_CODE, { id });

    return () => {
      socketRef.current.off(ACTIONS.SYNC_CODE, syncHandler);
      socketRef.current.off('lock_access', accessHandler);
    };
  }, [socketRef, id, setLiveCode]);

  return (
    <div className="editor-container" style={{ height: '100%', width: '100%' }}>
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
