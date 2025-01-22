import { useState } from 'react';

export const useConnections = (setHasUnsavedChanges, connections, setConnections) => {
  const [selectedConnectionId, setSelectedConnectionId] = useState(null);
  const [selectedConnectionType, setSelectedConnectionType] = useState('solid');
  // Initialize with null (will use default color)
  const [selectedColor, setSelectedColor] = useState(null);

  const addConnection = (newConnection) => {
    // New connections use the default color and empty control points
    setConnections(prev => [...prev, { 
      ...newConnection, 
      color: '#666',
      controlPoints: [] 
    }]);
    setHasUnsavedChanges(true);
  };

  const updateConnection = (connectionId, updates) => {
    console.log('updateConnection - connectionId:', connectionId, 'updates:', updates);
    setConnections(prevConnections => {
      const newConnections = prevConnections.map(conn => {
        if (conn.id === connectionId) {
          // Ensure controlPoints is an array
          const controlPoints = Array.isArray(updates.controlPoints) ? updates.controlPoints : [];
          return { 
            ...conn, 
            ...updates,
            controlPoints 
          };
        }
        return conn;
      });
      console.log('updateConnection - New connections state:', newConnections);
      return newConnections;
    });
    setHasUnsavedChanges(true);
  };

  const updateConnectionControlPoints = (connectionId, controlPoints) => {
    setConnections(prevConnections => {
      const newConnections = prevConnections.map(conn => 
        conn.id === connectionId 
          ? { ...conn, controlPoints }
          : conn
      );
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
    console.log('handleConnectionClick - connectionId:', connectionId);
    setSelectedConnectionId(connectionId);
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
    updateConnectionControlPoints,
    deleteConnection,
    handleConnectionTypeChange,
    handleConnectionColorChange,
    handleConnectionClick,
    deleteConnectionsForDevice
  };
};
