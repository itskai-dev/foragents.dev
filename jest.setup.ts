import '@testing-library/jest-dom';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;

// Mock scrollIntoView (only in jsdom environment)
if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView = jest.fn();
}
