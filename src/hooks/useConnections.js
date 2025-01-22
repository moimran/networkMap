import { useState } from 'react';

export const useConnections = (setHasUnsavedChanges, connections, setConnections) => {
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [selectedConnectionType, setSelectedConnectionType] = useState('solid');
  const [selectedColors, setSelectedColors] = useState(['#666']); // Default color

  const addConnection = (newConnection) => {
    setConnections(prev => [...prev, { ...newConnection, colors: selectedColors }]);
    setHasUnsavedChanges(true);
  };

  const updateConnection = (connectionId, updates) => {
    setConnections(connections.map(conn => 
      conn.id === connectionId ? { ...conn, ...updates } : conn
    ));
    setHasUnsavedChanges(true);
  };

  const deleteConnection = (connectionId) => {
    setConnections(connections.filter(conn => conn.id !== connectionId));
    setHasUnsavedChanges(true);
  };

  const handleConnectionTypeChange = (type) => {
    setSelectedConnectionType(type);
    if (selectedConnection) {
      updateConnection(selectedConnection, { type });
      window.addNotification('Connection type updated', 'success');
    }
  };

  const handleConnectionColorsChange = (colors) => {
    setSelectedColors(colors);
    if (selectedConnection) {
      updateConnection(selectedConnection, { colors });
      window.addNotification('Connection colors updated', 'success');
    }
  };

  const handleConnectionClick = (connectionId) => {
    if (selectedConnection !== null && selectedConnection === connectionId) {
      setSelectedConnection(null);
      window.addNotification('Connection unselected', 'info');
    } else if (connectionId === null) {
      setSelectedConnection(null);
    } else {
      setSelectedConnection(connectionId);
      const connection = connections.find(conn => conn.id === connectionId);
      if (connection) {
        if (connection.type) {
          setSelectedConnectionType(connection.type);
        }
        if (connection.colors) {
          setSelectedColors(connection.colors);
        }
      }
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
    selectedConnection,
    selectedConnectionType,
    selectedColors,
    addConnection,
    updateConnection,
    deleteConnection,
    handleConnectionTypeChange,
    handleConnectionColorsChange,
    handleConnectionClick,
    deleteConnectionsForDevice
  };
};
