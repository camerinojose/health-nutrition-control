import { vi } from 'vitest';

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock window.alert
global.alert = vi.fn();

// Mock window.prompt
global.prompt = vi.fn();

