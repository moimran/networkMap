import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '../context/ThemeContext';

const glowAnimation = keyframes`
  0% { filter: drop-shadow(0 0 2px #4CAF50); }
  50% { filter: drop-shadow(0 0 6px #4CAF50); }
  100% { filter: drop-shadow(0 0 2px #4CAF50); }
`;

const ConnectionBulb = styled.circle`
  fill: #4CAF50;
  animation: ${glowAnimation} 2s ease-in-out infinite;
`;

const StyledPath = styled.path`
  stroke: ${props => props.$color || '#666'};
  stroke-width: ${props => (props.$selected || props.$isHovered) ? '3' : '2'};
  stroke-dasharray: ${props => props.$type === 'dashed' ? '8,4' : props.$type === 'dotted' ? '2,2' : 'none'};
  fill: ${props => props.fill || 'none'};
  transition: all 0.2s ease;
  cursor: pointer;
  filter: ${props => props.$selected ? 
    'drop-shadow(0 0 4px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 8px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 12px rgba(0, 0, 0, 0.2))' :
    props.$isHovered ? 
    'drop-shadow(0 0 4px rgba(0, 0, 0, 0.2))' : 
    'none'
  };
`;

const ConnectionGroup = styled.g`
  pointer-events: all;
  &:hover {
    ${StyledPath} {
      stroke-width: 3;
      filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.3))
             drop-shadow(0 0 6px rgba(0, 0, 0, 0.2))
             drop-shadow(0 0 9px rgba(0, 0, 0, 0.1));
    }
    ${ConnectionBulb} {
      fill: #2196F3;
    }
  }
`;

const ControlPoint = styled.circle`
  fill: ${props => props.$isDarkMode ? '#666' : '#999'};
  stroke: ${props => props.$isDarkMode ? '#999' : '#666'};
  stroke-width: 2;
  cursor: move;
  &:hover {
    fill: #4CAF50;
  }
`;

const getStrokeDashArray = (type) => {
  switch (type) {
    case 'dashed':
      return '8,4';
    case 'dotted':
      return '2,2';
    default:
      return 'none';
  }
};

const getPathData = (type, points, controlPoints = []) => {
  const { source, target } = points;
  
  // Ensure controlPoints is an array
  const safeControlPoints = Array.isArray(controlPoints) ? controlPoints : [];
  
  if (!safeControlPoints.length) {
    // Default path types without labels
    switch (type) {
      case 'curved':
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        const controlY = midY - 50;
        return `M ${source.x} ${source.y} Q ${midX} ${controlY} ${target.x} ${target.y}`;
      
      case 'angled':
        const cornerX = source.x;
        const cornerY = target.y;
        return `M ${source.x} ${source.y} L ${cornerX} ${cornerY} L ${target.x} ${target.y}`;
      
      default:
        return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
    }
  }
  
  // Path with control points
  let path = `M ${source.x} ${source.y}`;
  safeControlPoints.forEach(point => {
    path += ` L ${point.x} ${point.y}`;
  });
  path += ` L ${target.x} ${target.y}`;
  return path;
};

const ConnectionLine = ({
  connection,
  sourceX,
  sourceY,
  targetX,
  targetY,
  onControlPointsChange,
  type = 'solid',
  color,
  selected = false,
  onClick
}) => {
  // console.log('ConnectionLine props:', { connection, color, selected });
  const { isDarkMode } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [draggingPointIndex, setDraggingPointIndex] = useState(null);
  const [initialMousePosition, setInitialMousePosition] = useState(null);
  const svgRef = useRef(null);
  
  // Use connection color if available, otherwise use passed color or default
  const lineColor = connection?.color || color || '#666';
  // console.log('ConnectionLine props:', { connection, color: lineColor, selected });
  const handleMouseEnter = useCallback((e) => {
    e.stopPropagation();
    console.debug(`[ConnectionLine] Mouse Enter - Connection: ${connection?.id}`);
    setIsHovered(true);
  }, [connection?.id]);

  const handleMouseLeave = useCallback((e) => {
    e.stopPropagation();
    console.debug(`[ConnectionLine] Mouse Leave - Connection: ${connection?.id}`);
    setIsHovered(false);
  }, [connection?.id]);

  const handleClick = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    if (onClick) {
      onClick(connection.id);
    }
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    if (!selected) return;

    const svgRect = svgRef.current.ownerSVGElement.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;

    // Ensure controlPoints is an array before spreading
    const existingControlPoints = Array.isArray(connection.controlPoints) ? connection.controlPoints : [];
    const newControlPoints = [...existingControlPoints, { x, y }];
    
    if (onControlPointsChange) {
      onControlPointsChange(newControlPoints);
    }
  };

  const handleControlPointDragStart = (e) => {
    e.stopPropagation();
    const pointIndex = parseInt(e.target.getAttribute('data-index'));
    setDraggingPointIndex(pointIndex);
    
    const svgRect = svgRef.current.ownerSVGElement.getBoundingClientRect();
    setInitialMousePosition({
      x: e.clientX - svgRect.left,
      y: e.clientY - svgRect.top
    });
  };

  const handleControlPointDrag = useCallback((e) => {
    if (draggingPointIndex === null || !initialMousePosition) return;

    const svgRect = svgRef.current.ownerSVGElement.getBoundingClientRect();
    const currentMousePosition = {
      x: e.clientX - svgRect.left,
      y: e.clientY - svgRect.top
    };

    const existingControlPoints = Array.isArray(connection.controlPoints) ? connection.controlPoints : [];
    const updatedControlPoints = [...existingControlPoints];
    updatedControlPoints[draggingPointIndex] = {
      x: currentMousePosition.x,
      y: currentMousePosition.y
    };

    if (onControlPointsChange) {
      onControlPointsChange(updatedControlPoints);
    }
  }, [draggingPointIndex, initialMousePosition, connection.controlPoints, onControlPointsChange]);

  const handleControlPointDragEnd = useCallback(() => {
    setDraggingPointIndex(null);
    setInitialMousePosition(null);
  }, []);

  useEffect(() => {
    if (draggingPointIndex !== null) {
      window.addEventListener('mousemove', handleControlPointDrag);
      window.addEventListener('mouseup', handleControlPointDragEnd);

      return () => {
        window.removeEventListener('mousemove', handleControlPointDrag);
        window.removeEventListener('mouseup', handleControlPointDragEnd);
      };
    }
  }, [draggingPointIndex, handleControlPointDrag, handleControlPointDragEnd]);

  const handleControlPointContextMenu = (e, index) => {
    e.preventDefault();
    const updatedControlPoints = [...(connection.controlPoints || [])];
    updatedControlPoints.splice(index, 1);
    onControlPointsChange(connection.id, updatedControlPoints);
  };

  const calculateConnectionPoints = () => {
    return {
      source: {
        x: sourceX,
        y: sourceY
      },
      target: {
        x: targetX,
        y: targetY
      }
    };
  };

  const points = calculateConnectionPoints();
  const controlPoints = Array.isArray(connection.controlPoints) ? connection.controlPoints : [];
  const pathData = getPathData(type, points, controlPoints);

  return (
    <ConnectionGroup
      ref={svgRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Main connection line */}
      <StyledPath
        d={pathData}
        $type={type}
        $color={lineColor}
        $selected={selected}
        $isHovered={isHovered}
        $isDarkMode={isDarkMode}
      />

      {/* Control Points */}
      {selected && controlPoints.map((point, index) => (
        <ControlPoint
          key={index}
          data-index={index}
          cx={point.x}
          cy={point.y}
          r="6"
          $isDarkMode={isDarkMode}
          onMouseDown={handleControlPointDragStart}
          onContextMenu={(e) => handleControlPointContextMenu(e, index)}
        />
      ))}

      {/* Glowing bulbs at the ends */}
      <ConnectionBulb cx={points.source.x} cy={points.source.y} r="4" />
      <ConnectionBulb cx={points.target.x} cy={points.target.y} r="4" />
    </ConnectionGroup>
  );
};

export default ConnectionLine;
