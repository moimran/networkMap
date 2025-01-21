import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import ContextMenu from '../ContextMenu';

// Mock theme
const theme = {
  colors: {
    primary: '#4CAF50',
    secondary: '#2196F3',
    background: '#ffffff',
    text: '#000000'
  }
};

const TestWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('ContextMenu', () => {
  const defaultProps = {
    x: 100,
    y: 100,
    interfaces: [
      { name: 'eth0', id: '1' },
      { name: 'eth1', id: '2' }
    ],
    usedInterfaces: ['eth1'],
    onSelect: vi.fn(),
    onClose: vi.fn(),
    onDelete: vi.fn()
  };

  const customRender = (ui, options) =>
    render(ui, { wrapper: TestWrapper, ...options });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders interface menu items', () => {
    customRender(<ContextMenu {...defaultProps} />);
    expect(screen.getByText('Select Interface')).toBeInTheDocument();
    expect(screen.getByText('eth0')).toBeInTheDocument();
    expect(screen.getByText('eth1 (in use)')).toBeInTheDocument();
  });

  it('renders delete option', () => {
    customRender(<ContextMenu {...defaultProps} />);
    expect(screen.getByText('Delete Device')).toBeInTheDocument();
  });

  it('calls onSelect when clicking an available interface', () => {
    customRender(<ContextMenu {...defaultProps} />);
    fireEvent.click(screen.getByText('eth0'));
    expect(defaultProps.onSelect).toHaveBeenCalledWith(defaultProps.interfaces[0]);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('does not call onSelect when clicking a used interface', () => {
    customRender(<ContextMenu {...defaultProps} />);
    fireEvent.click(screen.getByText('eth1 (in use)'));
    expect(defaultProps.onSelect).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('calls onDelete when clicking delete option', () => {
    customRender(<ContextMenu {...defaultProps} />);
    fireEvent.click(screen.getByText('Delete Device'));
    expect(defaultProps.onDelete).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
