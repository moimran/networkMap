import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useTheme } from '../context/ThemeContext';
import Notification from './Notification';

const ToolbarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 280px;
  right: 0;
  background: ${props => props.$isDarkMode ? '#2d2d2d' : '#f3f3f3'};
  border-bottom: 1px solid ${props => props.$isDarkMode ? '#404040' : '#e0e0e0'};
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 4px ${props => props.$isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'};
  z-index: 1000;
  transition: all 0.3s ease;
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  position: relative;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: -8px;
    top: 4px;
    bottom: 4px;
    width: 1px;
    background: ${props => props.$isDarkMode ? '#404040' : '#e0e0e0'};
  }
`;

const IconButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${props => props.$isDarkMode ? '#404040' : '#d0d0d0'};
  border-radius: 4px;
  background: ${props => props.$isDarkMode 
    ? 'linear-gradient(180deg, #3d3d3d 0%, #2d2d2d 100%)'
    : 'linear-gradient(180deg, #FFFFFF 0%, #F3F3F3 100%)'};
  color: ${props => props.$isDarkMode ? '#ffffff' : '#333333'};
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
  margin-left: auto;

  &:hover {
    background: ${props => props.$isDarkMode 
      ? 'linear-gradient(180deg, #4d4d4d 0%, #3d3d3d 100%)'
      : 'linear-gradient(180deg, #F3F3F3 0%, #E3E3E3 100%)'};
  }

  svg {
    width: 18px;
    height: 18px;
    transition: transform 0.3s ease;
    fill: currentColor;
  }

  &:hover svg {
    transform: ${props => props.$rotate ? 'rotate(360deg)' : 'none'};
  }
`;

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z"/>
  </svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM11 1h2v3h-2V1zm0 19h2v3h-2v-3zM3.515 4.929l1.414-1.414L7.05 5.636 5.636 7.05 3.515 4.93zM16.95 18.364l1.414-1.414 2.121 2.121-1.414 1.414-2.121-2.121zm2.121-14.85l1.414 1.415-2.121 2.121-1.414-1.414 2.121-2.121zM5.636 16.95l1.414 1.414-2.121 2.121-1.414-1.414 2.121-2.121zM23 11v2h-3v-2h3zM4 11v2H1v-2h3z"/>
  </svg>
);

const RightIconsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
`;

const Toolbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <ToolbarContainer $isDarkMode={isDarkMode}>      
      <RightIconsContainer>
        <IconButton 
          $isDarkMode={isDarkMode} 
          onClick={toggleTheme}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          $rotate
        >
          {isDarkMode ? <SunIcon /> : <MoonIcon />}
        </IconButton>

        <Notification />
      </RightIconsContainer>
    </ToolbarContainer>
  );
};

export default Toolbar;
