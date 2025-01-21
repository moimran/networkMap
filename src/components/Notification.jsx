import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '../context/ThemeContext';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const NotificationContainer = styled.div`
  position: fixed;
  top: 60px;
  right: 20px;
  z-index: 1100;
`;

const NotificationWrapper = styled.div`
  position: relative;
`;

const NotificationBell = styled.button`
  width: 32px;
  height: 32px;
  border: 1px solid ${props => props.$isDarkMode ? '#404040' : '#d0d0d0'};
  border-radius: 4px;
  background: ${props => props.$isDarkMode 
    ? 'linear-gradient(180deg, #3d3d3d 0%, #2d2d2d 100%)'
    : 'linear-gradient(180deg, #FFFFFF 0%, #F3F3F3 100%)'};
  color: ${props => props.$isDarkMode ? '#ffffff' : '#333333'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &:hover {
    background: ${props => props.$isDarkMode 
      ? 'linear-gradient(180deg, #4d4d4d 0%, #3d3d3d 100%)'
      : 'linear-gradient(180deg, #F3F3F3 0%, #E3E3E3 100%)'};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ff4444;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NotificationList = styled.div`
  position: absolute;
  top: 45px;
  right: 0;
  width: 300px;
  max-height: 400px;
  overflow-y: auto;
  background: ${props => props.$isDarkMode ? '#2d2d2d' : '#ffffff'};
  border: 1px solid ${props => props.$isDarkMode ? '#404040' : '#e0e0e0'};
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: ${props => props.$show ? 'block' : 'none'};
  z-index: 1200;
`;

const NotificationGroup = styled.div`
  border-bottom: 1px solid ${props => props.$isDarkMode ? '#404040' : '#e0e0e0'};
  padding: 8px 0;

  &:last-child {
    border-bottom: none;
  }
`;

const NotificationGroupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: ${props => props.$isDarkMode ? '#363636' : '#f5f5f5'};
  color: ${props => props.type === 'success' ? '#4CAF50' : '#f44336'};
  font-weight: 600;
  font-size: 13px;
`;

const NotificationGroupCount = styled.span`
  background: ${props => props.type === 'success' ? '#4CAF50' : '#f44336'};
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
`;

const NotificationItem = styled.div`
  padding: 8px 12px;
  color: ${props => props.$isDarkMode ? '#ffffff' : '#333333'};
  font-size: 13px;
  border-bottom: 1px solid ${props => props.$isDarkMode ? '#404040' : '#e0e0e0'};
  background: ${props => props.$isDarkMode ? '#2d2d2d' : '#ffffff'};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${props => props.$isDarkMode ? '#363636' : '#f5f5f5'};
  }
`;

const Toast = styled.div`
  padding: 12px 16px;
  border-radius: 4px;
  background: ${props => props.type === 'success' ? '#4CAF50' : '#f44336'};
  color: white;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  animation: ${props => props.leaving ? slideOut : slideIn} 0.3s ease-in-out;
  font-size: 13px;
`;

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
  </svg>
);

const Notification = () => {
  const { isDarkMode } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toasts, setToasts] = useState([]);

  const groupedNotifications = useMemo(() => {
    const successNotifications = notifications.filter(n => n.type === 'success');
    const errorNotifications = notifications.filter(n => n.type === 'error');
    return {
      success: successNotifications,
      error: errorNotifications
    };
  }, [notifications]);

  const addNotification = (message, type) => {
    const newNotification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    // Add toast
    const newToast = { ...newNotification };
    setToasts(prev => [newToast, ...prev]);

    // Remove toast after 2 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 2000);

    // Clear notification after 5 minutes
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5 * 60 * 1000);
  };

  // Expose addNotification to window for global access
  useEffect(() => {
    window.addNotification = addNotification;
    return () => {
      delete window.addNotification;
    };
  }, []);

  return (
    <NotificationWrapper>
      <NotificationBell 
        $isDarkMode={isDarkMode}
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <BellIcon />
        {notifications.length > 0 && (
          <NotificationBadge>{notifications.length}</NotificationBadge>
        )}
      </NotificationBell>

      <NotificationList 
        $isDarkMode={isDarkMode}
        $show={showNotifications}
      >
        {notifications.length === 0 ? (
          <NotificationItem $isDarkMode={isDarkMode}>
            No notifications
          </NotificationItem>
        ) : (
          <>
            {groupedNotifications.success.length > 0 && (
              <NotificationGroup $isDarkMode={isDarkMode}>
                <NotificationGroupHeader $isDarkMode={isDarkMode} type="success">
                  Success
                  <NotificationGroupCount type="success">
                    {groupedNotifications.success.length}
                  </NotificationGroupCount>
                </NotificationGroupHeader>
                {groupedNotifications.success.map(notification => (
                  <NotificationItem 
                    key={notification.id}
                    $isDarkMode={isDarkMode}
                  >
                    {notification.message}
                  </NotificationItem>
                ))}
              </NotificationGroup>
            )}

            {groupedNotifications.error.length > 0 && (
              <NotificationGroup $isDarkMode={isDarkMode}>
                <NotificationGroupHeader $isDarkMode={isDarkMode} type="error">
                  Unsuccessful
                  <NotificationGroupCount type="error">
                    {groupedNotifications.error.length}
                  </NotificationGroupCount>
                </NotificationGroupHeader>
                {groupedNotifications.error.map(notification => (
                  <NotificationItem 
                    key={notification.id}
                    $isDarkMode={isDarkMode}
                  >
                    {notification.message}
                  </NotificationItem>
                ))}
              </NotificationGroup>
            )}
          </>
        )}
      </NotificationList>

      <NotificationContainer>
        {toasts.map(toast => (
          <Toast 
            key={toast.id}
            type={toast.type}
          >
            {toast.message}
          </Toast>
        ))}
      </NotificationContainer>
    </NotificationWrapper>
  );
};

export default Notification;
