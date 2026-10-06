import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts', 'tests/security/**/*.test.ts', 'tests/e2e/**/*.test.ts'],
    exclude: ['**/node_modules/**', 'tests/sdk-consumer/**'],
    testTimeout: 20000
  }
});
