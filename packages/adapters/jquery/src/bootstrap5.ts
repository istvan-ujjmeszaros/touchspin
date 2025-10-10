/**
 * jQuery adapter with Bootstrap 5 renderer
 * UMD bundle that auto-installs jQuery plugin using standalone Bootstrap5
 */

import { mount } from '@touchspin/standalone/bootstrap5';
import { autoInstall } from './index.js';

// Auto-install jQuery plugin with Bootstrap 5 mount function
autoInstall(mount);
