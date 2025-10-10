/**
 * jQuery adapter with Bootstrap 3 renderer
 * UMD bundle that auto-installs jQuery plugin using standalone Bootstrap3
 */

import { mount } from '@touchspin/standalone/bootstrap3';
import { autoInstall } from './index.js';

// Auto-install jQuery plugin with Bootstrap 3 mount function
autoInstall(mount);
