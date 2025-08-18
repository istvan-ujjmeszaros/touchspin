# AGENTS.md — ChatGPT Codex onboarding for bootstrap-touchspin

## Project
- Repo: istvan-ujjmeszaros/bootstrap-touchspin
- Working branch: `claude/bs-renderers`
- Primary code paths:
  - Plugin: `src/jquery.bootstrap-touchspin.js`
  - Renderers: `src/renderers/*`
  - Tests: `__tests__/` (Vitest + Playwright)
  - HTML fixtures: `__tests__/html/`

## Environment
- Node.js 20.x (OK to use 18+, prefer 20)
- Linux container
- Browsers for Playwright (Chromium only is fine)

### Setup (idempotent)
```bash
#!/usr/bin/env bash
set -euo pipefail
corepack enable || true
npm ci
# Install Playwright + browser deps
npx playwright install --with-deps chromium
# Build can be optional in local runs
npm run build || true
