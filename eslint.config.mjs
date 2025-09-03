import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'script', // jQuery plugins use script mode by default
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',

        // Node.js globals (for build scripts)
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',

        // jQuery globals
        $: 'readonly',
        jQuery: 'readonly',

        // UMD pattern globals
        module: 'writable',
        exports: 'writable',
        define: 'readonly',
        require: 'readonly',

        // Build-time globals
        MutationObserver: 'readonly'
      }
    },
    rules: {
      // Code quality rules (similar to JSHint settings)
      'eqeqeq': 'warn', // Relax to warning for legacy code
      'no-unused-vars': ['error', { 'args': 'none', 'vars': 'all', 'varsIgnorePattern': '^_' }], // Allow unused function parameters and variables starting with _
      'no-trailing-spaces': 'error',
      'quotes': ['error', 'single'],
      'no-undef': 'error',

      // Modern JavaScript best practices (warnings for legacy code)
      'prefer-const': 'off', // Allow var in legacy jQuery plugin
      'no-var': 'off',       // Allow var in legacy jQuery plugin
      'arrow-spacing': 'error',
      'object-shorthand': 'off', // Don't enforce for jQuery compatibility

      // Relaxed rules for jQuery plugin development
      'no-prototype-builtins': 'off',
      'no-inner-declarations': 'off'
    }
  },
  {
    // Main plugin now uses ESM module syntax
    files: ['src/jquery.bootstrap-touchspin.js'],
    languageOptions: {
      sourceType: 'module',
    },
  },
  {
    // ESM core uses module syntax
    files: ['src/core/**/*.js', 'src/wrappers/**/*.js'],
    languageOptions: {
      sourceType: 'module',
    },
  },
  {
    // Separate config for modern build scripts
    files: ['build.mjs', 'check-build-integrity.mjs', '*.config.mjs'],
    languageOptions: {
      sourceType: 'module'
    },
    rules: {
      'prefer-const': 'warn',
      'no-var': 'warn'
    }
  }
  ,
  {
    // Renderer subclasses rely on global AbstractRenderer at runtime
    files: ['src/renderers/*Renderer.js'],
    languageOptions: {
      globals: {
        AbstractRenderer: 'readonly'
      }
    }
  },
  {
    // Base class intentionally declares AbstractRenderer
    files: ['src/renderers/AbstractRenderer.js'],
    rules: {
      'no-redeclare': 'off'
    }
  }
];
