import React, { useEffect } from 'react';

function Terminal({ output, terminal, setEditorOpen, setInput, input, runCode, isWaitingForInput }) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent default behavior (e.g., new line in textarea)
      runCode(); // Trigger the runCode function
    }
  };

  return (
    <div>
      <button className="terminalCross" onClick={() => setEditorOpen(false)}>
        x
      </button>
      <h3>Input</h3>
      <textarea
        className="terminalOutput"
        cols="30"
        rows="10"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={isWaitingForInput ? handleKeyPress : null} // Listen for Enter key press only when waiting for input
      ></textarea>
      <hr />
      <h3>Output</h3>
      <textarea value={output} readOnly className="terminalOutput"></textarea>
    </div>
  );
}

export default Terminal;