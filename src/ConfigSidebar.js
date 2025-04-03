import React, { useState, useRef } from 'react';
import './ConfigSidebar.css';

function ConfigSidebar({ show, closeSidebar, promptButtons, setPromptButtons, showMessage, onPinConfig }) {
  const [buttonText, setButtonText] = useState('');
  const [promptContent, setPromptContent] = useState('');
  const [tag, setTag] = useState('');
  const fileInputRef = useRef(null);

  const addConfig = () => {
    if (!buttonText.trim() || !promptContent.trim()) {
      alert('请填写按钮文本和提示内容');
      return;
    }
    const newConfig = {
      text: buttonText.trim(),
      prompt: promptContent.trim(),
      tag: tag.trim()
    };
    setPromptButtons([...promptButtons, newConfig]);
    setButtonText('');
    setPromptContent('');
    setTag('');
    showMessage('配置已添加');
  };

  const deleteConfig = (index) => {
    const newConfigs = [...promptButtons];
    newConfigs.splice(index, 1);
    setPromptButtons(newConfigs);
  };

  const exportConfig = () => {
    const dataStr = JSON.stringify(promptButtons, null, 4);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'buttons_config.json';
    a.click();
    URL.revokeObjectURL(url);
    showMessage('配置已导出');
  };

  const importConfig = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          setPromptButtons(imported);
          showMessage('配置已导入');
        } else {
          alert('配置文件格式不正确');
        }
      } catch (err) {
        alert('读取配置文件失败');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={`config-sidebar ${show ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>配置管理</h2>
        <button className="close-btn" onClick={closeSidebar}>关闭</button>
      </div>
      <div className="sidebar-content">
        <input
          type="text"
          value={buttonText}
          onChange={(e) => setButtonText(e.target.value)}
          placeholder="按钮文本"
        />
        <textarea
          value={promptContent}
          onChange={(e) => setPromptContent(e.target.value)}
          placeholder="提示内容，使用<用户下次输入>作为占位符"
        />
        <input
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="标签（可选）"
        />
        <button className="add-btn" onClick={addConfig}>添加配置</button>
        <div className="config-grid">
          {promptButtons.map((config, index) => (
            <div key={index} className="config-item">
              {/* 左箭头按钮，点击后将该配置钉选到主界面 */}
              <button 
                className="pin-btn" 
                onClick={() => onPinConfig(config)}
                title="钉选到主界面并支持拖拽排序"
              >
                📌
              </button>
              <div className="config-text">{config.text}</div>
              <button className="delete-btn" onClick={() => deleteConfig(index)}>删除</button>
            </div>
          ))}
        </div>
        <div className="sidebar-actions">
          <button onClick={exportConfig}>导出 JSON</button>
          <label className="import-label">
            导入 JSON
            <input type="file" accept="application/json" onChange={importConfig} ref={fileInputRef} />
          </label>
        </div>
      </div>
    </div>
  );
}

export default ConfigSidebar;