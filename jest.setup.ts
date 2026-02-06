// Only load DOM matchers in jsdom tests.
if (typeof window !== 'undefined') {
  require('@testing-library/jest-dom');
}
