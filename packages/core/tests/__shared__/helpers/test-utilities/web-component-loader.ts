import type { Page } from '@playwright/test';

/**
 * When I load the web component with bundled dependencies
 * Given I need TouchSpin web component with all dependencies resolved
 * @note Handles module resolution issues for web component testing
 */
export async function loadWebComponentWithDependencies(page: Page, debug = false): Promise<void> {
  if (debug) console.log('Loading web component with dependencies...');

  // First, we need to load the dependencies and make them available globally
  await page.evaluate(async (debug) => {
    try {
      // Create a module map for imports
      const moduleMap: Record<string, any> = {};

      // Load TouchSpin Core
      try {
        const coreModule = await import('/packages/core/dist/index.js');
        moduleMap['@touchspin/core'] = coreModule;
        if (debug) console.log('Loaded @touchspin/core module');
      } catch (err) {
        throw new Error(`Failed to load @touchspin/core: ${err}`);
      }

      // Load VanillaRenderer
      try {
        const vanillaModule = await import('/packages/renderers/vanilla/dist/index.js');
        moduleMap['@touchspin/renderer-vanilla'] = vanillaModule;
        if (debug) console.log('Loaded @touchspin/renderer-vanilla module');
      } catch (err) {
        throw new Error(`Failed to load @touchspin/renderer-vanilla: ${err}`);
      }

      // Store modules globally for the web component to use
      (window as any).__touchspinModules = moduleMap;

      // Now load the web component source and patch it
      const response = await fetch('/packages/web-component/dist/index.js');
      let componentSource = await response.text();

      // Replace import statements with references to our pre-loaded modules
      componentSource = componentSource.replace(
        /import\s+\{([^}]+)\}\s+from\s+["']@touchspin\/core["'];?/g,
        (match, imports) => {
          const cleanImports = imports.split(',').map((i: string) => i.trim());
          return cleanImports.map((imp: string) => {
            const [name, alias] = imp.split(' as ').map(s => s.trim());
            const finalName = alias || name;
            return `const ${finalName} = window.__touchspinModules['@touchspin/core'].${name};`;
          }).join('\n');
        }
      );

      componentSource = componentSource.replace(
        /import\s+\{([^}]+)\}\s+from\s+["']@touchspin\/renderer-vanilla["'];?/g,
        (match, imports) => {
          const cleanImports = imports.split(',').map((i: string) => i.trim());
          return cleanImports.map((imp: string) => {
            const [name, alias] = imp.split(' as ').map(s => s.trim());
            const finalName = alias || name;
            return `const ${finalName} = window.__touchspinModules['@touchspin/renderer-vanilla'].${name};`;
          }).join('\n');
        }
      );

      // Execute the patched component code
      const scriptElement = document.createElement('script');
      scriptElement.type = 'module';
      scriptElement.textContent = componentSource;
      document.head.appendChild(scriptElement);

      // Wait a moment for the script to execute
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify the custom element is registered
      if (!customElements.get('touchspin-input')) {
        // Try to manually register if the auto-registration didn't work
        const TouchSpinInput = (window as any).TouchSpinInput;
        if (TouchSpinInput) {
          customElements.define('touchspin-input', TouchSpinInput);
          if (debug) console.log('Manually registered touchspin-input element');
        } else {
          throw new Error('TouchSpinInput class not found after loading');
        }
      }

      if (debug) console.log('Web component loaded and registered successfully');
    } catch (err) {
      console.error('Failed to load web component with dependencies:', err);
      throw err;
    }
  }, debug);

  // Final verification
  await page.waitForFunction(
    () => customElements.get('touchspin-input') !== undefined,
    { timeout: 5000 }
  );
}

/**
 * When I initialize a web component test environment
 * Given I need a complete web component testing setup
 * @note Simplified initialization for web component tests
 */
export async function initializeWebComponentTest(page: Page, debug = false): Promise<void> {
  // Load the fixture page
  await page.goto('/packages/core/tests/__shared__/fixtures/test-fixture.html');

  // Install DOM helpers
  await page.evaluate(() => {
    if (!window.__ts) {
      window.__ts = {
        byId: (id: string) => document.querySelector(`[data-testid="${id}"]`),
        require: (id: string) => {
          const el = document.querySelector(`[data-testid="${id}"]`);
          if (!el) throw new Error(`Element not found: ${id}`);
          return el;
        },
        requireCoreByTestId: (id: string) => {
          const input = document.querySelector(`[data-testid="${id}"]`) as any;
          if (!input?._touchSpinCore) throw new Error(`TouchSpin not initialized on: ${id}`);
          return input._touchSpinCore;
        }
      };
    }
  });

  // Load web component with dependencies
  await loadWebComponentWithDependencies(page, debug);

  // Set up event logging
  await page.evaluate(() => {
    if (!window.__eventLog) {
      window.__eventLog = [];

      // Capture TouchSpin events
      document.addEventListener('touchspin-change', (e) => {
        window.__eventLog.push({
          type: 'touchspin',
          event: 'change',
          target: (e.target as any)?.dataset?.testid,
          value: (e as CustomEvent).detail?.value
        });
      }, true);

      // Capture native events
      document.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.tagName === 'INPUT') {
          window.__eventLog.push({
            type: 'native',
            event: 'change',
            target: target.dataset?.testid,
            value: target.value
          });
        }
      }, true);
    }
  });

  if (debug) console.log('Web component test environment initialized');
}