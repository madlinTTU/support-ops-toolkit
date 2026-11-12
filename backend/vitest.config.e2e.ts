import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['tests/**/*.e2e-spec.ts'],
    // The first start of a PostgreSQL container can take a while.
    hookTimeout: 120_000,
    testTimeout: 60_000,
  },
})
