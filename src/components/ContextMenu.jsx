import React from 'react';
import styled from 'styled-components';

const MenuContainer = styled.div`
  position: fixed;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  padding: 5px 0;
  z-index: 1000;
`;

const MenuItem = styled.div`
  padding: 8px 15px;
  cursor: ${props => props.$isUsed ? 'not-allowed' : 'pointer'};
  font-size: 14px;
  color: ${props => {
    if (props.$isDelete) return '#ff4444';
    if (props.$isUsed) return '#999';
    return 'inherit';
  }};
  background-color: ${props => props.$isUsed ? '#f5f5f5' : 'transparent'};
  
  &:hover {
    background-color: ${props => {
      if (props.$isDelete) return '#ffebeb';
      if (props.$isUsed) return '#f5f5f5';
      return '#f0f0f0';
    }};
  }
`;

const MenuTitle = styled.div`
  padding: 8px 15px;
  font-weight: bold;
  border-bottom: 1px solid #eee;
  color: #666;
`;

const Divider = styled.div`
  height: 1px;
  background-color: #eee;
  margin: 5px 0;
`;

const ContextMenu = ({ x, y, interfaces, usedInterfaces = [], onSelect, onClose, onDelete }) => {
  return (
    <MenuContainer style={{ left: x, top: y }} className="context-menu">
      {interfaces && interfaces.length > 0 && (
        <>
          <MenuTitle>Select Interface</MenuTitle>
          {interfaces.map((iface, index) => {
            // Check if this interface is already used in a connection
            const isUsed = usedInterfaces.includes(iface.name);
            return (
              <MenuItem
                key={index}
                $isUsed={isUsed}
                onClick={() => {
                  if (!isUsed) {
                    onSelect(iface);
                    onClose();
                  }
                }}
              >
                {iface.name} {isUsed ? '(in use)' : ''}
              </MenuItem>
            );
          })}
          <Divider />
        </>
      )}
      <MenuItem 
        $isDelete 
        onClick={() => {
          onDelete();
          onClose();
        }}
      >
        Delete Device
      </MenuItem>
    </MenuContainer>
  );
};

export default ContextMenu;
