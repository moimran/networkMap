import { useState, useEffect } from 'react';
import axios from 'axios';

export const useNetworkConfig = (configFile, setDevices, setConnections) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const loadConfig = async () => {
    if (!configFile) return;
    
    try {
      const response = await axios.get('/networkmap/api/load-config', {
        params: { path: configFile }
      });
      
      const config = response.data;
      if (config.devices) setDevices(config.devices);
      if (config.connections) {
        // Ensure each connection has a color property
        const connectionsWithColor = config.connections.map(conn => ({
          ...conn,
          color: conn.color || '#666' // Set default color if not present
        }));
        setConnections(connectionsWithColor);
      }
    } catch (error) {
      console.error('Error loading config:', error);
      throw error;
    }
  };

  const saveConfig = async (devices, connections) => {
    if (!configFile) return;

    try {
      await axios.post('/networkmap/api/save-config', {
        path: configFile,
        config: {
          devices,
          connections
        }
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving config:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadConfig().catch(error => {
      window.addNotification('Error loading configuration', 'error');
    });
  }, [configFile]);

  return {
    hasUnsavedChanges,
    setHasUnsavedChanges,
    saveConfig
  };
};
