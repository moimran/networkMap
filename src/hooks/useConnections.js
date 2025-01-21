import { useState } from 'react';

export const useConnections = (setHasUnsavedChanges) => {
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [selectedConnectionType, setSelectedConnectionType] = useState('solid');

  const addConnection = (newConnection) => {
    setConnections(prev => [...prev, newConnection]);
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

  const handleConnectionClick = (connectionId) => {
    if (selectedConnection === connectionId) {
      setSelectedConnection(null);
    } else {
      setSelectedConnection(connectionId);
      const connection = connections.find(conn => conn.id === connectionId);
      if (connection && connection.type) {
        setSelectedConnectionType(connection.type);
      }
      window.addNotification('Connection selected - Choose a connection type to change it', 'info');
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
    setConnections,
    selectedConnection,
    selectedConnectionType,
    addConnection,
    updateConnection,
    deleteConnection,
    handleConnectionTypeChange,
    handleConnectionClick,
    deleteConnectionsForDevice
  };
};
