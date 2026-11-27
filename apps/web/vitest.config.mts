import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/int/**/*.int.spec.ts', 'tests/unit/**/*.unit.spec.ts'],
    // The 5 s default is too tight for tests that walk a record through the approval path, on a loaded CI runner
    // (articles, dashboard and sample-pack tests timed out there and passed locally).
    testTimeout: 30_000,
  },
})
