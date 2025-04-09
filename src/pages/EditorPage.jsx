import React, { useEffect, useRef, useState } from 'react';
import ACTIONS from '../Action';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../Socket';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import DoubtSection from '../components/DoubtSection';
import bglogo from '../images/bglogo.png';
import { AiOutlineMenu } from 'react-icons/ai';
import axios from 'axios';
import Terminal from '../components/Terminal';

function EditorPage() {
  const socketRef = useRef(null);
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { id: roomId } = useParams();
  
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
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check if we have username from location state
    if (!location.state?.username) {
      navigate('/');
      return;
    }

    const init = async () => {
      try {
        socketRef.current = await initSocket();
        
        // Socket event handlers
        socketRef.current.on('connect', () => {
          setIsConnected(true);
          console.log('Socket connected successfully');
          
          socketRef.current.emit(ACTIONS.JOIN, {
            roomId,
            username: location.state.username,
          });
        });

        socketRef.current.on('connect_error', (err) => {
          console.error('Connection error:', err);
          toast.error('Failed to connect to server');
          handleDisconnect();
        });

        socketRef.current.on('connect_failed', (err) => {
          console.error('Connection failed:', err);
          toast.error('Connection failed');
          handleDisconnect();
        });

        socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
          setClients(clients);
          if (username !== location.state.username) {
            toast.success(`${username} joined the room`);
          }
        });

        socketRef.current.on(ACTIONS.DOUBT, ({ doubts, username }) => {
          setAllDoubts(doubts);
          toast.success(`${username} asked a doubt!`);
        });

        socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
          toast.success(`${username} left the room`);
          setClients(prev => prev.filter(client => client.socketId !== socketId));
        });

      } catch (err) {
        console.error('Initialization error:', err);
        toast.error('Failed to initialize editor');
        handleDisconnect();
      }
    };

    init();

    return () => {
      cleanupSocket();
    };
  }, [roomId, location.state?.username, navigate]);

  const handleDisconnect = () => {
    cleanupSocket();
    navigate('/');
  };

  const cleanupSocket = () => {
    if (socketRef.current) {
      socketRef.current.off('connect');
      socketRef.current.off('connect_error');
      socketRef.current.off('connect_failed');
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
      socketRef.current.off(ACTIONS.DOUBT);
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID copied!');
    } catch (err) {
      toast.error('Failed to copy room ID');
    }
  };

  const askDoubt = (e) => {
    e.preventDefault();
    if (!doubt.trim()) {
      toast.error('Doubt cannot be empty');
      return;
    }
    socketRef.current?.emit(ACTIONS.DOUBT, {
      roomId,
      username: location.state.username,
      doubt,
    });
    setDoubt('');
  };

  const lockAccess = () => {
    const newAccess = !access;
    setAccess(newAccess);
    socketRef.current?.emit('lock_access', {
      roomId,
      access: newAccess,
    });
  };

  const leaveRoom = () => {
    cleanupSocket();
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
      setIsWaitingForInput(outputText.includes('Enter your name:'));
      setTerminal(true);
    } catch (error) {
      console.error('Execution error:', error);
      setOutput('Error executing code');
      setTerminal(true);
    }
  };

  // Render loading state while connecting
  if (!isConnected) {
    return <div>Connecting to room...</div>;
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
          id={roomId} 
          setLiveCode={setLiveCode} 
          access={access} 
          editorRef={editorRef}
        />
      </div>
      
      {editorOpen && (
        <div className="terminal">
          <Terminal 
            output={output} 
            terminal={terminal} 
            setEditorOpen={setEditorOpen} 
            setInput={setInput} 
            input={input} 
            runCode={runCode} 
            isWaitingForInput={isWaitingForInput} 
          />
        </div>
      )}
      
      {clients[0]?.username === location.state?.username && (
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
      
      <button className="btn doubtBtn" onClick={() => setChatShown(true)}>
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
