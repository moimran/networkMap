import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDrag } from "react-dnd";
import { useTheme } from "../context/ThemeContext";

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

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 12px;
  padding: 0 16px;
`;

const ColorBox = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background-color: ${props => props.$color};
  border: 2px solid ${props => props.$selected ? '#000' : 'transparent'};
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

const SubTitle = styled.h4`
  margin: 16px 0 8px;
  padding: 0 16px;
  color: ${props => props.$isDarkMode ? '#fff' : '#333'};
`;

const ConnectionPreview = styled.div`
  width: 40px;
  height: 30px;
  position: relative;
  margin-right: 8px;

  &:before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 2px;
    background-color: ${props => props.$isDarkMode ? '#fff' : '#333'};
    ${props => {
      switch(props.$type) {
        case 'dashed':
          return 'border-top: 2px dashed currentColor;background: none;';
        case 'dotted':
          return 'border-top: 2px dotted currentColor;background: none;';
        case 'curved':
          return `
            background: none;
            &:before {
              content: '';
              position: absolute;
              top: -15px;
              left: 0;
              right: 0;
              height: 30px;
              border: 2px solid currentColor;
              border-color: transparent transparent currentColor transparent;
              border-radius: 0 0 20px 20px;
            }
          `;
        case 'angled':
          return `
            background: none;
            &:before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 15px;
              border-left: 2px solid currentColor;
              border-bottom: 2px solid currentColor;
            }
          `;
        default:
          return '';
      }
    }}
  }
`;

const connectionTypes = [
  { id: 'solid', label: 'Solid Line' },
  { id: 'dashed', label: 'Dashed Line' },
  { id: 'dotted', label: 'Dotted Line' },
  { id: 'curved', label: 'Curved Line' },
  { id: 'angled', label: 'Angled Line' }
];

const connectionColors = [
  '#666666', // Gray
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#FFC107', // Yellow
  '#9C27B0', // Purple
  '#F44336'  // Red
];

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

const LeftMenu = ({
  onConnectionTypeChange,
  selectedConnectionType,
  selectedColors,
  onConnectionColorsChange,
  isDarkMode
}) => {
  const [openSections, setOpenSections] = useState({
    network: false,
    general: false,
    connections: true
  });

  const [icons, setIcons] = useState({
    network: [],
    general: []
  });

  useEffect(() => {
    // Load network icons
    console.log('Loading network icons...');
    fetch('/networkmap/api/icons/network')
      .then(async response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Received network icons:', data);
        const networkIcons = data.map(icon => ({
          type: icon.name.replace('.svg', ''),
          icon: icon.path,
          label: icon.name.replace('.svg', '').split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
          category: 'network'
        }));
        setIcons(prev => ({ ...prev, network: networkIcons }));
      })
      .catch(error => {
        console.error('Error loading network icons:', error);
      });

    // Load general icons
    console.log('Loading general icons...');
    fetch('/networkmap/api/icons/general')
      .then(async response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Received general icons:', data);
        const generalIcons = data.map(icon => ({
          type: icon.name.replace('.svg', ''),
          icon: icon.path,
          label: icon.name.replace('.svg', '').split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
          category: 'general'
        }));
        setIcons(prev => ({ ...prev, general: generalIcons }));
      })
      .catch(error => {
        console.error('Error loading general icons:', error);
      });
  }, []);

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
            Connection Settings
            <span>{openSections.connections ? '▼' : '▶'}</span>
          </SectionHeader>
          <SectionContent $isOpen={openSections.connections} $isDarkMode={isDarkMode}>
            <div>
              <SubTitle $isDarkMode={isDarkMode}>Connection Types</SubTitle>
              {connectionTypes.map((type) => (
                <ConnectionItem
                  key={type.id}
                  $selected={selectedConnectionType === type.id}
                  $isDarkMode={isDarkMode}
                  onClick={() => onConnectionTypeChange(type.id)}
                >
                  <ConnectionPreview $type={type.id} $isDarkMode={isDarkMode} />
                  <span>{type.label}</span>
                </ConnectionItem>
              ))}
            </div>
            <div>
              <SubTitle $isDarkMode={isDarkMode}>Connection Colors</SubTitle>
              <ColorGrid>
                {connectionColors.map(color => (
                  <ColorBox
                    key={color}
                    $color={color}
                    $selected={selectedColors.includes(color)}
                    onClick={() => {
                      const newColors = selectedColors.includes(color)
                        ? selectedColors.filter(c => c !== color)
                        : [...selectedColors, color];
                      onConnectionColorsChange(newColors);
                    }}
                  />
                ))}
              </ColorGrid>
            </div>
          </SectionContent>
        </Section>
      </ScrollContainer>
    </MenuContainer>
  );
};

export default LeftMenu;
