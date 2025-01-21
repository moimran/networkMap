# Network Map

A React-based interactive network mapping application that allows users to create, visualize, and manage network diagrams with a modern and intuitive interface.

## Features

- Interactive network diagram creation
- Drag and drop functionality for network components
- Custom toolbar for network elements
- Context menu for additional operations
- Connection lines between network nodes
- Modern and responsive interface

## Tech Stack

- React v18.2.0
- Vite v5.0.8
- React DnD v16.0.1
- React DnD HTML5 Backend v16.0.1
- Styled Components v6.1.8
- Vitest v3.0.2 (Testing Framework)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd networkMap
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

## Running the Application

### Development Mode
To run the application in development mode with hot-reload:
```bash
npm run dev
# or
yarn dev
```
The application will be available at `http://localhost:3000/networkmap/`

### Production Build
To create a production build:
```bash
npm run build
# or
yarn build
```

To preview the production build:
```bash
npm run preview
# or
yarn preview
```

## Testing

The project uses Vitest as its testing framework, along with React Testing Library for component testing.

### Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Structure

- `/src/components/__tests__/` - Component tests
  - `ConnectionLine.test.jsx`
  - `ContextMenu.test.jsx`
  - `NetworkDevice.test.jsx`
  - `NetworkDiagram.test.jsx`
- `/src/test-utils/` - Testing utilities and helpers
  - `setup.js` - Test environment setup
  - `test-utils.jsx` - Common test utilities

### Testing Configuration

The testing setup includes:
- JSDOM environment for DOM manipulation
- Coverage reporting using V8 provider
- Automatic test file detection (*.test.jsx, *.spec.jsx)
- CSS Modules support
- Mock implementations for browser APIs

## Project Structure

- `/src` - Source code directory
  - `/components` - React components
    - `NetworkDiagram.jsx` - Main diagram component
    - `Toolbar.jsx` - Main toolbar component
    - `SideToolbar.jsx` - Side toolbar for additional tools
    - `ConnectionLine.jsx` - Component for network connections
    - `ContextMenu.jsx` - Right-click context menu
    - `NetworkDevice.jsx` - Network device components
  - `/contexts` - React context providers
  - `/test-utils` - Testing utilities
- `/public` - Static assets

## Scripts

- `dev` - Start development server with hot reload
- `build` - Create production build
- `preview` - Preview production build
- `test` - Run tests
- `test:watch` - Run tests in watch mode
- `test:coverage` - Run tests with coverage report
- `lint` - Run ESLint
- `server` - Run the backend server

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
