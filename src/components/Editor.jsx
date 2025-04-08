import React, { useEffect, useRef } from 'react';
import { javascript } from '@codemirror/lang-javascript';
import { material } from '@uiw/codemirror-theme-material';
import CodeMirror from '@uiw/react-codemirror';
import { closeBrackets } from '@codemirror/autocomplete';
import { ACTIONS } from '../Action';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function Editor({ socketRef, id, setLiveCode, editorRef, access, connected }) {
  const location = useLocation();

  const handleCodeChange = (value) => {
    setLiveCode(value);
    if (socketRef.current) {
      socketRef.current.emit(ACTIONS.CODE_CHANGE, {
        roomId: id, // Updated to match backend
        code: value,
      });
    }
  };

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
        });
        setLiveCode(code);
      }
    };

    const accessHandler = ({ access: newAccess }) => {
      toast.success(`Editor is ${newAccess ? 'locked' : 'unlocked'}`);
      if (editorRef.current) {
        editorRef.current.view.dom.setAttribute('contenteditable', !newAccess);
      }
    };

    socketRef.current.on(ACTIONS.SYNC_CODE, syncHandler);
    socketRef.current.on('lock_access', accessHandler); // Match event name from server.js

    return () => {
      socketRef.current.off(ACTIONS.SYNC_CODE, syncHandler);
      socketRef.current.off('lock_access', accessHandler);
    };
  }, [socketRef, id, setLiveCode]);

  return (
    <div className="editor-container" style={{ height: '100%', width: '100%' }}>
      <CodeMirror
        ref={editorRef}
        value=""
        height="100%"
        theme={material}
        extensions={[javascript({ jsx: true }), closeBrackets()]}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          bracketMatching: true,
          autocompletion: true,
        }}
        onChange={handleCodeChange}
        editable={!access} // Reflect the access state
      />
    </div>
  );
}

export default Editor;
