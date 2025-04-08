import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import sun from '../images/sun.png';
import moon from '../images/moon.png';
import videoFile from '../videos/switchVideo.mp4';
import prop1 from '../images/prop1.png';
import prop2 from '../images/prop2.png';
import prop3 from '../images/prop3.png';
import prop4 from '../images/prop4.png';
import prop5 from '../images/prop5.png';
import bglogo from '../images/bglogo.png';
import backgroundImg from '../images/background.png'; // Import the background image

const Home1 = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [id, setId] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.body.style.backgroundColor = 'black';
      document.body.style.color = 'black';
      document.body.style.transition = 'all 0.2s ease-in-out';
    } else {
      document.body.classList.remove('dark-mode');
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    if (darkMode) {
      setShowVideo(true);
      setTimeout(() => {
        setDarkMode(false);
        setShowVideo(false);
        document.body.style.backgroundColor = '';
        document.body.style.color = '';
      }, 5000);
    } else {
      setDarkMode(true);
      document.body.style.backgroundColor = 'black';
      document.body.style.color = 'black';
    }
  };

  const createNewRoom = (e) => {
    e.preventDefault();
    const newId = uuidv4();
    setId(newId);
    toast.success('Created new room');
  };

  const handleInputEnter = (e) => {
    if (e.code === 'Enter') {
      joinRoom();
    }
  };

  const joinRoom = () => {
    if (!id || !username) {
      toast.error('Not valid inputs, try again!');
      return;
    }
    navigate(`/editor/${id}`, {
      state: { username },
    });
    toast.success('Successfully entered room');
  };

  return (
    <div
      className="homepagewrapper"
      style={{
        backgroundImage: `url(${backgroundImg})`, // Apply background here
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        minHeight: "100vh",
        transition: "background 0.5s ease-in-out",
      }}
    >
      <img
        src={bglogo}
        alt="Background Logo"
        className="darkModeBtn"
        style={{
          position: 'absolute',
          width: '400px',
          top: '10px',
          marginLeft: '1rem',
        }}
      />
      <div
        className="form_wrapper"
        style={{
          marginTop: '186px',
          backgroundColor: darkMode ? 'black' : 'black',
        }}
      >
        <h4
          className="main_label"
          style={{
            marginTop: '40px',
            marginBottom: '40px',
            color: darkMode ? 'white' : 'white', // Adjusted for visibility
          }}
        >
          Paste Invitation Room ID
        </h4>
        <div className="input_wrapper">
          <input
            type="text"
            placeholder="Room ID"
            className={`inputBox ${darkMode ? 'dark-mode' : 'light-mode'}`}
            value={id}
            onChange={(e) => setId(e.target.value)}
            onKeyUp={handleInputEnter}
            style={{
              caretColor: darkMode ? 'white' : 'black', // Adjusted for visibility
              color: darkMode ? 'white' : 'black', // Adjusted for visibility
            }}
          />
          <input
            type="text"
            placeholder="Username"
            className={`inputBox ${darkMode ? 'dark-mode' : 'light-mode'}`}
            onChange={(e) => setUsername(e.target.value)}
            onKeyUp={handleInputEnter}
            style={{
              caretColor: darkMode ? 'white' : 'black', // Adjusted for visibility
              color: darkMode ? 'white' : 'black', // Adjusted for visibility
            }}
          />
          <div>
            <span
              className="createInfo"
              style={{
                color: darkMode ? 'white' : 'white', // Adjusted for visibility
              }}
            >
              <b>If you don't have an invite, create </b>
              <button className="createNewBtn" onClick={createNewRoom}>
                <b>new Room</b>
              </button>
            </span>
            <button className="btn joinBtn" onClick={joinRoom}>
              Join
            </button>
          </div>
        </div>
      </div>
      {darkMode ? (
        <img
          src={moon}
          alt="Moon"
          className="darkModeBtn"
          style={{
            width: '50px',
            position: 'absolute',
            top: '60rem',
            cursor: 'pointer',
            right: '31%',
          }}
          onClick={toggleDarkMode}
        />
      ) : (
        <img
          src={sun}
          alt="Sun"
          style={{
            width: '50px',
            position: 'absolute',
            top: '60rem',
            cursor: 'pointer',
            right: '31%',
          }}
          className="darkModeBtn"
          onClick={toggleDarkMode}
        />
      )}
      {showVideo && (
        <div
          style={{
            position: 'absolute',
            top: '58%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
          }}
        >
          <video
            src={videoFile}
            autoPlay
            style={{
              width: '100%',
              maxWidth: '600px',
            }}
          ></video>
        </div>
      )}
      <img src={prop2} alt="" className="prop-image prop1" />
      <img src={prop3} alt="" className="prop-image prop2" />
      <img src={prop1} alt="" className="prop-image prop3" />
      <img src={prop4} alt="" className="prop-image prop4" />
      <img src={prop5} alt="" className="prop-image prop5" />
      <div className="circle-l-1"></div>
      <div className="circle-l-2"></div>
      <div className="circle-l-3"></div>
      <div className="circle-l-4"></div>
      <div className="circle-l-5"></div>
      <div className="circle-r-1"></div>
      <div className="circle-r-2"></div>
      <div className="circle-r-3"></div>
      <div className="circle-r-4"></div>
      <div className="circle-r-5"></div>
    </div>
  );
};

export default Home1;
