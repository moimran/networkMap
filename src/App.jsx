import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NetworkDiagram from './components/NetworkDiagram';
import IconPalette from './components/IconPalette';
import FileExplorer from './components/FileExplorer';
import styled from 'styled-components';
import { ThemeProvider, useTheme } from './context/ThemeContext';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: ${props => props.$isDarkMode ? '#1a1a1a' : '#ffffff'};
  color: ${props => props.$isDarkMode ? '#ffffff' : '#000000'};
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: ${props => props.$isDarkMode ? '#2d2d2d' : '#f5f5f5'};
  padding: 20px;
  border-right: 1px solid ${props => props.$isDarkMode ? '#404040' : '#ddd'};
`;

const DiagramArea = styled.div`
  flex: 1;
  padding: 20px;
`;

const AppContent = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <DndProvider backend={HTML5Backend}>
      <AppContainer $isDarkMode={isDarkMode}>
        <Sidebar $isDarkMode={isDarkMode}>
          <h2>Network Icons</h2>
          <IconPalette />
        </Sidebar>
        <DiagramArea>
          <NetworkDiagram />
        </DiagramArea>
      </AppContainer>
    </DndProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router basename="/networkmap">
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="/netdir" element={<FileExplorer />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
