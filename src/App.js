import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import LeftPanel from "./components/LeftPanel";
import RightPanel from "./components/RightPanel";
import { AiFillAudio, AiOutlineAudioMuted } from "react-icons/ai";

function App() {
  const [theme, setTheme] = useState("theme1");

  // Code State (Shared Between LeftPanel & RightPanel)
  const [htmlCode, setHtmlCode] = useState("");
  const [cssCode, setCssCode] = useState("");
  const [jsCode, setJsCode] = useState("");

  // Input for Code Generation
  const [codePrompt, setCodePrompt] = useState("");

  // Speech Recognition State
  const [isMicOn, setIsMicOn] = useState(false);
  const [recognition, setRecognition] = useState(null);

  const themes = {
    theme1: { body: "#f5f5f5", header: "#ffffff", leftPanel: "#e3f2fd", rightPanel: "#f1f8e9" },
    theme2: { body: "#e0e0e0", header: "#d6d6d6", leftPanel: "#cfd8dc", rightPanel: "#d7ccc8" },
    theme3: { body: "#ffffff", header: "#f7f7f7", leftPanel: "#64b5f6", rightPanel: "#81c784" },
    theme4: { body: "#121212", header: "#212121", leftPanel: "#263238", rightPanel: "#37474f" },
    theme5: { body: "#f0f4c3", header: "#dce775", leftPanel: "#dcedc8", rightPanel: "#ffccbc" },
  };

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const speechRecognition = new window.webkitSpeechRecognition();
      speechRecognition.continuous = false;
      speechRecognition.interimResults = false;
      speechRecognition.lang = "en-US";

      speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setCodePrompt(transcript);
        handleCodeSubmit(); // Automatically submit code
      };

      speechRecognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
      };

      setRecognition(speechRecognition);
    } else {
      alert("Speech Recognition is not supported in this browser.");
    }
  }, []);

  // Generate New Code Using AI
  const handleCodeSubmit = async () => {
    if (codePrompt.trim() !== "") {
      try {
        const response = await axios.post("https://s-p-e-a-r-backend.onrender.com/generate-code", { prompt: codePrompt });

        setHtmlCode(response.data.htmlCode);
        setCssCode(response.data.cssCode);
        setJsCode(response.data.jsCode);
        setCodePrompt("");
      } catch (error) {
        console.error("Error fetching code response:", error);
      }
    }
  };

  // Update Code via Chatbot (RightPanel)
  const handleCodeUpdate = (updatedHtml, updatedCss, updatedJs) => {
    setHtmlCode(updatedHtml || htmlCode);
    setCssCode(updatedCss || cssCode);
    setJsCode(updatedJs || jsCode);
  };

  // Toggle Mic for Voice Recognition
  const toggleMic = () => {
    if (!recognition) return;
    isMicOn ? recognition.stop() : recognition.start();
    setIsMicOn(!isMicOn);
  };

  const selectedTheme = themes[theme];

  return (
    <div style={{ backgroundColor: selectedTheme.body, transition: "background-color 0.3s ease" }}>
      <header className="header" style={{ backgroundColor: selectedTheme.header }}>
        <h1>S.P.E.A.R</h1>

        {/* Coding Input (LeftPanel AI) */}
        <div className="prompt-container">
          <input
            type="text"
            className="prompt-input"
            placeholder="Enter coding prompt..."
            value={codePrompt}
            onChange={(e) => setCodePrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCodeSubmit()}
          />
          <button onClick={handleCodeSubmit}>Generate Code</button>
        </div>

        {/* Theme Selector */}
        <select className="theme-dropdown" value={theme} onChange={(e) => setTheme(e.target.value)}>
          {Object.keys(themes).map((key) => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
      </header>

      <div className="container">
        {/* LeftPanel receives and displays code */}
        <LeftPanel 
          color={selectedTheme.leftPanel} 
          htmlCode={htmlCode} 
          cssCode={cssCode} 
          jsCode={jsCode} 
          onCodeChange={handleCodeUpdate} 
        />

        {/* RightPanel handles chat & modifies LeftPanel code */}
        <RightPanel 
          color={selectedTheme.rightPanel} 
          htmlCode={htmlCode} 
          cssCode={cssCode} 
          jsCode={jsCode} 
          onUpdateCode={handleCodeUpdate} 
        />
      </div>
    </div>
  );
}

export default App;
