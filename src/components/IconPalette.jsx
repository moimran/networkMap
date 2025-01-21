import React from 'react';
import styled from 'styled-components';
import { useDrag } from 'react-dnd';

const PaletteContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
`;

const IconItem = styled.div`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: move;
  background: white;
  
  img {
    width: 40px;
    height: 40px;
    display: block;
    margin: 0 auto;
  }
  
  &:hover {
    background: #f0f0f0;
  }
`;

const DraggableIcon = ({ icon, type }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'NETWORK_ICON',
    item: { type, icon },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <IconItem ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <img src={icon} alt={type} />
    </IconItem>
  );
};

const IconPalette = () => {
  // We'll load icons from the net_icons folder
  const icons = [
    { type: 'router', icon: '/networkmap/icons/network/Router-2D-Gen-Dark-S.svg' },
    { type: 'switch', icon: '/networkmap/icons/network/Switch-2D-L2-Generic-S.svg' },
    { type: 'firewall', icon: '/networkmap/icons/network/Router-2D-FW-S.svg' },
    { type: 'server', icon: '/networkmap/icons/network/Server-2D-Generic-S.svg' },
    { type: 'cloud', icon: '/networkmap/icons/network/Cloud-2D-Blue-S.svg' },
    { type: 'desktop', icon: '/networkmap/icons/network/PC-2D-Desktop-Generic-S.svg' },
  ];

  return (
    <PaletteContainer>
      {icons.map((icon, index) => (
        <DraggableIcon key={index} {...icon} />
      ))}
    </PaletteContainer>
  );
};

export default IconPalette;
