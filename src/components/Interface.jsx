import React from 'react';
import styled from 'styled-components';

const InterfacePoint = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: #666;
  border-radius: 50%;
  cursor: pointer;
  
  &:hover {
    background-color: #999;
  }

  ${({ position }) => {
    switch (position) {
      case 'left':
        return 'left: -5px; top: 50%; transform: translateY(-50%);';
      case 'right':
        return 'right: -5px; top: 50%; transform: translateY(-50%);';
      case 'top':
        return 'top: -5px; left: 50%; transform: translateX(-50%);';
      case 'bottom':
        return 'bottom: -5px; left: 50%; transform: translateX(-50%);';
      default:
        return '';
    }
  }}
`;

const InterfaceLabel = styled.span`
  position: absolute;
  font-size: 10px;
  white-space: nowrap;
  ${({ position }) => {
    switch (position) {
      case 'left':
        return 'left: -80px; top: 50%; transform: translateY(-50%);';
      case 'right':
        return 'right: -80px; top: 50%; transform: translateY(-50%);';
      case 'top':
        return 'top: -20px; left: 50%; transform: translateX(-50%);';
      case 'bottom':
        return 'bottom: -20px; left: 50%; transform: translateX(-50%);';
      default:
        return '';
    }
  }}
`;

const Interface = ({ name, position, onConnect }) => {
  return (
    <>
      <InterfacePoint
        position={position}
        onClick={() => onConnect(name)}
        title={name}
      />
      <InterfaceLabel position={position}>{name}</InterfaceLabel>
    </>
  );
};

export default Interface;
