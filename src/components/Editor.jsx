
import React, { useEffect, useRef } from 'react';
import { javascript } from '@codemirror/lang-javascript';
import { material } from '@uiw/codemirror-theme-material';
import CodeMirror from '@uiw/react-codemirror';
import { closeBrackets } from '@codemirror/autocomplete';
import { ACTIONS } from '../Action';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function Editor({ socketRef, id, setLiveCode, editorRef }) {
  const location = useLocation();

  // Handle code changes and emit to socket
  const handleCodeChange = (value) => {
    setLiveCode(value);
    if (socketRef.current) {
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
        });
        setLiveCode(code);
      }
    };

    const accessHandler = ({ access }) => {
      toast.success(`Editor is ${access ? 'locked' : 'unlocked'}`);
      if (editorRef.current) {
        editorRef.current.view.dom.setAttribute('contenteditable', !access);
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
        extensions={[javascript({ jsx: true }), closeBrackets()]}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          bracketMatching: true,
          autocompletion: true,
        }}
        onChange={handleCodeChange}
        editable={true}
      />
    </div>
  );
}

export default Editor;

