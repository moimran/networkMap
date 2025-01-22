import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  display: inline-block;
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
  top: 100%;
  right: 0;
  width: 300px;
  max-height: 400px;
  overflow-y: auto;
  background: ${props => props.$isDarkMode ? '#2d2d2d' : '#ffffff'};
  border: 1px solid ${props => props.$isDarkMode ? '#404040' : '#e0e0e0'};
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-top: 8px;
  display: ${props => props.$show ? 'block' : 'none'};
  z-index: 1200;
`;

const NotificationGroup = styled.div`
  border-bottom: 1px solid ${props => props.$isDarkMode ? '#404040' : '#e0e0e0'};
  
  &:last-child {
    border-bottom: none;
  }
`;

const NotificationGroupHeader = styled.div`
  padding: 8px 16px;
  font-weight: 600;
  background: ${props => props.$isDarkMode ? '#3d3d3d' : '#f5f5f5'};
  color: ${props => {
    if (props.$type === 'error') return '#dc3545';
    if (props.$type === 'success') return '#28a745';
    return props.$isDarkMode ? '#ffffff' : '#333333';
  }};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NotificationGroupCount = styled.span`
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
  background: ${props => {
    if (props.$type === 'error') return '#dc3545';
    if (props.$type === 'success') return '#28a745';
    return props.$isDarkMode ? '#4d4d4d' : '#e0e0e0';
  }};
  color: #ffffff;
`;

const NotificationItem = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid ${props => props.$isDarkMode ? '#404040' : '#e0e0e0'};
  color: ${props => {
    if (props.$type === 'error') return '#dc3545';
    if (props.$type === 'success') return '#28a745';
    return props.$isDarkMode ? '#ffffff' : '#333333';
  }};
  
  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${props => props.$isDarkMode ? '#3d3d3d' : '#f5f5f5'};
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

const ToastContainer = styled.div`
  position: fixed;
  top: 60px;
  right: 20px;
  z-index: 1100;
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
  const idCounterRef = useRef(0);
  const randomRef = useRef(Math.random().toString(36).substr(2, 9));

  const generateUniqueId = useCallback((prefix) => {
    idCounterRef.current += 1;
    return `${prefix}_${Date.now()}_${idCounterRef.current}_${randomRef.current}`;
  }, []);

  const groupedNotifications = useMemo(() => {
    const successNotifications = notifications.filter(n => n.type === 'success');
    const errorNotifications = notifications.filter(n => n.type === 'error');
    const infoNotifications = notifications.filter(n => n.type === 'info');
    return {
      success: successNotifications,
      error: errorNotifications,
      info: infoNotifications
    };
  }, [notifications]);

  const handleBellClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowNotifications(prev => !prev);
  };

  const handleClickOutside = useCallback((event) => {
    if (showNotifications && !event.target.closest('[data-testid="notification-component"]')) {
      setShowNotifications(false);
    }
  }, [showNotifications]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const addNotification = useCallback((message, type = 'info') => {
    const notificationId = generateUniqueId('notification');
    const toastId = generateUniqueId('toast');

    const newNotification = {
      id: notificationId,
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    const newToast = { 
      ...newNotification,
      id: toastId
    };
    setToasts(prev => [newToast, ...prev]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, 2000);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }, 5 * 60 * 1000);
  }, [generateUniqueId]);

  useEffect(() => {
    window.addNotification = addNotification;
    return () => {
      delete window.addNotification;
    };
  }, [addNotification]);

  return (
    <NotificationWrapper data-testid="notification-component">
      <NotificationBell 
        $isDarkMode={isDarkMode}
        onClick={handleBellClick}
        data-testid="notification-bell"
      >
        <BellIcon />
        {notifications.length > 0 && (
          <NotificationBadge>{notifications.length}</NotificationBadge>
        )}
      </NotificationBell>

      <NotificationList 
        $isDarkMode={isDarkMode}
        $show={showNotifications}
        data-testid="notification-list"
      >
        {notifications.length === 0 ? (
          <NotificationItem $isDarkMode={isDarkMode}>
            No notifications
          </NotificationItem>
        ) : (
          <>
            {groupedNotifications.error.length > 0 && (
              <NotificationGroup $isDarkMode={isDarkMode}>
                <NotificationGroupHeader $isDarkMode={isDarkMode} $type="error">
                  Errors
                  <NotificationGroupCount $type="error">
                    {groupedNotifications.error.length}
                  </NotificationGroupCount>
                </NotificationGroupHeader>
                {groupedNotifications.error.map(notification => (
                  <NotificationItem 
                    key={notification.id}
                    $isDarkMode={isDarkMode}
                    $type="error"
                  >
                    {notification.message}
                  </NotificationItem>
                ))}
              </NotificationGroup>
            )}

            {groupedNotifications.success.length > 0 && (
              <NotificationGroup $isDarkMode={isDarkMode}>
                <NotificationGroupHeader $isDarkMode={isDarkMode} $type="success">
                  Success
                  <NotificationGroupCount $type="success">
                    {groupedNotifications.success.length}
                  </NotificationGroupCount>
                </NotificationGroupHeader>
                {groupedNotifications.success.map(notification => (
                  <NotificationItem 
                    key={notification.id}
                    $isDarkMode={isDarkMode}
                    $type="success"
                  >
                    {notification.message}
                  </NotificationItem>
                ))}
              </NotificationGroup>
            )}

            {groupedNotifications.info.length > 0 && (
              <NotificationGroup $isDarkMode={isDarkMode}>
                <NotificationGroupHeader $isDarkMode={isDarkMode}>
                  Information
                  <NotificationGroupCount>
                    {groupedNotifications.info.length}
                  </NotificationGroupCount>
                </NotificationGroupHeader>
                {groupedNotifications.info.map(notification => (
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

      <ToastContainer>
        {toasts.map(toast => (
          <Toast key={toast.id} type={toast.type}>
            {toast.message}
          </Toast>
        ))}
      </ToastContainer>
    </NotificationWrapper>
  );
};

export default Notification;
