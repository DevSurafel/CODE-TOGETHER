import React, { useEffect, useRef, useState } from 'react';
import ACTIONS from '../Action';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../Socket';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import DoubtSection from '../components/DoubtSection';
import bglogo from '../images/bglogo.png';
import { AiOutlineMenu } from 'react-icons/ai';
import axios from 'axios';
import Terminal from '../components/Terminal';

function EditorPage() {
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isChatShown, setChatShown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(true);
  const [doubt, setDoubt] = useState('');
  const [allDoubts, setAllDoubts] = useState({});
  const [liveCode, setLiveCode] = useState('');
  const [clients, setClients] = useState([]);
  const [access, setAccess] = useState(false);
  const [terminal, setTerminal] = useState(false);
  const [output, setOutput] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [input, setInput] = useState('');
  const [langCode, setLangCode] = useState('52');
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const { id } = useParams();
  const socketRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      let attempts = 0;
      const maxAttempts = 3;

      const tryConnect = async () => {
        try {
          socketRef.current = await initSocket();
          setSocketConnected(true);

          socketRef.current.on('connect_error', (err) => {
            console.error('Connection error:', err);
            handleError(err, attempts);
          });

          socketRef.current.on('connect_failed', (err) => {
            console.error('Connection failed:', err);
            handleError(err, attempts);
          });

          socketRef.current.emit(ACTIONS.JOIN, {
            id,
            username: location.state?.username || 'Anonymous',
          }, (response) => {
            if (response?.error) {
              throw new Error(response.error);
            }
          });

          socketRef.current.on(ACTIONS.DOUBT, ({ doubts, username, socketId }) => {
            setAllDoubts(doubts);
            toast.success(`${username} asked a doubt!`);
          });

          socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
            setClients(clients);
            if (username !== location.state?.username) {
              toast.success(`${username} joined the room.`);
            }
          });

          socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
            toast.success(`${username} left the room.`);
            setClients((prev) => prev.filter((item) => item.socketId !== socketId));
          });
        } catch (err) {
          attempts++;
          if (attempts < maxAttempts) {
            console.log(`Retrying connection (${attempts}/${maxAttempts})...`);
            setTimeout(tryConnect, 5000); // Retry after 5 seconds
          } else {
            handleError(err, attempts);
          }
        }
      };

      const handleError = (err, attemptCount) => {
        console.error('Socket error:', err);
        if (attemptCount >= maxAttempts) {
          toast.error('Connection failed after retries, try again later!');
          navigate('/');
        }
      };

      tryConnect();

      return () => {
        if (socketRef.current) {
          socketRef.current.off(ACTIONS.JOINED);
          socketRef.current.off(ACTIONS.DISCONNECTED);
          socketRef.current.disconnect();
        }
      };
    };

    init();
  }, [id, navigate, location.state]);

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success('Room ID copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy room ID');
    }
  };

  const askDoubt = (e) => {
    e.preventDefault();
    if (doubt.trim() === '') {
      toast.error('Doubt cannot be empty');
      return;
    }
    socketRef.current?.emit(ACTIONS.DOUBT, {
      id,
      username: location.state?.username,
      doubt,
    });
    setDoubt('');
  };

  const lockAccess = () => {
    const newAccess = !access;
    setAccess(newAccess);
    socketRef.current?.emit('lock_access', {
      id,
      access: newAccess,
    });
  };

  const leaveRoom = () => {
    navigate('/');
    toast.success('You left the room');
  };

  const downloadTxtFile = () => {
    if (!liveCode) {
      toast.error('No code to download');
      return;
    }
    const element = document.createElement('a');
    const file = new Blob([liveCode], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'code.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const runCode = async () => {
    setTerminal(false);
    setEditorOpen(true);
    setOutput('Loading...');

    if (!liveCode.trim()) {
      setOutput('Please write some code first');
      setTerminal(true);
      return;
    }

    try {
      const encodedCode = btoa(encodeURIComponent(liveCode));
      const safeInput = input || '';
      const encodedInput = btoa(encodeURIComponent(safeInput));

      const options = {
        method: 'POST',
        url: 'https://judge0-ce.p.rapidapi.com/submissions',
        params: { base64_encoded: 'true', fields: '*' },
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': process.env.REACT_APP_RAPID_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        },
        data: {
          language_id: Number(langCode),
          source_code: encodedCode,
          stdin: encodedInput
        }
      };

      const response = await axios.request(options);
      const result = await axios.get(
        `https://judge0-ce.p.rapidapi.com/submissions/${response.data.token}`,
        {
          params: { base64_encoded: 'true', fields: '*' },
          headers: {
            'X-RapidAPI-Key': process.env.REACT_APP_RAPID_API_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
          }
        }
      );

      const outputText = result.data.stdout 
        ? atob(result.data.stdout) 
        : result.data.stderr
          ? atob(result.data.stderr)
          : result.data.status?.description || 'No output';

      setOutput(outputText);
      if (outputText.includes('Enter your name:')) {
        setIsWaitingForInput(true);
      } else {
        setIsWaitingForInput(false);
      }
      setTerminal(true);
    } catch (error) {
      console.error('Execution error:', error);
      setOutput('Error executing code. Please try again.');
      setTerminal(true);
    }
  };

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="mainWrap" style={{ 
      gridTemplateColumns: menuOpen 
        ? editorOpen 
          ? '230px 1fr 0.4fr' 
          : '230px 1fr' 
        : editorOpen 
          ? '0 1fr 0.4fr' 
          : '0 1fr' 
    }}>
      <div className="aside" style={{ position: 'relative' }}>
        <div 
          className="menu-options" 
          style={{ left: menuOpen ? '230px' : '0px' }} 
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <AiOutlineMenu />
        </div>
        <div className="asideInner">
          <div className="logo">
            <h2 className="logo_design">
              <img src={bglogo} alt="Code Together Logo" style={{ width: '220px' }} />
            </h2>
          </div>
          <h3>Developer</h3>
          <div className="clientsList">
            {clients[0] && <Client key={clients[0].socketId} username={clients[0].username} />}
          </div>
          <h3>Contributors</h3>
          <div className="clientsList">
            {clients.slice(1).map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        <select 
          className="btn copyBtn" 
          value={langCode} 
          onChange={(e) => setLangCode(e.target.value)}
          style={{ marginBottom: '10px', outline: 'none' }}
        >
          <option value="52">C++</option>
          <option value="49">C</option>
          <option value="63">JavaScript</option>
          <option value="92">Python</option>
        </select>
        <button className="btn copyBtn" onClick={copyRoomId}>
          Copy ROOM ID
        </button>
        <button className="btn leaveBtn" onClick={leaveRoom}>
          Leave
        </button>
      </div>
      
      <div className="editorWrap">
        <Editor 
          socketRef={socketRef} 
          id={id} 
          setLiveCode={setLiveCode} 
          access={access} 
          editorRef={editorRef} 
          connected={socketConnected}
        />
      </div>
      
      <div className="terminal">
        {editorOpen && (
          <Terminal 
            output={output} 
            terminal={terminal} 
            setEditorOpen={setEditorOpen} 
            setInput={setInput} 
            input={input} 
            runCode={runCode} 
            isWaitingForInput={isWaitingForInput} 
          />
        )}
      </div>
      
      {clients[0]?.username === location.state.username && (
        <button 
          className="btn doubtBtn" 
          style={{ right: '300px' }} 
          onClick={lockAccess}
        >
          {access ? 'Lock' : 'Unlock'} Editor
        </button>
      )}
      
      <button className="btn doubtBtn" style={{ right: '443px' }} onClick={runCode}>
        Run Code
      </button>
      
      <button className="btn doubtBtn" style={{ right: '140px' }} onClick={downloadTxtFile}>
        Download Code
      </button>
      
      <button className="btn doubtBtn" onClick={(e) => {
        e.preventDefault();
        setChatShown(true);
      }}>
        Ask a doubt?
      </button>
      
      {isChatShown && (
        <DoubtSection 
          status={setChatShown} 
          setDoubt={setDoubt} 
          doubt={doubt} 
          askDoubt={askDoubt} 
          allDoubts={allDoubts} 
        />
      )}
    </div>
  );
}

export default EditorPage;
