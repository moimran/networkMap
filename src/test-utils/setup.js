import '@testing-library/jest-dom';
import 'jest-styled-components';
import { vi } from 'vitest';

// Mock IntersectionObserver
class IntersectionObserver {
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
}

global.IntersectionObserver = IntersectionObserver;

// Add vi to global scope
global.vi = vi;
