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

const LabelContainer = styled.path`
  fill: ${props => props.$isDarkMode ? '#2d2d2d' : 'white'};
  stroke: ${props => props.$isDarkMode ? '#666' : '#666'};
  stroke-width: 1px;
`;

const InterfaceLabel = styled.text`
  font-size: 12px;
  fill: ${props => props.$isDarkMode ? '#ffffff' : '#333'};
  dominant-baseline: middle;
  text-anchor: middle;
`;

const StyledGroup = styled.g`
  pointer-events: all;
`;

const StyledPath = styled.path`
  stroke: ${props => props.$color || '#666'};
  stroke-width: ${props => (props.$selected || props.$isHovered) ? '3' : '2'};
  stroke-dasharray: ${props => props.strokeDasharray || 'none'};
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

const ConnectionGroup = styled(StyledGroup)`
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

const getStrokeDashArray = (type) => {
  switch (type) {
    case 'dashed':
      return '8,8';
    case 'dotted':
      return '2,4';
    default:
      return 'none';
  }
};

const getPathData = (type, points) => {
  const { source, target } = points;
  
  switch (type) {
    case 'curved':
      const midX = (source.x + target.x) / 2;
      const midY = (source.y + target.y) / 2;
      const controlY = midY - 50; // Curve height
      return `M ${source.x} ${source.y} Q ${midX} ${controlY} ${target.x} ${target.y}`;
    
    case 'angled':
      const cornerX = source.x;
      const cornerY = target.y;
      return `M ${source.x} ${source.y} L ${cornerX} ${cornerY} L ${target.x} ${target.y}`;
    
    default: // solid, dashed, dotted
      return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
  }
};

const ConnectionLine = ({
  connection,
  sourceX,
  sourceY,
  targetX,
  targetY,
  onControlPointsChange,
  showInterfaceLabels = true,
  type = 'solid',
  color,
  selected = false,
  onClick
}) => {
  console.log('ConnectionLine props:', { connection, color, selected });
  const { isDarkMode } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activePointIndex, setActivePointIndex] = useState(null);
  const [iconSize, setIconSize] = useState(0);
  const svgRef = useRef(null);
  
  // Use connection color if available, otherwise use passed color or default
  const lineColor = connection?.color || color || '#666';
  console.log('ConnectionLine props:', { connection, color: lineColor, selected });
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

  // Calculate icon size from SVG element
  useEffect(() => {
    const calculateIconSize = () => {
      if (svgRef.current) {
        const svgElement = svgRef.current.closest('svg');
        if (svgElement) {
          const iconElement = svgElement.querySelector('.network-icon'); // Add this class to your device icons
          if (iconElement) {
            const bbox = iconElement.getBoundingClientRect();
            setIconSize(Math.max(bbox.width, bbox.height));
          }
        }
      }
    };

    calculateIconSize();
    // Recalculate on window resize
    window.addEventListener('resize', calculateIconSize);
    return () => window.removeEventListener('resize', calculateIconSize);
  }, []);

  // Calculate label dimensions
  const getLabelDimensions = (text) => {
    if (!text) return { width: 0, height: 0 };
    const charWidth = 6.5; // Average width per character
    const height = 16; // Fixed height for the text
    const width = text.length * charWidth;
    const padding = Math.min(8, height/2); // Padding scales with height but caps at 8px
    
    return {
      width,
      height,
      padding,
      totalWidth: width + padding,
      totalHeight: height + padding
    };
  };

  // Create egg-shaped path for label container
  const createEggPath = (dimensions) => {
    const { width, height, padding } = dimensions;
    const w = width + padding;
    const h = height + padding;
    
    // Calculate radius based on height
    const r = h / 2;
    // Calculate control point offset for smoother curves
    const c = r * 0.552284749831; // Magic number to make perfect quarter circle
    
    // Create a smooth pill shape with dynamic dimensions
    return `
      M ${-w/2},0 
      c 0,${-c} ${c},${-r} ${r},${-r}
      h ${w - r * 2}
      c ${c},0 ${r},${c} ${r},${r}
      c 0,${c} ${-c},${r} ${-r},${r}
      h ${-(w - r * 2)}
      c ${-c},0 ${-r},${-c} ${-r},${-r}
      Z
    `.trim();
  };

  // Calculate connection points and paths
  const calculateConnectionPoints = () => {
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Use calculated icon size with a fallback
    const effectiveIconSize = iconSize || (() => {
      // console.warn('Icon size not calculated yet, falling back to default size of 70px. This may cause temporary visual inconsistencies.');
      return 70;
    })();
    
    // Calculate dynamic distances
    const iconRadius = effectiveIconSize / 2;
    const bulbDistance = 2; // Distance from icon edge to bulb
    const labelDistance = 15; // Distance between bulb and label
    const lineDistance = 1; // Distance between line and label
    
    // Calculate dimensions for both labels
    const sourceDims = getLabelDimensions(connection?.sourceInterface?.name);
    const targetDims = getLabelDimensions(connection?.targetInterface?.name);
    
    if (distance === 0) return {
      source: { x: sourceX, y: sourceY },
      target: { x: targetX, y: targetY }
    };
    
    // Calculate unit vector
    const ux = dx / distance;
    const uy = dy / distance;
    
    // Calculate bulb positions - starting from icon edge
    const sourceBulb = {
      x: sourceX + (ux * (iconRadius + bulbDistance)),
      y: sourceY + (uy * (iconRadius + bulbDistance))
    };
    
    const targetBulb = {
      x: targetX - (ux * (iconRadius + bulbDistance)),
      y: targetY - (uy * (iconRadius + bulbDistance))
    };

    // Source side positions - place label after bulb
    const sourceLabel = {
      x: sourceBulb.x + (ux * (labelDistance + sourceDims.totalWidth/2)), // Center the label after the bulb
      y: sourceBulb.y + (uy * (labelDistance + sourceDims.totalWidth/2)),
      dims: sourceDims,
      path: createEggPath(sourceDims)
    };

    // Calculate where the line should start (after source label container)
    const sourceLineStart = {
      x: sourceLabel.x + (ux * (sourceDims.totalWidth/2 + lineDistance)), // Add buffer after label
      y: sourceLabel.y + (uy * (sourceDims.totalWidth/2 + lineDistance))
    };

    // Target side positions - place label before bulb
    const targetLabel = {
      x: targetBulb.x - (ux * (labelDistance + targetDims.totalWidth/2)), // Mirror the source side positioning
      y: targetBulb.y - (uy * (labelDistance + targetDims.totalWidth/2)),
      dims: targetDims,
      path: createEggPath(targetDims)
    };

    // Calculate where the line should end (before target label container)
    const targetLineEnd = {
      x: targetLabel.x - (ux * (targetDims.totalWidth/2 + lineDistance)), // Mirror source side buffer
      y: targetLabel.y - (uy * (targetDims.totalWidth/2 + lineDistance))
    };

    return {
      source: sourceBulb,
      target: targetBulb,
      labels: {
        source: sourceLabel,
        target: targetLabel
      },
      lines: {
        sourceStart: sourceLineStart,
        targetEnd: targetLineEnd
      }
    };
  };

  // Calculate the angle for the labels
  const getLabelAngle = () => {
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return angle > 90 || angle < -90 ? angle + 180 : angle;
  };

  const points = calculateConnectionPoints();

  return (
    <ConnectionGroup
      $isDarkMode={isDarkMode}
      ref={svgRef}
      onClick={onClick}
    >
      <StyledPath
        d={getPathData(type, points)}
        strokeDasharray={getStrokeDashArray(type)}
        $selected={selected}
        $isHovered={isHovered}
        $color={lineColor}
        $isDarkMode={isDarkMode}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      {/* Source bulb to label or target bulb */}
      {showInterfaceLabels ? (
        <StyledPath
          d={`M ${points.source.x} ${points.source.y} L ${points.labels.source.x} ${points.labels.source.y}`}
          fill="none"
          $isDarkMode={isDarkMode}
          $selected={selected}
          $isHovered={isHovered}
          $color={lineColor}
        />
      ) : (
        <StyledPath
          d={`M ${points.source.x} ${points.source.y} L ${points.target.x} ${points.target.y}`}
          fill="none"
          $isDarkMode={isDarkMode}
          $selected={selected}
          $isHovered={isHovered}
          $color={lineColor}
        />
      )}

      {/* Main connection line between labels - only show when labels are visible */}
      {showInterfaceLabels && (
        <StyledPath
          d={`M ${points.lines.sourceStart.x} ${points.lines.sourceStart.y} L ${points.lines.targetEnd.x} ${points.lines.targetEnd.y}`}
          fill="none"
          $isDarkMode={isDarkMode}
          $selected={selected}
          $isHovered={isHovered}
          $color={lineColor}
        />
      )}

      {/* Target label to bulb - only show when labels are visible */}
      {showInterfaceLabels && (
        <StyledPath
          d={`M ${points.labels.target.x} ${points.labels.target.y} L ${points.target.x} ${points.target.y}`}
          fill="none"
          $isDarkMode={isDarkMode}
          $selected={selected}
          $isHovered={isHovered}
          $color={lineColor}
        />
      )}

      {/* Labels with egg-shaped containers */}
      {showInterfaceLabels && connection.sourceInterface && (
        <StyledGroup transform={`translate(${points.labels.source.x}, ${points.labels.source.y}) rotate(${getLabelAngle()})`}>
          <LabelContainer $isDarkMode={isDarkMode} d={points.labels.source.path} />
          <InterfaceLabel $isDarkMode={isDarkMode}>{connection.sourceInterface.name}</InterfaceLabel>
        </StyledGroup>
      )}

      {showInterfaceLabels && connection.targetInterface && (
        <StyledGroup transform={`translate(${points.labels.target.x}, ${points.labels.target.y}) rotate(${getLabelAngle()})`}>
          <LabelContainer $isDarkMode={isDarkMode} d={points.labels.target.path} />
          <InterfaceLabel $isDarkMode={isDarkMode}>{connection.targetInterface.name}</InterfaceLabel>
        </StyledGroup>
      )}

      {/* Glowing bulbs at the ends */}
      <ConnectionBulb cx={points.source.x} cy={points.source.y} r="4" />
      <ConnectionBulb cx={points.target.x} cy={points.target.y} r="4" />
    </ConnectionGroup>
  );
};

export default ConnectionLine;
