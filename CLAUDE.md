# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**IMPORTANT**: For comprehensive development guidelines, testing procedures, and AI agent rules, see **[AGENTS.md](./AGENTS.md)** - the single source of truth for all AI agents working on this codebase.

## Project Overview

Bootstrap TouchSpin is a jQuery plugin that provides a mobile and touch-friendly input spinner component for Bootstrap 3, 4 & 5. It's a number input control with increment/decrement buttons and various configuration options for styling and behavior.

## Quick Reference

### Essential Commands
- `npm test` - Run Playwright tests (already uses list reporter)
- `npm run build` - Build the project
- `PORT=8866 npm run dev` - Start development server (always use port 8866)
- `npm run check-console <url> [json|text]` - Check page for errors and TouchSpin status

### Key Files
- `src/jquery.bootstrap-touchspin.js` - **BEHAVIORAL SOURCE OF TRUTH** - Original plugin that all modern packages must replicate exactly
- `packages/core/` - Modern framework-agnostic core logic with element-attached instances
- `packages/jquery-plugin/` - jQuery wrapper that bridges to core (callable events only)
- `packages/renderers/` - Framework-specific DOM rendering (Bootstrap 3/4/5, Tailwind)

### Architecture Notes
- Modern core uses element-attached instances (`TouchSpin(element, options)`)
- Core handles ALL DOM events via data attributes (`data-touchspin-injected="up|down|wrapper"`)
- jQuery wrapper only forwards callable events, contains NO DOM event logic
- All renderer implementations must include `data-touchspin-injected` attributes for core event targeting

### TestID Strategy
When an input has `data-testid="my-spinner"`, TouchSpin automatically adds:
- `data-testid="my-spinner-wrapper"` - Container element
- `data-testid="my-spinner-up"` - Up/increment button  
- `data-testid="my-spinner-down"` - Down/decrement button
- `data-testid="my-spinner-prefix"` - Prefix element (if exists)
- `data-testid="my-spinner-postfix"` - Postfix element (if exists)

### Development Rules
- Edit `src/` only, never `dist/`
- Run `npm run build` before committing
- Use `tmp/` for temporary files (gitignored)
- Follow existing patterns and conventions
- Never run `npm run check-build-integrity` (GitHub workflow only)

## Documentation Structure

All detailed information is consolidated in AGENTS.md:
- AI Agent Rules (testing, build, debugging workflow)
- Environment Setup and build commands
- Architecture details and implementation status
- Code standards and testing conventions
- TestID strategy and debugging tools
- Progress tracking protocol for agent handoffs

## Important Instructions

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.