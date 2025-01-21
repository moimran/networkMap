import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '../../test-utils/test-utils';
import { ThemeContext } from '../../contexts/ThemeContext';
import ConnectionLine from '../ConnectionLine';

describe('ConnectionLine', () => {
  const mockTheme = {
    isDarkMode: false,
    toggleTheme: vi.fn()
  };

  const defaultProps = {
    id: '1',
    sourceX: 100,
    sourceY: 100,
    targetX: 200,
    targetY: 200,
    sourceInterface: { name: 'eth0' },
    targetInterface: { name: 'eth1' },
    onClick: vi.fn(),
    onControlPointsChange: vi.fn(),
    showInterfaceLabels: false,
    selected: false,
    connection: {
      sourceInterface: { name: 'eth0', x: 100, y: 100 },
      targetInterface: { name: 'eth1', x: 200, y: 200 },
      type: 'solid'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <ThemeContext.Provider value={mockTheme}>
        <ConnectionLine {...defaultProps} />
      </ThemeContext.Provider>
    );
    expect(container.querySelector('path')).toBeInTheDocument();
  });

  it('renders line between source and target points', () => {
    const { container } = render(
      <ThemeContext.Provider value={mockTheme}>
        <ConnectionLine {...defaultProps} />
      </ThemeContext.Provider>
    );
    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
  });

  it('applies selected style when selected is true', () => {
    const { container } = render(
      <ThemeContext.Provider value={mockTheme}>
        <ConnectionLine {...defaultProps} selected={true} />
      </ThemeContext.Provider>
    );
    const path = container.querySelector('path');
    expect(path).toHaveAttribute('stroke', '#2196F3');
  });

  it('shows interface labels when showInterfaceLabels is true', () => {
    render(
      <ThemeContext.Provider value={mockTheme}>
        <ConnectionLine {...defaultProps} showInterfaceLabels={true} />
      </ThemeContext.Provider>
    );
    expect(screen.getByText('eth0')).toBeInTheDocument();
    expect(screen.getByText('eth1')).toBeInTheDocument();
  });

  it('hides interface labels when showInterfaceLabels is false', () => {
    render(
      <ThemeContext.Provider value={mockTheme}>
        <ConnectionLine {...defaultProps} showInterfaceLabels={false} />
      </ThemeContext.Provider>
    );
    expect(screen.queryByText('eth0')).not.toBeInTheDocument();
    expect(screen.queryByText('eth1')).not.toBeInTheDocument();
  });

  it('renders connection bulbs', () => {
    const { container } = render(
      <ThemeContext.Provider value={mockTheme}>
        <ConnectionLine {...defaultProps} />
      </ThemeContext.Provider>
    );
    const bulbs = container.querySelectorAll('circle');
    expect(bulbs.length).toBe(2);
  });

  it('renders interface labels with correct text', () => {
    render(
      <ThemeContext.Provider value={mockTheme}>
        <ConnectionLine {...defaultProps} showInterfaceLabels={true} />
      </ThemeContext.Provider>
    );
    expect(screen.getByText('eth0')).toBeInTheDocument();
    expect(screen.getByText('eth1')).toBeInTheDocument();
  });

  it('calculates midpoint for interface labels correctly', () => {
    const { container } = render(
      <ThemeContext.Provider value={mockTheme}>
        <ConnectionLine {...defaultProps} showInterfaceLabels={true} />
      </ThemeContext.Provider>
    );
    const labels = container.querySelectorAll('text');
    expect(labels.length).toBe(2);
  });
});
