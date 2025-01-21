import React from 'react';
import styled from 'styled-components';
import { useDrop } from 'react-dnd';
import NetworkDevice from './NetworkDevice';
import ConnectionLine from './ConnectionLine';

const Canvas = styled.svg`
  width: 100%;
  height: 100%;
  background: ${props => props.$isDarkMode ? '#1a1a1a' : '#ffffff'};
`;

const PendingConnectionGroup = styled.g``;

const DiagramCanvas = ({
  isDarkMode,
  devices,
  connections,
  pendingConnection,
  mousePosition,
  selectedConnection,
  onDeviceDrag,
  onDeviceDragStop,
  onDeviceDelete,
  onConnectionClick,
  onControlPointsChange,
  onDrop
}) => {
  const [, drop] = useDrop({
    accept: 'DEVICE',
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      onDrop(item, offset);
    }
  });

  const renderConnections = () => {
    return connections.map(connection => {
      const sourceDevice = devices.find(d => d.id === connection.sourceDeviceId);
      const targetDevice = devices.find(d => d.id === connection.targetDeviceId);

      if (!sourceDevice || !targetDevice) return null;

      const sourceCenter = {
        x: sourceDevice.x + 30,
        y: sourceDevice.y + 30
      };
      const targetCenter = {
        x: targetDevice.x + 30,
        y: targetDevice.y + 30
      };

      return (
        <ConnectionLine
          key={connection.id}
          connection={connection}
          sourceX={sourceCenter.x}
          sourceY={sourceCenter.y}
          targetX={targetCenter.x}
          targetY={targetCenter.y}
          type={connection.type}
          selected={selectedConnection === connection.id}
          onClick={() => onConnectionClick(connection.id)}
          onControlPointsChange={(newPoints) => onControlPointsChange(connection.id, newPoints)}
        />
      );
    });
  };

  const renderPendingConnection = () => {
    if (!pendingConnection) return null;

    const sourceDevice = devices.find(d => d.id === pendingConnection.sourceDeviceId);
    if (!sourceDevice) return null;

    return (
      <PendingConnectionGroup>
        <path
          d={`M ${sourceDevice.x + 30} ${sourceDevice.y + 30} L ${mousePosition.x} ${mousePosition.y}`}
          stroke="#666"
          strokeWidth="2"
          strokeDasharray="5,5"
          fill="none"
        />
      </PendingConnectionGroup>
    );
  };

  return (
    <Canvas ref={drop} $isDarkMode={isDarkMode}>
      {renderConnections()}
      {renderPendingConnection()}
      {devices.map(device => (
        <NetworkDevice
          key={device.id}
          {...device}
          onDrag={(x, y) => onDeviceDrag(device.id, x, y)}
          onDragStop={() => onDeviceDragStop(device.id)}
          onDelete={() => onDeviceDelete(device.id)}
        />
      ))}
    </Canvas>
  );
};

export default DiagramCanvas;
