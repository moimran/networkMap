import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../context/ThemeContext';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const ModalContent = styled.div`
  background: ${props => props.isDarkMode ? '#2d2d2d' : '#ffffff'};
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 400px;
  max-width: 90%;
  color: ${props => props.isDarkMode ? '#ffffff' : '#333333'};
  border: 1px solid ${props => props.isDarkMode ? '#404040' : '#e0e0e0'};
`;

const Title = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 500;
`;

const Message = styled.p`
  margin: 0 0 24px 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${props => props.isDarkMode ? '#cccccc' : '#666666'};
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${props => props.isDarkMode ? '#404040' : '#d0d0d0'};
  
  ${props => props.primary ? `
    background: ${props.isDarkMode ? '#2d5bb9' : '#4a90e2'};
    color: white;
    border-color: ${props.isDarkMode ? '#2d5bb9' : '#4a90e2'};
    
    &:hover {
      background: ${props.isDarkMode ? '#3d6bc9' : '#357abd'};
    }
  ` : `
    background: ${props.isDarkMode ? '#3d3d3d' : '#ffffff'};
    color: ${props.isDarkMode ? '#ffffff' : '#333333'};
    
    &:hover {
      background: ${props.isDarkMode ? '#4d4d4d' : '#f5f5f5'};
    }
  `}
`;

const Modal = ({ title, message, onConfirm, onCancel, onSave, showSaveOption }) => {
  const { isDarkMode } = useTheme();

  return (
    <ModalOverlay>
      <ModalContent isDarkMode={isDarkMode}>
        <Title>{title}</Title>
        <Message isDarkMode={isDarkMode}>{message}</Message>
        <ButtonGroup>
          <Button isDarkMode={isDarkMode} onClick={onCancel}>
            Cancel
          </Button>
          {showSaveOption && (
            <Button isDarkMode={isDarkMode} primary onClick={onSave}>
              Save
            </Button>
          )}
          <Button isDarkMode={isDarkMode} primary onClick={onConfirm}>
            {showSaveOption ? "Don't Save" : "Confirm"}
          </Button>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal;
