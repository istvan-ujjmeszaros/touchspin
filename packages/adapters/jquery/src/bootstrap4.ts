/**
 * jQuery adapter with Bootstrap 4 renderer
 * UMD bundle that auto-installs jQuery plugin using standalone Bootstrap4
 */

import { mount } from '@touchspin/standalone/bootstrap4';
import { autoInstall } from './index.js';

// Auto-install jQuery plugin with Bootstrap 4 mount function
autoInstall(mount);
