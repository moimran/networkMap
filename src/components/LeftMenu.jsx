import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDrag } from 'react-dnd';
import { useTheme } from '../context/ThemeContext';

const MenuContainer = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 280px;
  background: ${props => props.$isDarkMode ? '#2d2d2d' : '#f8f9fa'};
  border-right: 1px solid ${props => props.$isDarkMode ? '#404040' : '#e0e0e0'};
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transition: all 0.3s ease;
`;

const ScrollContainer = styled.div`
  overflow-y: auto;
  flex: 1;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.$isDarkMode ? '#1a1a1a' : '#f1f1f1'};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.$isDarkMode ? '#505050' : '#c1c1c1'};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.$isDarkMode ? '#606060' : '#a8a8a8'};
  }
`;

const Section = styled.div`
  border-bottom: 1px solid ${props => props.$isDarkMode ? '#404040' : '#e0e0e0'};
`;

const SectionHeader = styled.div`
  padding: 12px 16px;
  background: ${props => props.$isDarkMode ? '#1a1a1a' : '#f0f0f0'};
  font-weight: 500;
  color: ${props => props.$isDarkMode ? '#ffffff' : '#333'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$isDarkMode ? '#404040' : '#e8e8e8'};
  }
`;

const SectionContent = styled.div`
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  flex-direction: column;
  background: ${props => props.$isDarkMode ? '#2d2d2d' : '#ffffff'};
  padding: ${props => props.$isOpen ? '8px 0' : '0'};
`;

const IconItem = styled.div`
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: grab;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$isDarkMode ? '#404040' : 'rgba(33, 150, 243, 0.1)'};
  }
`;

const IconLabel = styled.div`
  font-size: 13px;
  color: ${props => props.$isDarkMode ? '#ffffff' : '#333'};
  flex: 1;
`;

const ConnectionItem = styled.div`
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  background: ${props => props.selected ? (props.$isDarkMode ? 'rgba(33, 150, 243, 0.1)' : 'rgba(33, 150, 243, 0.1)') : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$isDarkMode ? 'rgba(33, 150, 243, 0.1)' : 'rgba(33, 150, 243, 0.1)'};
  }

  .preview {
    width: 32px;
    height: 2px;
    background: ${props => props.color || '#666'};
    ${props => props.$dashed && 'border-top: 2px dashed;'}
  }

  .label {
    font-size: 13px;
    color: ${props => props.$isDarkMode ? '#ffffff' : '#333'};
    flex: 1;
  }
`;

const DraggableIcon = ({ type, icon, label, category }) => {
  const { isDarkMode } = useTheme();
  const [{ isDragging }, drag] = useDrag({
    type: 'NETWORK_ICON',
    item: { type, icon, label, category },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <IconItem ref={drag} $isDarkMode={isDarkMode} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <div className="icon-wrapper">
        <img src={icon} alt={label} />
      </div>
      <IconLabel $isDarkMode={isDarkMode}>{label}</IconLabel>
    </IconItem>
  );
};

const LeftMenu = ({ networkIcons, onConnectionTypeChange, selectedConnectionType }) => {
  const { isDarkMode } = useTheme();
  const [openSections, setOpenSections] = useState({
    network: true,
    general: false,
    connections: false
  });

  const [icons, setIcons] = useState({
    network: [],
    general: []
  });

  useEffect(() => {
    // Load network icons
    console.log('Fetching network icons...');
    fetch('/networkmap/api/icons/network')
      .then(async response => {
        console.log('Network icons response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
        const text = await response.text();
        console.log('Raw response text:', text);
        return { response, text };
      })
      .then(({ response, text }) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
        }
        const data = JSON.parse(text);
        console.log('Received network icons data:', data);
        const networkIcons = data.map(icon => ({
          type: icon.name.replace('.svg', ''),
          icon: icon.path,
          label: icon.name.replace('.svg', '').split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')
        }));
        console.log('Processed network icons:', networkIcons);
        setIcons(prev => ({ ...prev, network: networkIcons }));
      })
      .catch(error => {
        console.error('Error loading network icons:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      });

    // Load general icons
    console.log('Fetching general icons...');
    fetch('/networkmap/api/icons/general')
      .then(async response => {
        console.log('General icons response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
        const text = await response.text();
        console.log('Raw response text:', text);
        return { response, text };
      })
      .then(({ response, text }) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
        }
        const data = JSON.parse(text);
        console.log('Received general icons data:', data);
        const generalIcons = data.map(icon => ({
          type: icon.name.replace('.svg', ''),
          icon: icon.path,
          label: icon.name.replace('.svg', '').split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')
        }));
        console.log('Processed general icons:', generalIcons);
        setIcons(prev => ({ ...prev, general: generalIcons }));
      })
      .catch(error => {
        console.error('Error loading general icons:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      });
  }, []);

  const connectionTypes = [
    { id: 'solid', label: 'Solid Line', color: '#666', $dashed: false },
    { id: 'dashed', label: 'Dashed Line', color: '#666', $dashed: true },
    { id: 'blue', label: 'Blue Line', color: '#2196f3', $dashed: false },
    { id: 'red', label: 'Red Line', color: '#f44336', $dashed: false },
    { id: 'green', label: 'Green Line', color: '#4caf50', $dashed: false },
    { id: 'orange', label: 'Orange Line', color: '#ff9800', $dashed: false }
  ];

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const categories = Object.keys(icons);

  return (
    <MenuContainer $isDarkMode={isDarkMode}>
      <ScrollContainer $isDarkMode={isDarkMode}>
        {categories.map(category => (
          <Section key={category} $isDarkMode={isDarkMode}>
            <SectionHeader 
              $isDarkMode={isDarkMode}
              onClick={() => toggleSection(category)}
            >
              {category}
              <span>{openSections[category] ? '▼' : '▶'}</span>
            </SectionHeader>
            <SectionContent $isOpen={openSections[category]} $isDarkMode={isDarkMode}>
              {icons[category].map((item, index) => (
                <DraggableIcon
                  key={index}
                  type={item.type}
                  icon={item.icon}
                  label={item.label}
                  category={category}
                />
              ))}
            </SectionContent>
          </Section>
        ))}
        <Section $isDarkMode={isDarkMode}>
          <SectionHeader 
            $isDarkMode={isDarkMode}
            onClick={() => toggleSection('connections')}
          >
            Connection Types
            <span>{openSections.connections ? '▼' : '▶'}</span>
          </SectionHeader>
          <SectionContent $isOpen={openSections.connections} $isDarkMode={isDarkMode}>
            {connectionTypes.map((conn) => (
              <ConnectionItem
                key={conn.id}
                selected={selectedConnectionType === conn.id}
                onClick={() => onConnectionTypeChange(conn.id)}
                color={conn.color}
                $dashed={conn.$dashed}
                $isDarkMode={isDarkMode}
              >
                <div className="preview" />
                <div className="label">{conn.label}</div>
              </ConnectionItem>
            ))}
          </SectionContent>
        </Section>
      </ScrollContainer>
    </MenuContainer>
  );
};

export default LeftMenu;
