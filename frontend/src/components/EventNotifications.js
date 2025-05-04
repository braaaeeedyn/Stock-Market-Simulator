import React, { useState, useEffect } from 'react';
import './EventNotifications.css';

function EventNotifications({ events }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (events && events.length > 0) {
      // Add new events to the beginning of the notifications list
      setNotifications(prevNotifications => [
        ...events.map(event => ({
          ...event,
          id: Date.now() + Math.random(),
          timestamp: new Date().toLocaleTimeString()
        })),
        ...prevNotifications
      ]);
    }
  }, [events]);

  const removeNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  return (
    <div className="event-notifications">
      <h3>Market News</h3>
      
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <p className="no-events">No recent market events</p>
        ) : (
          notifications.slice(0, 10).map(notification => (
            <div 
              key={notification.id} 
              className={`notification ${getEventClass(notification.type)}`}
            >
              <div className="notification-header">
                <span className="notification-type">{formatEventType(notification.type)}</span>
                <span className="notification-time">{notification.timestamp}</span>
                <button 
                  className="close-button" 
                  onClick={() => removeNotification(notification.id)}
                >
                  ×
                </button>
              </div>
              <p className="notification-description">{notification.description}</p>
              {notification.impact && (
                <div className="impact-indicator">
                  <span>Impact:</span> 
                  <span className={getImpactClass(notification.impact)}>
                    {formatImpact(notification.impact)}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Helper functions
function getEventClass(eventType) {
  switch (eventType) {
    case 'market_crash':
    case 'sector_bust':
    case 'company_scandal':
      return 'negative';
    case 'market_rally':
    case 'sector_boom':
    case 'company_breakthrough':
      return 'positive';
    default:
      return 'neutral';
  }
}

function formatEventType(eventType) {
  const formatted = eventType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return formatted;
}

function getImpactClass(impact) {
  if (impact > 0) return 'positive';
  if (impact < 0) return 'negative';
  return 'neutral';
}

function formatImpact(impact) {
  if (impact > 0) return `+${(impact * 100).toFixed(1)}%`;
  if (impact < 0) return `${(impact * 100).toFixed(1)}%`;
  return '0%';
}

export default EventNotifications; 