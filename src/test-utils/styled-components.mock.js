import React from 'react';

// Create a mock styled function that returns a basic component
const mockStyled = (Component) => {
  return (strings, ...interpolations) => {
    const StyledComponent = React.forwardRef((props, ref) => {
      if (typeof Component === 'string') {
        return React.createElement(Component, { ...props, ref });
      }
      return React.createElement(Component, { ...props, ref });
    });
    StyledComponent.displayName = `Styled(${Component.displayName || Component.name || Component})`;
    return StyledComponent;
  };
};

// Create proxy handler to handle all DOM elements
const handler = {
  get(target, prop) {
    if (prop === '__esModule') {
      return { default: mockStyled };
    }
    if (typeof prop === 'string' && !target[prop]) {
      target[prop] = mockStyled(prop);
    }
    return target[prop];
  },
};

// Create the mock styled object
const styled = new Proxy({}, handler);

// Add commonly used styled-components exports
styled.createGlobalStyle = () => () => null;
styled.css = (...args) => args;
styled.keyframes = () => 'animation-id';
styled.ThemeProvider = ({ children }) => children;
styled.ThemeContext = { Consumer: ({ children }) => children({}) };
styled.withTheme = (Component) => (props) => React.createElement(Component, props);

export default styled;
