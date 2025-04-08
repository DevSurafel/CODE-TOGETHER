import React, { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from '@codemirror/basic-setup';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { material } from '@uiw/codemirror-theme-material';
import { closeBrackets } from '@codemirror/autocomplete';
import { ACTIONS } from '../Action';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function Editor({ socketRef, id, setLiveCode, editorRef }) {
  const location = useLocation();
  
  useEffect(() => {
    async function init() {
      const textArea = document.getElementById('realtime');
      
      // Create initial state for the editor
      const startState = EditorState.create({
        doc: textArea.value,
        extensions: [
          basicSetup,
          javascript({ jsx: true }),
          closeBrackets(),
          material,
          EditorView.updateListener.of(update => {
            if (update.docChanged) {
              const code = update.state.doc.toString();
              setLiveCode(code);
              if (socketRef.current) {
                socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                  id,
                  code
                });
              }
            }
          })
        ]
      });

      // Create and store the editor view
      editorRef.current = new EditorView({
        state: startState,
        parent: textArea.parentNode,
        replace: textArea
      });
    }
    
    if (document.getElementById('realtime')) {
      init();
    }
    
    // Cleanup function
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      // Handle code sync
      socketRef.current.on(ACTIONS.SYNC_CODE, ({ code }) => {
        if (code !== null && editorRef.current) {
          const transaction = editorRef.current.state.update({
            changes: {
              from: 0,
              to: editorRef.current.state.doc.length,
              insert: code
            }
          });
          editorRef.current.dispatch(transaction);
          setLiveCode(code);
        }
      });
      
      // Handle access change
      socketRef.current.on('access_change', ({ access }) => {
        toast.success(`Editor is ${access ? 'lock' : 'unlock'}`);
        if (editorRef.current) {
          // In CM6, we control editability through the DOM
          editorRef.current.dom.contentEditable = !access;
          editorRef.current.dom.classList.toggle('readonly', access);
        }
      });
      
      // Cleanup listeners when component unmounts
      return () => {
        socketRef.current.off(ACTIONS.SYNC_CODE);
        socketRef.current.off('access_change');
      };
    }
  }, [socketRef.current]);

  return (
    <div className="editor-container">
      <textarea id="realtime" defaultValue="" style={{ display: 'none' }}></textarea>
    </div>
  );
}

export default Editor;
