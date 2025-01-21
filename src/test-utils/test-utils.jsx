import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ThemeContext } from '../contexts/ThemeContext';
import { vi } from 'vitest';

// Mock theme
const theme = {
  colors: {
    primary: '#4CAF50',
    secondary: '#2196F3',
    background: '#ffffff',
    text: '#000000'
  }
};

// Mock theme context value
const themeContextValue = {
  isDarkMode: false,
  toggleTheme: vi.fn()
};

const AllTheProviders = ({ children }) => {
  return (
    <ThemeContext.Provider value={themeContextValue}>
      <ThemeProvider theme={theme}>
        <DndProvider backend={HTML5Backend}>
          {children}
        </DndProvider>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render, vi };
