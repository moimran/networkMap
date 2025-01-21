import { useState } from 'react';

export const useNetworkDevices = (setHasUnsavedChanges) => {
  const [devices, setDevices] = useState([]);

  const addDevice = (newDevice) => {
    setDevices(prev => [...prev, newDevice]);
    setHasUnsavedChanges(true);
  };

  const updateDevice = (deviceId, updates) => {
    setDevices(devices.map(device => 
      device.id === deviceId ? { ...device, ...updates } : device
    ));
    setHasUnsavedChanges(true);
  };

  const deleteDevice = (deviceId) => {
    setDevices(devices.filter(device => device.id !== deviceId));
    setHasUnsavedChanges(true);
  };

  const getDeviceById = (deviceId) => {
    return devices.find(device => device.id === deviceId);
  };

  return {
    devices,
    setDevices,
    addDevice,
    updateDevice,
    deleteDevice,
    getDeviceById
  };
};
