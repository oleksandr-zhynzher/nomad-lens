import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    exclude: ['cdk.out/**', 'dist/**', 'node_modules/**'],
    include: ['tests/**/*.test.ts'],
  },
});
