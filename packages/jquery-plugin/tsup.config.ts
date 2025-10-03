import { defineConfig } from 'tsup';

export default defineConfig({
  outExtension({ format }) {
    if (format === 'iife') {
      return { js: '.js' }; // Remove .global suffix for IIFE builds
    }
    return {};
  },
});
