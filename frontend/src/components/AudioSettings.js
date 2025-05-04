import React, { useState, useEffect } from 'react';
import './AudioSettings.css';
import audioService from '../services/AudioService';

function AudioSettings() {
  const [settings, setSettings] = useState({
    musicVolume: 0.5,
    sfxVolume: 0.7,
    musicEnabled: true,
    sfxEnabled: true
  });
  
  // Load initial settings from AudioService
  useEffect(() => {
    const currentSettings = audioService.getSettings();
    setSettings(currentSettings);
  }, []);
  
  // Handle music volume change
  const handleMusicVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setSettings(prev => ({ ...prev, musicVolume: newVolume }));
    audioService.setMusicVolume(newVolume);
    
    // Play background music if it's not already playing and music is enabled
    if (settings.musicEnabled) {
      audioService.playMusic();
    }
  };
  
  // Handle sound effects volume change
  const handleSfxVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setSettings(prev => ({ ...prev, sfxVolume: newVolume }));
    audioService.setSfxVolume(newVolume);
  };
  
  // Handle music toggle
  const handleMusicToggle = () => {
    const newState = !settings.musicEnabled;
    setSettings(prev => ({ ...prev, musicEnabled: newState }));
    audioService.toggleMusic(newState);
  };
  
  // Handle sound effects toggle
  const handleSfxToggle = () => {
    const newState = !settings.sfxEnabled;
    setSettings(prev => ({ ...prev, sfxEnabled: newState }));
    audioService.toggleSfx(newState);
    
    // Play a test sound when enabling
    if (newState) {
      audioService.playSound('buttonClick');
    }
  };
  
  // Format percentage for display
  const formatPercent = (value) => {
    return `${Math.round(value * 100)}%`;
  };
  
  return (
    <div className="audio-settings">
      <h3>Audio Settings</h3>
      
      <div className="settings-row">
        <div className="setting-label">
          <span>Music</span>
          <span className="setting-value">{formatPercent(settings.musicVolume)}</span>
        </div>
        <div className="setting-controls">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.musicEnabled}
              onChange={handleMusicToggle}
            />
            <span className="slider round"></span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.musicVolume}
            onChange={handleMusicVolumeChange}
            disabled={!settings.musicEnabled}
            className="volume-slider"
          />
        </div>
      </div>
      
      <div className="settings-row">
        <div className="setting-label">
          <span>Sound Effects</span>
          <span className="setting-value">{formatPercent(settings.sfxVolume)}</span>
        </div>
        <div className="setting-controls">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.sfxEnabled}
              onChange={handleSfxToggle}
            />
            <span className="slider round"></span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.sfxVolume}
            onChange={handleSfxVolumeChange}
            disabled={!settings.sfxEnabled}
            className="volume-slider"
          />
        </div>
      </div>
    </div>
  );
}

export default AudioSettings; 