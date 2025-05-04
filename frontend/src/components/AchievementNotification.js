import React, { useState, useEffect } from 'react';
import './AchievementNotification.css';

function AchievementNotification({ achievement, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  
  // Show animation when component mounts
  useEffect(() => {
    // Small timeout to ensure CSS transition works
    setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    // Auto-hide notification after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleClose = () => {
    setIsVisible(false);
    // Allow animation to complete before removing from DOM
    setTimeout(() => {
      if (onClose) onClose();
    }, 500);
  };
  
  if (!achievement) return null;
  
  return (
    <div className={`achievement-notification ${isVisible ? 'visible' : ''}`}>
      <div className="notification-icon">{achievement.icon}</div>
      <div className="notification-content">
        <h3>Achievement Unlocked!</h3>
        <h4>{achievement.name}</h4>
        <p>{achievement.description}</p>
      </div>
      <button className="notification-close" onClick={handleClose}>×</button>
    </div>
  );
}

export default AchievementNotification; 