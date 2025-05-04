import React, { useState, useEffect } from 'react';
import AchievementService from '../services/AchievementService';
import './AchievementPanel.css';

function AchievementPanel({ isOpen, onClose, inMainMenu = false }) {
  const [achievements, setAchievements] = useState([]);
  
  useEffect(() => {
    // Load all achievements with their unlock status
    setAchievements(AchievementService.getAllAchievements());
  }, [isOpen]); // Refresh when panel is opened
  
  if (!isOpen) return null;
  
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  
  return (
    <div className={`achievement-panel ${inMainMenu ? 'in-main-menu' : ''}`}>
      <div className="achievement-header">
        <h2>Achievements</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="achievement-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          ></div>
        </div>
        <div className="progress-text">
          {unlockedCount} of {totalCount} unlocked
        </div>
      </div>
      
      <div className="achievements-grid">
        {achievements.map(achievement => (
          <div 
            key={achievement.id} 
            className={`achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`}
          >
            <div className="achievement-icon">{achievement.icon}</div>
            <div className="achievement-details">
              <h3 className="achievement-name">{achievement.name}</h3>
              <p className="achievement-description">{achievement.description}</p>
            </div>
            {!achievement.unlocked && <div className="locked-overlay">🔒</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AchievementPanel; 