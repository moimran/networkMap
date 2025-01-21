import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '../../test-utils/test-utils';
import { ThemeContext } from '../../contexts/ThemeContext';
import NetworkDevice from '../NetworkDevice';

describe('NetworkDevice', () => {
  const mockTheme = {
    isDarkMode: false,
    toggleTheme: vi.fn()
  };

  const mockDeviceIcons = {
    router: {
      light: '/images/devices/Router-2D-Gen-Light-S.svg',
      dark: '/images/devices/Router-2D-Gen-Dark-S.svg'
    },
    switch: {
      light: '/images/devices/Switch-2D-Gen-Light-S.svg',
      dark: '/images/devices/Switch-2D-Gen-Dark-S.svg'
    }
  };

  const defaultProps = {
    id: '1',
    x: 100,
    y: 100,
    type: 'router',
    name: 'Test Router',
    interfaces: [],
    onDeviceClick: vi.fn(),
    onContextMenu: vi.fn(),
    isSelected: false,
    onInterfaceClick: vi.fn(),
    deviceIcons: mockDeviceIcons,
    isDarkMode: false,
    icon: '/images/devices/Router-2D-Gen-Light-S.svg'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders device with correct name', () => {
    render(
      <ThemeContext.Provider value={mockTheme}>
        <NetworkDevice {...defaultProps} />
      </ThemeContext.Provider>
    );
    expect(screen.getByText('Test Router')).toBeInTheDocument();
  });

  it('calls onDeviceClick when clicked', () => {
    render(
      <ThemeContext.Provider value={mockTheme}>
        <NetworkDevice {...defaultProps} />
      </ThemeContext.Provider>
    );
    fireEvent.click(screen.getByText('Test Router'));
    expect(defaultProps.onDeviceClick).toHaveBeenCalled();
  });

  it('calls onContextMenu when right-clicked', () => {
    render(
      <ThemeContext.Provider value={mockTheme}>
        <NetworkDevice {...defaultProps} />
      </ThemeContext.Provider>
    );
    fireEvent.contextMenu(screen.getByText('Test Router'));
    expect(defaultProps.onContextMenu).toHaveBeenCalled();
  });

  it('applies selected styles when isSelected is true', () => {
    const { container } = render(
      <ThemeContext.Provider value={mockTheme}>
        <NetworkDevice {...defaultProps} isSelected={true} />
      </ThemeContext.Provider>
    );
    const deviceContainer = container.firstChild;
    expect(deviceContainer).toHaveStyle({
      border: '2px solid #4CAF50'
    });
  });

  it('renders interfaces when provided', () => {
    const propsWithInterfaces = {
      ...defaultProps,
      interfaces: [
        { id: '1', name: 'eth0', x: 0, y: 0 },
        { id: '2', name: 'eth1', x: 0, y: 0 }
      ]
    };
    render(
      <ThemeContext.Provider value={mockTheme}>
        <NetworkDevice {...propsWithInterfaces} />
      </ThemeContext.Provider>
    );
    expect(screen.getByText('eth0')).toBeInTheDocument();
    expect(screen.getByText('eth1')).toBeInTheDocument();
  });
});
