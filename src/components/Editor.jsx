import React, { useEffect, useRef } from 'react';
import { javascript } from '@codemirror/lang-javascript';
import { material } from '@uiw/codemirror-theme-material';
import CodeMirror from '@uiw/react-codemirror';
import { closeBrackets } from '@codemirror/autocomplete';
import { closeBracketsKeymap } from '@codemirror/closebrackets';
import { ACTIONS } from '../Action';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function Editor({ socketRef, id, setLiveCode, editorRef }) {
  const location = useLocation();
  
  useEffect(() => {
    if (!editorRef.current) return;

    const extensions = [
      javascript({ jsx: true }),
      closeBrackets(),
      material
    ];

    editorRef.current = CodeMirror({
      value: '',
      extensions,
      theme: material,
      basicSetup: {
        lineNumbers: true,
        foldGutter: true,
        highlightActiveLine: true,
        bracketMatching: true,
        closeBrackets: true,
        autocompletion: true,
      },
      onChange: (value) => {
        setLiveCode(value);
        if (socketRef.current) {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            id,
            code: value
          });
        }
      }
    });

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!socketRef.current) return;

    const syncHandler = ({ code }) => {
      if (code !== null && editorRef.current) {
        editorRef.current.dispatch({
          changes: {
            from: 0,
            to: editorRef.current.state.doc.length,
            insert: code
          }
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
  }, [socketRef.current]);

  return (
    <div className="editor-container" ref={editorRef} />
  );
}

export default Editor;
