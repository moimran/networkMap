import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '../../test-utils/test-utils';
import { ThemeContext } from '../../contexts/ThemeContext';
import NetworkDiagram from '../NetworkDiagram';

// Mock the file reader API
const mockFileReader = {
  readAsText: vi.fn(),
  result: JSON.stringify({
    devices: [
      {
        id: '1',
        type: 'router',
        name: 'Router 1',
        x: 100,
        y: 100,
        interfaces: []
      }
    ],
    connections: []
  }),
  onload: null
};

global.FileReader = vi.fn(() => mockFileReader);

describe('NetworkDiagram', () => {
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
    devices: [
      {
        id: '1',
        type: 'router',
        name: 'Router 1',
        x: 100,
        y: 100,
        interfaces: [],
        icon: '/images/devices/Router-2D-Gen-Light-S.svg'
      }
    ],
    connections: [],
    onDeviceSelect: vi.fn(),
    onConnectionSelect: vi.fn(),
    deviceIcons: mockDeviceIcons,
    isDarkMode: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <ThemeContext.Provider value={mockTheme}>
        <NetworkDiagram {...defaultProps} />
      </ThemeContext.Provider>
    );
    expect(screen.getByText('Router 1')).toBeInTheDocument();
  });

  it('renders devices when provided', () => {
    render(
      <ThemeContext.Provider value={mockTheme}>
        <NetworkDiagram {...defaultProps} />
      </ThemeContext.Provider>
    );
    expect(screen.getByText('Router 1')).toBeInTheDocument();
  });

  it('calls onDeviceSelect when a device is clicked', () => {
    render(
      <ThemeContext.Provider value={mockTheme}>
        <NetworkDiagram {...defaultProps} />
      </ThemeContext.Provider>
    );
    fireEvent.click(screen.getByText('Router 1'));
    expect(defaultProps.onDeviceSelect).toHaveBeenCalled();
  });

  it('handles file import', () => {
    const file = new File(['{}'], 'network.json', { type: 'application/json' });
    render(
      <ThemeContext.Provider value={mockTheme}>
        <NetworkDiagram {...defaultProps} />
      </ThemeContext.Provider>
    );
    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });
    expect(mockFileReader.readAsText).toHaveBeenCalledWith(file);
  });
});
