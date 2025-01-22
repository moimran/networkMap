import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useDrop } from 'react-dnd';
import NetworkDevice from './NetworkDevice';
import ContextMenu from './ContextMenu';
import Toolbar from './Toolbar';
import ConnectionLine from './ConnectionLine';
import SideToolbar from './SideToolbar';
import LeftMenu from './LeftMenu';
import { useTheme } from '../context/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNetworkDevices } from '../hooks/useNetworkDevices';
import { useConnections } from '../hooks/useConnections';
import { useNetworkConfig } from '../hooks/useNetworkConfig';

// Styled component for the diagram container
const DiagramContainer = styled.div`
  width: ${props => `${100 / props.scale}%`};
  height: ${props => `${100 / props.scale}%`};
  min-width: 100%;
  min-height: calc(100% - 60px);
  background-color: ${props => props.$isDarkMode ? '#1a1a1a' : '#ffffff'};
  background-image: ${props => {
    // For dark mode, use a brighter white with same opacity
    const darkModeColor = 'rgba(255, 255, 255, 0.35)';
    const darkModeSmallColor = 'rgba(255, 255, 255, 0.25)';
    const darkModeDotsColor = 'rgba(255, 255, 255, 0.4)';
    
    // Light mode colors remain the same
    const lightModeColor = 'rgba(0, 0, 0, 0.25)';
    const lightModeSmallColor = 'rgba(0, 0, 0, 0.2)';
    const lightModeDotsColor = 'rgba(0, 0, 0, 0.3)';

    const color = props.$isDarkMode ? darkModeColor : lightModeColor;
    const smallGridColor = props.$isDarkMode ? darkModeSmallColor : lightModeSmallColor;
    const dotsColor = props.$isDarkMode ? darkModeDotsColor : lightModeDotsColor;
    
    switch(props.theme?.id) {
      case 'dots':
        return `
          radial-gradient(${dotsColor} 1px, transparent 1px),
          radial-gradient(${dotsColor} 1px, transparent 1px)
        `;
      case 'grid':
        return `
          linear-gradient(${color} 1px, transparent 1px),
          linear-gradient(90deg, ${color} 1px, transparent 1px),
          linear-gradient(${smallGridColor} 1px, transparent 1px),
          linear-gradient(90deg, ${smallGridColor} 1px, transparent 1px)
        `;
      case 'lines':
        return `
          linear-gradient(${color} 1px, transparent 1px),
          linear-gradient(90deg, ${color} 1px, transparent 1px)
        `;
      default:
        return 'none';
    }
  }};
  background-size: ${props => {
    switch(props.theme?.id) {
      case 'dots':
        return '20px 20px';
      case 'grid':
        return '100px 100px, 100px 100px, 20px 20px, 20px 20px';
      case 'lines':
        return '20px 20px';
      default:
        return 'auto';
    }
  }};
  background-position: ${props => {
    switch(props.theme?.id) {
      case 'dots':
        return '10px 10px';
      case 'grid':
        return '-1px -1px, -1px -1px, -1px -1px, -1px -1px';
      case 'lines':
        return '-1px -1px';
      default:
        return '0 0';
    }
  }};
  border: 1px solid ${props => props.$isDarkMode ? '#404040' : '#ccc'};
  position: relative;
  transition: all 0.3s ease;
  transform: scale(${props => props.scale});
  transform-origin: top left;
  overflow: auto;
  
  /* Ensure device positions are scaled correctly */
  & > * {
    transform-origin: top left;
  }
`;

// Styled component for the connection SVG
const Connection = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
`;

// Styled component for the pending connection group
const PendingConnectionGroup = styled.g``;

// Styled component for the devices group
const DevicesGroup = styled.g``;

// Styled component for the device group
const DeviceGroup = styled.g``;

// Styled component for the main container
const MainContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${props => props.$isDarkMode ? '#2d2d2d' : '#f5f5f5'};
  color: ${props => props.$isDarkMode ? '#ffffff' : '#000000'};
  transition: all 0.3s ease;
`;

// Styled component for the interface label
const InterfaceLabel = styled.div`
  position: absolute;
  font-size: 12px;
  font-weight: bold;
  color: ${props => props.$isDarkMode ? '#ffffff' : '#666'};
  text-align: center;
  transition: color 0.3s ease;
`;

// Styled component for the save button
const SaveButton = styled.button`
  padding: 8px 16px;
  background-color: ${props => props.disabled ? 
    (props.$isDarkMode ? '#404040' : '#e0e0e0') : 
    (props.$isDarkMode ? '#2196f3' : '#1976d2')};
  color: ${props => props.disabled ? 
    (props.$isDarkMode ? '#808080' : '#9e9e9e') : 
    '#ffffff'};
  border: none;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  margin-left: 16px;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background-color: ${props => props.$isDarkMode ? '#1976d2' : '#1565c0'};
  }
`;

// Styled component for the toolbar buttons
const ToolbarButton = styled.button`
  padding: 8px 16px;
  background-color: ${props => props.disabled ? 
    (props.$isDarkMode ? '#404040' : '#e0e0e0') : 
    (props.$isDarkMode ? '#2196f3' : '#1976d2')};
  color: ${props => props.disabled ? 
    (props.$isDarkMode ? '#808080' : '#9e9e9e') : 
    '#ffffff'};
  border: none;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  margin-left: 16px;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background-color: ${props => props.$isDarkMode ? '#1976d2' : '#1565c0'};
  }
`;

const CloseButton = styled(ToolbarButton)`
  background-color: ${props => props.$isDarkMode ? '#424242' : '#757575'};
  &:hover:not(:disabled) {
    background-color: ${props => props.$isDarkMode ? '#616161' : '#616161'};
  }
`;

// Add a wrapper to handle overflow
const DiagramWrapper = styled.div`
  height: calc(100vh - 60px);
  overflow: auto;
  position: relative;
  user-select: ${props => props.$isPanning ? 'none' : 'auto'};
  cursor: ${props => props.$tool === 'hand' 
    ? (props.$isPanning ? 'grabbing' : 'grab') 
    : 'default'
  };

  &:active {
    cursor: ${props => props.$tool === 'hand' ? 'grabbing' : 'default'};
  }
`;

// Network device icons as inline SVGs for better portability
const networkIcons = [
  {
    type: 'router',
    icon: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
      </svg>
    `)}`,
    label: 'Router'
  },
  {
    type: 'switch',
    icon: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
        <path d="M7 10h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
      </svg>
    `)}`,
    label: 'Switch'
  },
  {
    type: 'firewall',
    icon: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l6 2.67v5.15c0 4.29-2.78 8.31-6 9.67V3.18z"/>
      </svg>
    `)}`,
    label: 'Firewall'
  },
  {
    type: 'server',
    icon: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 6H5V5h14v3zm1 4H4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zm-1 6H5v-3h14v3z"/>
      </svg>
    `)}`,
    label: 'Server'
  },
  {
    type: 'cloud',
    icon: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
      </svg>
    `)}`,
    label: 'Cloud'
  },
  {
    type: 'laptop',
    icon: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
      </svg>
    `)}`,
    label: 'Laptop'
  }
];

// NetworkDiagram component
function NetworkDiagram() {
  // Theme and routing hooks
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  // URL params
  const configFile = new URLSearchParams(location.search).get('configFile');

  // All useState hooks grouped together
  const [returnPath, setReturnPath] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedCanvasTheme, setSelectedCanvasTheme] = useState('grid');
  const [canvasScale, setCanvasScale] = useState(1);
  const [selectedTool, setSelectedTool] = useState('pointer');
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [lastScrollPosition, setLastScrollPosition] = useState({ x: 0, y: 0 });
  const [connections, setConnections] = useState([]);
  const [pendingConnection, setPendingConnection] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Custom hooks after useState
  const {
    devices,
    setDevices,
    addDevice,
    updateDevice,
    deleteDevice,
    getDeviceById
  } = useNetworkDevices(setHasUnsavedChanges);

  const {
    selectedConnectionId,
    selectedConnectionType,
    selectedColor,
    addConnection,
    updateConnection,
    deleteConnection,
    handleConnectionTypeChange,
    handleConnectionColorChange,
    handleConnectionClick,
    deleteConnectionsForDevice
  } = useConnections(setHasUnsavedChanges, connections, setConnections);

  // Config hook after other custom hooks
  const { saveConfig } = useNetworkConfig(configFile, setDevices, setConnections);

  // Get the current theme settings
  const getCurrentTheme = useCallback(() => {
    const themes = {
      none: { id: 'none', name: 'No Grid' },
      dots: { id: 'dots', name: 'Dots' },
      lines: { id: 'lines', name: 'Lines' },
      grid: { id: 'grid', name: 'Grid' }
    };
    return themes[selectedCanvasTheme] || themes.none;
  }, [selectedCanvasTheme]);

  // Handler for canvas theme change
  const handleCanvasThemeChange = (themeId) => {
    setSelectedCanvasTheme(themeId);
  };

  // Handler for canvas scale change
  const handleCanvasScaleChange = (scale) => {
    setCanvasScale(scale);
  };

  // Handler for tool change
  const handleToolChange = (tool) => {
    setSelectedTool(tool);
  };

  // Handlers for panning
  const handleMouseDown = (e) => {
    if (selectedTool === 'hand') {
      e.preventDefault(); // Prevent text selection while panning
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      setLastScrollPosition({
        x: diagramRef.current.scrollLeft,
        y: diagramRef.current.scrollTop
      });
      document.body.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning && selectedTool === 'hand') {
      e.preventDefault();
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      
      if (diagramRef.current) {
        diagramRef.current.scrollLeft = lastScrollPosition.x - dx;
        diagramRef.current.scrollTop = lastScrollPosition.y - dy;
      }
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      document.body.style.cursor = selectedTool === 'hand' ? 'grab' : 'default';
      // Update last scroll position when stopping pan
      if (diagramRef.current) {
        setLastScrollPosition({
          x: diagramRef.current.scrollLeft,
          y: diagramRef.current.scrollTop
        });
      }
    }
  };

  // Add keyboard shortcuts for tools
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key.toLowerCase()) {
        case 'v':
          setSelectedTool('pointer');
          break;
        case 'h':
          setSelectedTool('hand');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Update cursor based on selected tool
  useEffect(() => {
    if (diagramRef.current) {
      diagramRef.current.style.cursor = selectedTool === 'hand' ? 'grab' : 'default';
    }
  }, [selectedTool]);

  // useEffect hooks at the end
  useEffect(() => {
    if (configFile) {
      const dirPath = configFile.substring(0, configFile.lastIndexOf('/'));
      setReturnPath(dirPath);
    }
  }, [configFile]);

  // Load config from file
  useEffect(() => {
    const loadConfig = async () => {
      if (!configFile) return;
      
      try {
        const response = await axios.get('/networkmap/api/load-config', {
          params: { path: configFile }
        });
        
        if (response.data) {
          setDevices(response.data.devices || []);
          setConnections(response.data.connections || []);
          setHasUnsavedChanges(false);
        }
      } catch (error) {
        console.error('Error loading config:', error);
      }
    };

    loadConfig();
  }, [configFile]);

  // Mark changes as unsaved when diagram is modified
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [devices, connections]);

  // Handler for saving the configuration
  const handleSave = async () => {
    if (!configFile || !hasUnsavedChanges) return;

    try {
      await saveConfig(devices, connections);
      setHasUnsavedChanges(false); // Ensure state is updated
      window.addNotification('Configuration saved successfully', 'success');
    } catch (error) {
      console.error('Error saving config:', error);
      window.addNotification('Error saving configuration', 'error');
    }
  };

  // Handler for closing the diagram
  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Do you want to save before closing?')) {
        handleSave().then(() => {
          navigate('/', { state: { lastPath: returnPath } });
        }).catch(() => {
          // If save fails, don't navigate away
        });
      } else {
        navigate('/', { state: { lastPath: returnPath } });
      }
    } else {
      navigate('/', { state: { lastPath: returnPath } });
    }
  };

  // Function to get used interfaces for a device
  // Returns an array of interface names that are already used in connections
  // Example: If device "router1" has GigabitEthernet0/0 connected to "switch1",
  // getUsedInterfaces("router1") will return ["GigabitEthernet0/0"]
  const getUsedInterfaces = (deviceId) => {
    return connections
      .filter(conn => conn.sourceDeviceId === deviceId || conn.targetDeviceId === deviceId)
      .map(conn => {
        // If this device is the source, return its source interface
        if (conn.sourceDeviceId === deviceId) {
          return conn.sourceInterface.name;
        }
        // If this device is the target, return its target interface
        return conn.targetInterface.name;
      });
  };

  // Handler for deleting a device and its connections
  const handleDeleteDevice = (deviceId) => {
    // Remove the device
    deleteDevice(deviceId);
    
    // Remove any connections associated with this device
    deleteConnectionsForDevice(deviceId);
    
    window.addNotification('Device deleted', 'success');
  };

  // Handler for changing the connection type
  const onConnectionTypeSelect = (type) => {
    handleConnectionTypeChange(type);
    window.addNotification('Connection type updated', 'success');
  };

  // Handler for selecting a connection
  const onConnectionSelect = (connectionId) => {
    handleConnectionClick(connectionId);
  };

  // Handler for selecting an interface
  // Example: When user selects an interface, this will:
  // 1. Show the context menu
  // 2. Update the context menu position
  // 3. Update the selected device state
  const handleInterfaceSelect = (deviceId, interfaces, x, y) => {
    console.log('handleInterfaceSelect called:', { deviceId, interfaces, x, y, pendingConnection });
    
    if (!pendingConnection) {
      console.log('Starting new connection from device:', deviceId);
      setShowContextMenu(true);
      setContextMenuPosition({ x, y });
      setSelectedDevice({ id: deviceId, interfaces });
    } else {
      if (deviceId !== pendingConnection.sourceDeviceId) {
        console.log('Completing connection to device:', deviceId);
        setShowContextMenu(true);
        setContextMenuPosition({ x, y });
        setSelectedDevice({ id: deviceId, interfaces });
      }
    }
  };

  // Handler for changing the control points of a connection
  // Example: When user updates the control points of a connection, this will:
  // 1. Update the control points of the connection
  const handleControlPointsChange = (connectionId, newControlPoints) => {
    updateConnection(connectionId, { controlPoints: newControlPoints });
  };

  // Handler for dragging a device
  const handleDeviceDrag = (deviceId, x, y) => {
    if (!diagramRef.current) return;
    
    // Just update with the raw coordinates
    updateDevice(deviceId, { x, y });
  };

  // Handler for stopping the drag of a device
  const handleDeviceDragStop = (deviceId, x, y) => {
    if (!diagramRef.current) return;
    
    // Just update with the raw coordinates
    updateDevice(deviceId, { x, y });
    setHasUnsavedChanges(true);
  };

  // Use the useDrop hook to handle dropping a network icon
  const [, drop] = useDrop({
    accept: 'NETWORK_ICON',
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const containerRect = document.getElementById('diagram-container').getBoundingClientRect();
      
      // For new drops, we do need to adjust for container position and scale
      const x = (offset.x - containerRect.left) / canvasScale;
      const y = (offset.y - containerRect.top) / canvasScale;

      const deviceType = networkIcons.find(ni => ni.type === item.type);
      const newDevice = {
        id: Date.now(),
        type: item.type,
        icon: deviceType ? deviceType.icon : item.icon,
        label: item.label || deviceType?.label || item.type,
        x,
        y,
      };

      addDevice(newDevice);
      window.addNotification(`Added new ${item.type} device`, 'success');
    },
  });

  // Effect hook to handle mouse move events when a connection is pending
  useEffect(() => {
    if (pendingConnection) {
      const handleMouseMove = (e) => {
        const containerRect = diagramRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - containerRect.left,
          y: e.clientY - containerRect.top
        });
      };

      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [pendingConnection]);

  // Effect hook to handle clicks outside the context menu
  useEffect(() => {
    const handleClick = (e) => {
      // Only handle clicks on the diagram container itself, not its children
      if (e.target.id === 'diagram-container') {
        setShowContextMenu(false);
        // Only deselect if we have a selected connection
        if (selectedConnectionId !== null) {
          handleConnectionClick(null);
        }
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [handleConnectionClick, selectedConnectionId]);

  // Function to calculate the position of an interface
  // Example: When user selects an interface, this will:
  // 1. Calculate the position of the interface based on the device position and angle
  const calculateInterfacePosition = (deviceX, deviceY, angle) => {
    const radius = 40; // Distance from device center
    const offsetX = Math.cos(angle) * radius;
    const offsetY = Math.sin(angle) * radius;
    
    // Add some vertical offset to ensure the label is above the connection
    const verticalOffset = -15;
    
    return {
      x: deviceX + offsetX,
      y: deviceY + offsetY + verticalOffset
    };
  };

  // Function to render the connections
  // Example: When user creates a connection, this will:
  // 1. Render the connection line
  // 2. Render the pending connection line (if any)
  const renderConnections = () => {
    return (
      <>
        {/* Map through all established connections and render them
            Example: connections = [
              {
                id: 1,
                sourceDeviceId: 'router1',
                targetDeviceId: 'switch1',
                sourceInterface: 'GigabitEthernet0/0',
                targetInterface: 'GigabitEthernet0/1',
                type: 'solid'
              }
            ] */}
        {connections.map((connection, index) => {
          // console.log('Rendering connection:', connection);
          // Find the source and target devices for this connection
          // Example: Find router1 and switch1 devices from the devices array
          const sourceDevice = devices.find(d => d.id === connection.sourceDeviceId);
          const targetDevice = devices.find(d => d.id === connection.targetDeviceId);

          // Skip rendering if either device is missing (prevents errors)
          // Example: If router1 or switch1 was deleted but connection still exists
          if (!sourceDevice || !targetDevice) {
            console.log('Missing device for connection:', { sourceDevice, targetDevice });
            return null;
          }

          // Calculate the center points of both devices for connection line
          // Example: If router1 is at (100, 100), its center will be at (130, 130)
          // The +30 offset is half the device width/height (60px) to find center
          const sourceCenter = {
            x: sourceDevice.x + 30,
            y: sourceDevice.y + 30
          };
          const targetCenter = {
            x: targetDevice.x + 30,
            y: targetDevice.y + 30
          };

          // Render the connection line between devices
          // Example: Draw a line from router1's center (130, 130) to switch1's center (230, 230)
          console.log('Rendering connection:', connection);
          return (
            <React.Fragment key={connection.id}>
              <ConnectionLine
                key={connection.id}
                connection={connection}
                sourceX={sourceCenter.x}
                sourceY={sourceCenter.y}
                targetX={targetCenter.x}
                targetY={targetCenter.y}
                type={connection.type || selectedConnectionType}
                color={selectedConnectionId === connection.id ? selectedColor : connection.color}
                selected={selectedConnectionId === connection.id}
                onClick={() => onConnectionSelect(connection.id)}
                onControlPointsChange={(newPoints) => handleControlPointsChange(connection.id, newPoints)}
              />
            </React.Fragment>
          );
        })}
        {/* Render a pending connection line when user is creating a new connection
            Example: When user clicks router1's interface and moves mouse to switch1,
            this draws a dashed line from router1's center to the current mouse position */}
        {pendingConnection && (
          <PendingConnectionGroup>
            <path
              d={`M ${devices.find(d => d.id === pendingConnection.sourceDeviceId).x + 30} 
                  ${devices.find(d => d.id === pendingConnection.sourceDeviceId).y + 30} 
                  L ${mousePosition.x} ${mousePosition.y}`}
              stroke="#666"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
            />
          </PendingConnectionGroup>
        )}
      </>
    );
  };

  // Render the NetworkDiagram component
  const diagramRef = useRef(null);
  return (
    /* Main container component that wraps the entire diagram interface
       Example: Changes background color based on dark/light mode */
    <MainContainer $isDarkMode={isDarkMode}>
      {/* Left menu component containing network icons and connection type selector
          Example: User can drag network icons from here to create new devices
          and select connection types (solid, dashed, etc.) */}
      <LeftMenu
        networkIcons={networkIcons}
        onConnectionTypeChange={onConnectionTypeSelect}
        selectedConnectionType={selectedConnectionType}
        selectedColor={selectedColor}
        onConnectionColorChange={handleConnectionColorChange}
        isDarkMode={isDarkMode}
      />
      <SideToolbar
        selectedConnectionType={selectedConnectionType}
      />
      <Toolbar
        onCanvasThemeChange={handleCanvasThemeChange}
        selectedCanvasTheme={selectedCanvasTheme}
        onScaleChange={handleCanvasScaleChange}
        scale={canvasScale}
        onToolChange={handleToolChange}
        selectedTool={selectedTool}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <SaveButton
            onClick={handleSave}
            disabled={!hasUnsavedChanges || !configFile}
            $isDarkMode={isDarkMode}
          >
            Save
          </SaveButton>
          <CloseButton
            onClick={handleClose}
            $isDarkMode={isDarkMode}
          >
            Close Editor
          </CloseButton>
        </div>
      </Toolbar>
      {/* Main diagram container where devices and connections are rendered
          Example: This is the drop target for new devices when dragged from LeftMenu */}
      <DiagramWrapper
        ref={diagramRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        $isPanning={isPanning}
        $tool={selectedTool}
      >
        <DiagramContainer
          ref={drop}
          id="diagram-container"
          $isDarkMode={isDarkMode}
          theme={getCurrentTheme()}
          scale={canvasScale}
        >
          {/* SVG container for all network connections
              Example: Contains all connection lines between devices */}
          <Connection>
            {renderConnections()}
          </Connection>
          {/* Map through all devices and render NetworkDevice components
              Example: If devices = [{id: 1, type: 'router', x: 100, y: 100}],
              it renders a router device at position (100,100) */}
          {devices.map((device) => (
            <NetworkDevice
              key={device.id}
              id={device.id}
              type={device.type}
              icon={device.icon}
              x={device.x}
              y={device.y}
              onDrag={handleDeviceDrag}
              onDragStop={handleDeviceDragStop}
              onInterfaceSelect={handleInterfaceSelect}
              onDelete={handleDeleteDevice}
              showInterfaceLabels={true}
              $isDarkMode={isDarkMode}
              canvasScale={canvasScale}
            />
          ))}
          {/* Context menu for interface selection when creating connections
              Example: When user clicks a device interface:
              1. If no pending connection exists:
                 - Creates new pending connection from selected interface
              2. If pending connection exists:
                 - Completes the connection between source and target interfaces */}
          {showContextMenu && selectedDevice && (
            <ContextMenu
              $isDarkMode={isDarkMode}
              x={contextMenuPosition.x}
              y={contextMenuPosition.y}
              interfaces={selectedDevice.interfaces}
              usedInterfaces={getUsedInterfaces(selectedDevice.id)}
              onSelect={(selectedInterface) => {
                console.log('Interface selected:', selectedInterface);
                // Check if the interface is already used
                const usedInterfaces = getUsedInterfaces(selectedDevice.id);
                if (usedInterfaces.includes(selectedInterface.name)) {
                  window.addNotification('This interface is already in use', 'error');
                  return;
                }

                if (!pendingConnection) {
                  // Start new connection
                  // Example: User clicks Router1's GigabitEthernet0/0 interface
                  console.log('Creating pending connection:', {
                    sourceDeviceId: selectedDevice.id,
                    sourceInterface: selectedInterface
                  });
                  setPendingConnection({
                    sourceDeviceId: selectedDevice.id,
                    sourceInterface: selectedInterface,
                    type: selectedConnectionType
                  });
                } else {
                  // Complete connection if target device is different from source
                  // Example: User clicks Router2's GigabitEthernet0/1 to complete connection
                  if (selectedDevice.id !== pendingConnection.sourceDeviceId) {
                    console.log('Creating new connection:', {
                      source: pendingConnection.sourceDeviceId,
                      target: selectedDevice.id,
                      sourceInterface: pendingConnection.sourceInterface,
                      targetInterface: selectedInterface
                    });
                    const newConnection = {
                      id: Date.now(),
                      sourceDeviceId: pendingConnection.sourceDeviceId,
                      targetDeviceId: selectedDevice.id,
                      sourceInterface: pendingConnection.sourceInterface,
                      targetInterface: selectedInterface,
                      type: selectedConnectionType
                    };
                    addConnection(newConnection);
                    setPendingConnection(null);
                    window.addNotification('Connection created successfully', 'success');
                  }
                }
                setShowContextMenu(false);
              }}
              onDelete={() => {
                handleDeleteDevice(selectedDevice.id);
                setShowContextMenu(false);
              }}
              onClose={() => {
                console.log('Context menu closed');
                setShowContextMenu(false);
              }}
            />
          )}
        </DiagramContainer>
      </DiagramWrapper>
      {/* Side toolbar component for additional tools and options */}
    </MainContainer>
  );
}

export default NetworkDiagram;
