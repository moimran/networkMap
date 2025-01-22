import { useState } from 'react';

export const useConnections = (setHasUnsavedChanges, connections, setConnections) => {
  const [selectedConnectionId, setSelectedConnectionId] = useState(null);
  const [selectedConnectionType, setSelectedConnectionType] = useState('solid');
  // Initialize with null (will use default color)
  const [selectedColor, setSelectedColor] = useState(null);

  const addConnection = (newConnection) => {
    // New connections use the default color
    setConnections(prev => [...prev, { ...newConnection, color: '#666' }]);
    setHasUnsavedChanges(true);
  };

  const updateConnection = (connectionId, updates) => {
    console.log('updateConnection - connectionId:', connectionId, 'updates:', updates);
    setConnections(prevConnections => {
      const newConnections = prevConnections.map(conn => 
        conn.id === connectionId 
          ? { ...conn, ...updates }
          : conn
      );
      console.log('updateConnection - New connections state:', newConnections);
      return newConnections;
    });
    setHasUnsavedChanges(true);
  };

  const deleteConnection = (connectionId) => {
    setConnections(connections.filter(conn => conn.id !== connectionId));
    setHasUnsavedChanges(true);
  };

  const handleConnectionTypeChange = (type) => {
    setSelectedConnectionType(type);
    if (selectedConnectionId) {
      updateConnection(selectedConnectionId, { type });
      window.addNotification('Connection type updated', 'success');
    }
  };

  const handleConnectionColorChange = (color) => {
    console.log('handleConnectionColorChange - New color:', color);
    console.log('handleConnectionColorChange - Selected connection:', selectedConnectionId);
    
    // Update the selected color
    setSelectedColor(color);
    
    // Update the connection's color if a connection is selected
    if (selectedConnectionId) {
      setConnections(prevConnections => {
        const newConnections = prevConnections.map(conn => {
          if (conn.id === selectedConnectionId) {
            // Only update the selected connection's color
            return { ...conn, color: color || '#666' };
          }
          return conn;
        });
        console.log('New connections state:', newConnections);
        return newConnections;
      });
      setHasUnsavedChanges(true);
      window.addNotification('Connection color updated', 'success');
    }
  };

  const handleConnectionClick = (connectionId) => {
    if (selectedConnectionId === connectionId) {
      // If clicking the same connection, deselect it
      setSelectedConnectionId(null);
      setSelectedColor(null);
      window.addNotification('Connection unselected', 'info');
    } else if (connectionId === null) {
      // If explicitly clearing selection, only show notification if we had a selection
      setSelectedConnectionId(null);
      setSelectedColor(null);
    } else {
      // Selecting a new connection
      setSelectedConnectionId(connectionId);
      const connection = connections.find(conn => conn.id === connectionId);
      if (connection) {
        if (connection.type) {
          setSelectedConnectionType(connection.type);
        }
        if (connection.color) {
          setSelectedColor(connection.color);
        }
      }
      window.addNotification('Connection selected - Choose a color to change it', 'info');
    }
  };

  const deleteConnectionsForDevice = (deviceId) => {
    setConnections(connections.filter(conn => 
      conn.sourceDeviceId !== deviceId && conn.targetDeviceId !== deviceId
    ));
    setHasUnsavedChanges(true);
  };

  return {
    connections,
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
  };
};
