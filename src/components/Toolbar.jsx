import React, { useState, useCallback, useEffect } from 'react';
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

const ThemeSelect = styled.select`
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid ${props => props.$isDarkMode ? '#404040' : '#d0d0d0'};
  background: ${props => props.$isDarkMode 
    ? 'linear-gradient(180deg, #3d3d3d 0%, #2d2d2d 100%)'
    : 'linear-gradient(180deg, #FFFFFF 0%, #F3F3F3 100%)'};
  color: ${props => props.$isDarkMode ? '#ffffff' : '#333333'};
  font-size: 14px;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${props => props.$isDarkMode ? '#505050' : '#b0b0b0'};
  }

  option {
    background: ${props => props.$isDarkMode ? '#2d2d2d' : '#ffffff'};
    color: ${props => props.$isDarkMode ? '#ffffff' : '#333333'};
  }
`;

const ThemeLabel = styled.span`
  color: ${props => props.$isDarkMode ? '#ffffff' : '#333333'};
  font-size: 14px;
  margin-right: 8px;
`;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 16px;
`;

const SliderLabel = styled.span`
  color: ${props => props.$isDarkMode ? '#ffffff' : '#333333'};
  font-size: 14px;
`;

const Slider = styled.input`
  width: 100px;
  height: 4px;
  -webkit-appearance: none;
  background: ${props => props.$isDarkMode ? '#404040' : '#d0d0d0'};
  border-radius: 2px;
  outline: none;
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => props.$isDarkMode ? '#2196f3' : '#1976d2'};
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => props.$isDarkMode ? '#2196f3' : '#1976d2'};
    cursor: pointer;
    border: none;
  }
`;

const SliderValue = styled.span`
  color: ${props => props.$isDarkMode ? '#ffffff' : '#333333'};
  font-size: 14px;
  min-width: 36px;
`;

const ToolButton = styled.button`
  padding: 8px;
  background: ${props => props.active ? 
    (props.$isDarkMode ? '#2196f3' : '#1976d2') : 
    'transparent'
  };
  border: 1px solid ${props => props.$isDarkMode ? '#404040' : '#d0d0d0'};
  border-radius: 4px;
  color: ${props => {
    if (props.active) return '#ffffff';
    return props.$isDarkMode ? '#ffffff' : '#333333';
  }};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? 
      (props.$isDarkMode ? '#1976d2' : '#1565c0') : 
      (props.$isDarkMode ? '#404040' : '#e0e0e0')
    };
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const PointerIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.64,21.97C13.14,22.21 12.54,22 12.31,21.5L10.13,16.76L7.62,18.78C7.45,18.92 7.24,19 7,19A1,1 0 0,1 6,18V3A1,1 0 0,1 7,2C7.24,2 7.47,2.09 7.64,2.23L7.65,2.22L19.14,11.86C19.57,12.22 19.62,12.85 19.27,13.27C19.12,13.45 18.91,13.57 18.7,13.61L15.54,14.23L17.74,18.96C18,19.46 17.76,20.05 17.26,20.28L13.64,21.97Z" />
  </svg>
);

const HandIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.58,19H14.58V22H6.58V19M19.74,11.6C19.55,11.4 19.29,11.28 19,11.28L18.78,11.31L15.58,13V11.83L16.09,2.9C16.12,2.35 15.7,1.87 15.15,1.84C14.6,1.81 14.12,2.23 14.09,2.78L13.82,7.47H13.58L12.54,7.58V2A1,1 0 0,0 11.54,1C11,1 10.54,1.45 10.54,2V8.41L9.72,8.78L9.03,3.32C8.96,2.77 8.46,2.38 7.91,2.45C7.36,2.5 6.97,3 7.04,3.57L7.81,9.63L7.43,9.8C7.3,9.85 7.18,9.93 7.07,10L5.97,6.11C5.81,5.54 5.25,5.2 4.71,5.34C4.18,5.5 3.88,6.08 4.04,6.65L6.61,15.77C6.61,15.8 6.63,15.84 6.64,15.87L6.67,16H6.68C6.9,16.57 7.47,17 8.08,17H14.58C14.97,17 15.32,16.84 15.58,16.57L20.5,12.37L19.74,11.6Z" />
  </svg>
);

const canvasThemes = [
  { id: 'none', name: 'No Grid' },
  { id: 'dots', name: 'Dots' },
  { id: 'lines', name: 'Lines' },
  { id: 'grid', name: 'Grid' }
];

const Toolbar = ({ 
  children, 
  onCanvasThemeChange, 
  selectedCanvasTheme = 'none', 
  onScaleChange, 
  scale = 1,
  onToolChange,
  selectedTool = 'pointer'
}) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <ToolbarContainer $isDarkMode={isDarkMode}>
      <ButtonGroup $isDarkMode={isDarkMode}>
        <ToolButton
          $isDarkMode={isDarkMode}
          active={selectedTool === 'pointer'}
          onClick={() => onToolChange('pointer')}
          title="Pointer Tool (V)"
        >
          <PointerIcon />
        </ToolButton>
        <ToolButton
          $isDarkMode={isDarkMode}
          active={selectedTool === 'hand'}
          onClick={() => onToolChange('hand')}
          title="Hand Tool (H)"
        >
          <HandIcon />
        </ToolButton>
      </ButtonGroup>
      <ButtonGroup $isDarkMode={isDarkMode}>
        <ThemeLabel $isDarkMode={isDarkMode}>Background:</ThemeLabel>
        <ThemeSelect 
          $isDarkMode={isDarkMode}
          value={selectedCanvasTheme}
          onChange={(e) => onCanvasThemeChange(e.target.value)}
        >
          {canvasThemes.map(theme => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </ThemeSelect>
      </ButtonGroup>
      <ButtonGroup $isDarkMode={isDarkMode}>
        {children}
      </ButtonGroup>
      <SliderContainer>
        <SliderLabel $isDarkMode={isDarkMode}>Canvas Size:</SliderLabel>
        <Slider
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={scale}
          onChange={(e) => onScaleChange(parseFloat(e.target.value))}
          $isDarkMode={isDarkMode}
        />
        <SliderValue $isDarkMode={isDarkMode}>
          {Math.round((1 / scale) * 100)}%
        </SliderValue>
      </SliderContainer>
      <RightIconsContainer>
        <IconButton
          onClick={toggleTheme}
          $isDarkMode={isDarkMode}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <SunIcon /> : <MoonIcon />}
        </IconButton>
        <div data-testid="notification-wrapper">
          <Notification />
        </div>
      </RightIconsContainer>
    </ToolbarContainer>
  );
};

export default Toolbar;
