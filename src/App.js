import React, { useState, useEffect } from 'react';
import ConfigSidebar from './ConfigSidebar';
import './App.css';

function App() {
  const [userInput, setUserInput] = useState('');
  const [finalPrompt, setFinalPrompt] = useState('');
  const [promptButtons, setPromptButtons] = useState([]);
  // 用于主界面展示已钉选的配置
  const [pinnedConfigs, setPinnedConfigs] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);

  const [draggingIndex, setDraggingIndex] = useState(null);

  const handleDragStart = (e, index) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index);
    setDraggingIndex(index);
    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const draggedIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (draggedIndex === targetIndex) return;

    const newPinned = [...pinnedConfigs];
    const [removed] = newPinned.splice(draggedIndex, 1);
    newPinned.splice(targetIndex, 0, removed);
    setPinnedConfigs(newPinned);
    setDraggingIndex(null);
  };

  // 从 localStorage 加载配置
  useEffect(() => {
    const stored = localStorage.getItem('promptButtons');
    if (stored) {
      try {
        setPromptButtons(JSON.parse(stored));
      } catch (e) {
        console.error('读取配置失败', e);
      }
    }
  }, []);

  // 保存配置到 localStorage
  useEffect(() => {
    localStorage.setItem('promptButtons', JSON.stringify(promptButtons));
  }, [promptButtons]);

  const showMessage = (msg, duration = 2000) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(''), duration);
  };

  // 根据传入配置生成提示
  const applyConfig = (config) => {
    const generated = config.prompt.replace('<用户下次输入>', userInput);
    setFinalPrompt(generated);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(finalPrompt);
    showMessage('已复制到剪贴板');
  };

  // 钉选配置到主界面（如果还没钉选的话）
  const pinConfig = (config) => {
    if (!pinnedConfigs.find((c) => c.text === config.text && c.prompt === config.prompt)) {
      setPinnedConfigs([...pinnedConfigs, config]);
      showMessage('已添加至主界面备选');
    } else {
      showMessage('该配置已在主界面备选中');
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <div className="config-toggle" onClick={() => setShowSidebar(true)}>
          配置
        </div>
      </div>
      <div className="center-content">
        <input
          type="text"
          className="main-input"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="请输入你的问题或请求"
        />
        {/* 主界面备选区域 */}
        {pinnedConfigs.map((config, index) => (
          <button
            key={index}
            className="config-btn"
            onClick={() => applyConfig(config)}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            style={{
              opacity: draggingIndex === index ? 0.5 : 1,
              cursor: "grab",
            }}
          >
            {config.text}
          </button>
        ))}
        {finalPrompt && (
          <div className="result-container">
            <textarea
              readOnly
              value={finalPrompt}
              placeholder="生成的提示将在这里显示"
            />
            <button className="copy-btn" onClick={copyToClipboard}>
              复制
            </button>
          </div>
        )}
        {alertMessage && <div className="alert">{alertMessage}</div>}
      </div>
      <ConfigSidebar 
        show={showSidebar} 
        closeSidebar={() => setShowSidebar(false)}
        promptButtons={promptButtons}
        setPromptButtons={setPromptButtons}
        showMessage={showMessage}
        onPinConfig={pinConfig}
      />
    </div>
  );
}

export default App;