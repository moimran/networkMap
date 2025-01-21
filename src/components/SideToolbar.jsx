import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../context/ThemeContext';

const ToolbarContainer = styled.div`
  position: fixed;
  right: ${props => props.$isOpen ? '0' : '-240px'};
  top: 50%;
  transform: translateY(-50%);
  width: 280px;
  background: ${props => props.$isDarkMode ? '#2d2d2d' : '#ffffff'};
  box-shadow: -2px 0 8px ${props => props.$isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'};
  transition: all 0.3s ease-in-out;
  border-radius: 8px 0 0 8px;
  border: 1px solid ${props => props.$isDarkMode ? '#404040' : '#e0e0e0'};
  z-index: 1000;
  display: flex;

  &:hover {
    right: 0;
  }
`;

const ToolbarTab = styled.div`
  position: absolute;
  left: 0;
  top: 50%;
  transform: translate(-100%, -50%);
  background: ${props => props.$isDarkMode ? '#2d2d2d' : '#ffffff'};
  padding: 12px 8px;
  border-radius: 8px 0 0 8px;
  box-shadow: -2px 0 8px ${props => props.$isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'};
  border: 1px solid ${props => props.$isDarkMode ? '#404040' : '#e0e0e0'};
  border-right: none;
  display: flex;
  align-items: center;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  user-select: none;
  color: ${props => props.$isDarkMode ? '#ffffff' : '#666'};
  font-size: 14px;
  transition: all 0.3s ease;
`;

const ToolbarContent = styled.div`
  padding: 20px;
  width: 100%;
  color: ${props => props.$isDarkMode ? '#ffffff' : '#000000'};
`;

const ToolbarSection = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  label {
    color: ${props => props.$isDarkMode ? '#ffffff' : '#666'};
  }
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: ${props => props.$isDarkMode ? '#ffffff' : '#333'};
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  margin-right: 8px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${props => props.$isDarkMode ? '#404040' : '#ccc'};
    transition: 0.3s;
    border-radius: 20px;

    &:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }
  }

  input:checked + span {
    background-color: #4CAF50;
  }

  input:checked + span:before {
    transform: translateX(20px);
  }
`;

const SideToolbar = ({ showInterfaceLabels, onToggleInterfaceLabels }) => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <ToolbarContainer $isOpen={isOpen} $isDarkMode={isDarkMode}>
      <ToolbarTab $isDarkMode={isDarkMode}>Settings</ToolbarTab>
      <ToolbarContent $isDarkMode={isDarkMode}>
        <ToolbarSection $isDarkMode={isDarkMode}>
          <SectionTitle $isDarkMode={isDarkMode}>Interface Labels</SectionTitle>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ToggleSwitch $isDarkMode={isDarkMode}>
              <input
                type="checkbox"
                checked={showInterfaceLabels}
                onChange={onToggleInterfaceLabels}
              />
              <span></span>
            </ToggleSwitch>
            <span>Show Interface Labels</span>
          </div>
        </ToolbarSection>
      </ToolbarContent>
    </ToolbarContainer>
  );
};

export default SideToolbar;
