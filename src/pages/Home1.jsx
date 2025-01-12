import React from 'react';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import sun from '../images/sun.png';
import moon from '../images/moon.png';
import prop1 from '../images/prop1.png';
import prop2 from '../images/prop2.png';
import prop3 from '../images/prop3.png';
import prop4 from '../images/prop4.png';
import prop5 from '../images/prop5.png';
//import code from '../images/code.png';
import bglogo from '../images/bglogo.png';

const Home1 = () => {
    const [darkMode, setDarkMode] = useState(true);
    const [id, setId] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.body.style.backgroundColor = darkMode ? 'white' : '#282727';
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
            state: {
                username,
            },
        });
        toast.success('Successfully entered room');
    };

    return (
        <div className="homepagewrapper">
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

                    backgroundColor: darkMode ? 'black' : '#E8E7E7',
                }}
            >
                <h4
                    className="main_label"
                    style={{
                        marginTop: '40px',
                        marginBottom: '40px',

                        color: darkMode ? '#E8E7E7' : '#1C1C1C',
                    }}
                >
                    Paste Invitation Room ID
                </h4>
                <div className="input_wrapper">
                    <input
                        type="text"
                        placeholder="Room ID"
                        className="inputBox"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        onKeyUp={handleInputEnter}
                    />
                    <input
                        type="text"
                        placeholder="Username"
                        className="inputBox"
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyUp={handleInputEnter}
                    />
                    <div>
                        <span
                            className="createInfo"
                            style={{
                                color: darkMode ? '#E8E7E7' : '#1C1C1C',
                            }}
                        >
                            If you don't have an invite, create &nbsp;
                            <button
                                className="createNewBtn"
                                onClick={createNewRoom}
                            >
                                new Room
                            </button>
                        </span>
                        <button
                            className="btn joinBtn"
                            onClick={joinRoom}
                        >
                            Join
                        </button>
                    </div>
                </div>
            </div>
            {darkMode ? (
                <img
                    src={sun}
                    alt="Sun"
                    style={{
                        width: '50px',
                        position: 'absolute',
                        top: '5rem',
                        cursor: 'pointer',
                    }}
                    className="darkModeBtn"
                    onClick={toggleDarkMode}
                />
            ) : (
                <img
                    src={moon}
                    alt="Moon"
                    className="darkModeBtn"
                    style={{
                        width: '50px',
                        position: 'absolute',
                        top: '5rem',
                        cursor: 'pointer',
                    }}
                    onClick={toggleDarkMode}
                />
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
