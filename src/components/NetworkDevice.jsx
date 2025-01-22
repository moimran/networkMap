import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDrag } from 'react-dnd';

// Styled component for the device container
const DeviceContainer = styled.div`
  position: absolute;
  cursor: move;
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: ${props => `translate(${props.x}px, ${props.y}px)`};
`;

// Styled component for the icon container
const IconContainer = styled.div`
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: context-menu;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
`;

// Styled component for the device menu
const DeviceMenu = styled.div`
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  padding: 5px 0;
  z-index: 1000;
  min-width: 120px;
`;

const MenuItem = styled.div`
  padding: 8px 15px;
  cursor: pointer;
  font-size: 14px;
  color: ${props => props.$isDelete ? '#ff4444' : '#333'};
  
  &:hover {
    background-color: ${props => props.$isDelete ? '#ffebeb' : '#f0f0f0'};
  }
`;

// NetworkDevice component handles the rendering and behavior of network devices in the diagram
// Props:
// - id: Unique identifier for the device (e.g., "device-123")
// - type: Type of the device (e.g., "router", "switch")
// - icon: Path to the device's SVG icon (e.g., "/images/devices/Router-2D-Gen-Dark-S.svg")
// - x, y: Position coordinates in the diagram
// - onDrag: Callback for device dragging
// - onDragStop: Callback for when dragging ends
// - onInterfaceSelect: Callback for interface selection from context menu
// - onDelete: Callback for deleting the device
// - showInterfaceLabels: Whether to display interface labels
const NetworkDevice = ({ 
  id, 
  type, 
  icon, 
  x, 
  y, 
  onDrag, 
  onDragStop, 
  onInterfaceSelect, 
  onDelete, 
  showInterfaceLabels,
  $isDarkMode,
  canvasScale = 1
}) => {
  // Reference to the device DOM element for drag handling
  const ref = useRef(null);
  
  // State to store the device's network interfaces loaded from config
  // Example: [{ name: "GigabitEthernet0/0", type: "ethernet", position: "left" }]
  const [interfaces, setInterfaces] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  
  // Setup drag behavior using react-dnd
  // When dragging starts, it provides the device id and type to the drag source
  const [{ isDragging }, drag] = useDrag({
    type: 'DEVICE',
    item: { id, type, x, y },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Effect to handle clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Effect to load interface configuration when the device icon changes
  useEffect(() => {
    // Log the full icon path for debugging
    // Example: "/images/devices/Router-2D-Gen-Dark-S.svg"
    console.log('Processing icon:', icon);
    
    // Extract the SVG filename from the path
    // Example: icon = "/images/devices/Router-2D-Gen-Dark-S.svg"
    // icon.split('/') = ["", "images", "devices", "Router-2D-Gen-Dark-S.svg"]
    // .pop() gets "Router-2D-Gen-Dark-S.svg"
    const svgMatch = icon.split('/').pop();
    
    if (svgMatch) {
      // Log the extracted filename
      // Example: "Router-2D-Gen-Dark-S.svg"
      console.log('Extracted SVG filename:', svgMatch);
      
      // Convert SVG filename to JSON config filename
      // Example: "Router-2D-Gen-Dark-S.svg" -> "Router-2D-Gen-Dark-S.json"
      let configName = svgMatch.replace('.svg', '.json');
      
      if (configName) {
        // Log the config file we're attempting to load
        console.log('Loading interfaces from:', configName);
        
        // Fetch interface configuration from public/configs directory
        // Example: fetch("/networkmap/configs/Router-2D-Gen-Dark-S.json")
        fetch(`/networkmap/configs/${configName}`)
          .then(response => response.json())
          .then(data => {
            // Log the loaded interface configuration
            // Example data.interfaces:
            // [
            //   { name: "GigabitEthernet0/0", type: "ethernet", position: "left" },
            //   { name: "GigabitEthernet0/1", type: "ethernet", position: "right" }
            // ]
            console.log('Loaded interfaces:', data.interfaces);
            setInterfaces(data.interfaces);
          })
          .catch(error => console.error('Error loading interfaces:', error));
      } else {
        console.log('No matching config file found for SVG');
      }
    } else {
      console.log('Could not extract SVG filename from icon path');
    }
  }, [icon]);

  // Handle right-click to show interface context menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Context menu triggered for device:', id);
    
    // Calculate position for context menu relative to diagram container
    // This ensures the menu appears next to the device regardless of scroll position
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = document.getElementById('diagram-container').getBoundingClientRect();
    const x = rect.left - containerRect.left + rect.width;
    const y = rect.top - containerRect.top;

    onInterfaceSelect(id, interfaces || [], x, y);
  };

  // Handle mouse down event for dragging
  const handleMouseDown = (e) => {
    if (e.button === 2) return; // Skip for right-click
    e.stopPropagation();
    
    // Get container rect once at start
    const containerRect = document.getElementById('diagram-container').getBoundingClientRect();
    
    // Calculate initial mouse position relative to container and scale
    const startMouseX = (e.clientX - containerRect.left) / canvasScale;
    const startMouseY = (e.clientY - containerRect.top) / canvasScale;
    
    // Store initial device position
    const startDeviceX = x;
    const startDeviceY = y;
    
    console.log('Drag Start:', {
      mouseX: startMouseX,
      mouseY: startMouseY,
      deviceX: startDeviceX,
      deviceY: startDeviceY,
      scale: canvasScale
    });
    
    // Handle mouse movement during drag
    const handleMouseMove = (moveEvent) => {
      // Calculate current mouse position relative to container and scale
      const currentMouseX = (moveEvent.clientX - containerRect.left) / canvasScale;
      const currentMouseY = (moveEvent.clientY - containerRect.top) / canvasScale;
      
      // Calculate delta from initial positions
      const deltaX = currentMouseX - startMouseX;
      const deltaY = currentMouseY - startMouseY;
      
      // Apply delta to initial device position
      const newX = startDeviceX + deltaX;
      const newY = startDeviceY + deltaY;

      console.log('Drag Move:', {
        mouseX: currentMouseX,
        mouseY: currentMouseY,
        deltaX,
        deltaY,
        newX,
        newY,
        scale: canvasScale
      });

      onDrag(id, newX, newY);
    };
    
    // Handle mouse up to end dragging
    const handleMouseUp = (upEvent) => {
      // Calculate final mouse position relative to container and scale
      const finalMouseX = (upEvent.clientX - containerRect.left) / canvasScale;
      const finalMouseY = (upEvent.clientY - containerRect.top) / canvasScale;
      
      // Calculate final delta and position
      const deltaX = finalMouseX - startMouseX;
      const deltaY = finalMouseY - startMouseY;
      const finalX = startDeviceX + deltaX;
      const finalY = startDeviceY + deltaY;

      console.log('Drag End:', {
        mouseX: finalMouseX,
        mouseY: finalMouseY,
        deltaX,
        deltaY,
        finalX,
        finalY,
        scale: canvasScale
      });

      onDragStop(id, finalX, finalY);
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Render the NetworkDevice component
  return (
    <DeviceContainer
      ref={drag(ref)}
      x={x}
      y={y}
      style={{
        opacity: isDragging ? 0.5 : 1,
        transform: `translate(${x}px, ${y}px)`,
      }}
      onMouseDown={handleMouseDown}
    >
      <IconContainer>
        <img src={icon} alt={type} onContextMenu={handleContextMenu} />
      </IconContainer>
    </DeviceContainer>
  );
};

export default NetworkDevice;
