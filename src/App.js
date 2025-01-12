import './App.css';
import './Doubt.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home1 from './pages/Home1';
import EditorPage from './pages/EditorPage';
import { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";

function App() {
  const [backgroundImage, setBackgroundImage] = useState("");

  // Set the background image dynamically
  useEffect(() => {
    setBackgroundImage("url('./images/background.png')");
  }, []);

  return (
    <>
      <div
        style={{
          backgroundImage: backgroundImage,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          minHeight: "100vh",
          transition: "background 0.5s ease-in-out",
        }}
      >
        <Toaster
          position='top-center'
          toastOptions={{
            success: {
              theme: {
                primary: '#4aed88',
              },
            },
          }}
        />
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Home1 />} />
            <Route path='/editor/:id' element={<EditorPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
