/**
 * jQuery adapter with Vanilla renderer
 * UMD bundle that auto-installs jQuery plugin using standalone Vanilla
 */

import { mount } from '@touchspin/standalone/vanilla';
import { autoInstall } from './index.js';

// Auto-install jQuery plugin with Vanilla mount function
autoInstall(mount);
