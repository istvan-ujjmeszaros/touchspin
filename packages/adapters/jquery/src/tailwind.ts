/**
 * jQuery adapter with Tailwind renderer
 * UMD bundle that auto-installs jQuery plugin using standalone Tailwind
 */

import { mount } from '@touchspin/standalone/tailwind';
import { autoInstall } from './index.js';

// Auto-install jQuery plugin with Tailwind mount function
autoInstall(mount);
