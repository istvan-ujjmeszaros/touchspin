# TouchSpin - Project Guide

## 🎯 Project Overview

TouchSpin is a modern numeric input spinner library with multiple framework renderers (Bootstrap 3/4/5, Tailwind, Vanilla).

**Mission**: Achieve 100% test coverage with clean, behavioral tests.

## 📁 Project Structure

```
packages/
  core/              # Core engine (renderer-agnostic)
  jquery-plugin/     # jQuery wrapper
  renderers/
    bootstrap3/      # Bootstrap 3 renderer
    bootstrap4/      # Bootstrap 4 renderer
    bootstrap5/      # Bootstrap 5 renderer
    vanilla/         # Vanilla CSS renderer
    tailwind/        # Tailwind CSS renderer
  web-component/     # Web component wrapper
```

## 🔧 Development Workflow

### Quick Start

```bash
yarn dev          # Watch mode + static server + test UI (recommended)
yarn test         # Run all tests
yarn build        # Build production artifacts
```

### Available Commands

**Development:**
- `yarn dev` - Watch mode + static server
- `yarn watch` - Watch all packages (production builds)
- `yarn watch:test` - Watch all packages (test builds)
- `yarn test:dev` - Watch + serve + test UI

**Testing:**
- `yarn test` - Run all tests
- `yarn exec playwright test packages/core/tests/` - Run specific package
- `yarn exec playwright test --ui` - Debug mode with UI

**Coverage:**
- `yarn coverage:build` - Build with coverage instrumentation
- `yarn coverage:all <path>` - Run coverage for specific package
- `yarn coverage:merge` - Merge coverage data
- `yarn coverage:report` - Generate HTML report (view at `reports/coverage/index.html`)

**Build:**
- `yarn build` - Build all packages (incremental, fast)
- `yarn build:test` - Build test artifacts (incremental)
- `yarn build:clean` - Clean build (removes stale artifacts, then builds)
- `yarn clean:devdist` - Remove all devdist build artifacts (preserves external assets)

**Utilities:**
- `yarn test:guard` - Validate Gherkin test checklists
- `yarn lexicon:gen` - Generate step lexicon from helper docs
- `yarn inspect <url>` - Inspect page for errors/TouchSpin status

## 🧪 Testing

**For test-related work, use the specialized testing agent:**

```bash
# When I need to work on tests, I'll invoke the testing agent
# Example: "Implement the remaining bootstrap5 renderer tests"
# Example: "Improve coverage for the core package"
# Example: "Debug failing test in step-calculations.spec.ts"
```

The testing agent has complete knowledge of:
- Test implementation rules and patterns
- Coverage improvement strategies
- Gherkin format and step lexicon
- Helper usage and best practices
- Debugging techniques
- All testing-specific gotchas

**Quick Testing Rules:**
- Always use helpers from `@touchspin/core/test-helpers`
- Never import from `/src/` in tests (use `/dist/`)
- Use `data-testid` selectors only
- Keep tests simple (10-30 lines, one behavior)
- See `TEST_IMPLEMENTATION_ROADMAP.md` for current status

**Test-Driven Development (TDD) Workflow:**

When asked to write a test for a bug/issue:
1. **Write the test FIRST** - Use the playwright-test-writer agent to create the test
2. **Verify it FAILS** - Run the test to confirm it catches the bug
3. **Fix the issue** - Make the minimal code changes to fix the bug
4. **Verify it PASSES** - Run the test again to confirm the fix works

**IMPORTANT**: Never fix the bug before writing the test. The failing test proves the bug exists and that our fix actually works.

## 📝 Git Workflow

### Creating Commits

When asked to commit changes:
1. Run `git status` and `git diff` to see changes
2. Review recent commits (`git log`) for message style
3. Stage relevant files with `git add`
4. Create commit with message ending in:
   ```
   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

**Never:**
- Update git config
- Run destructive commands (force push, hard reset) without explicit request
- Skip hooks (--no-verify)
- Commit files with secrets (.env, credentials.json)

### Creating Releases / Changesets

- Use the Changesets CLI to record version bumps. Run `yarn changeset` (no arguments) and follow the prompt rather than editing files in `.changeset/` manually.
- After adding a changeset, commit the generated Markdown file. Do **not** modify release workflows or package.json versions by hand—the GitHub `changesets/action` workflow will run `yarn changeset version` and commit the package.json changes for you when a release PR is created.
- When the repo is in prerelease mode (see `.changeset/pre.json`), leave the configuration intact unless explicitly asked to exit prerelease with `yarn changeset pre exit`.
- Never delete or rename existing changeset files without confirmation; they are required for the automated release job to succeed.

### Creating Pull Requests

When asked to create a PR:
1. Check current branch status and commits since main
2. Review all changes that will be included
3. Push to remote if needed
4. Use `gh pr create` with summary and test plan:
   ```bash
   gh pr create --title "PR title" --body "$(cat <<'EOF'
   ## Summary
   - Key changes

   ## Test plan
   - [ ] Test item 1
   - [ ] Test item 2

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   EOF
   )"
   ```

## 🏗️ Build System

**Key Concepts:**
- TypeScript compiles to `/dist/` (production) and `/devdist/` (development)
- Tests use `/devdist/` artifacts (auto-updated by watch mode)
- Renderer packages commit external framework assets to `/devdist/external/`
- Build guards ensure proper package build order

**IIFE vs ESM:**
- Renderer tests use IIFE bundles (globals like `window.Bootstrap5Renderer`)
- IIFE bundles have all dependencies bundled (no bare imports)
- ESM builds used for production distribution

### Build Commands & When to Use Each

**`yarn build:test` - Daily Development (Incremental)**
- ✅ Fast incremental builds (only rebuilds changed files)
- ✅ Preserves existing artifacts
- ⚠️ May leave stale artifacts if source files were deleted
- **Use for:** Daily development, when working on a single package

**`yarn build:clean` - Clean Slate (Nuclear)**
- ✅ Removes all stale artifacts before building
- ✅ Guarantees clean state
- ✅ Preserves external framework assets (Bootstrap, jQuery, etc.)
- ⏱️ Slower (full rebuild)
- **Use for:** After git pull, switching branches, when things seem broken, CI/CD

**`yarn clean:devdist` - Manual Cleanup**
- Removes all `.js`, `.d.ts`, `.map`, `.css` files from devdist
- Preserves `external/` directories (committed framework assets)
- **Use for:** Troubleshooting build issues, before clean build

**`yarn watch:test` - Active Development**
- Continuous incremental builds as you edit
- Fast feedback loop
- **Use for:** Development with `yarn dev`

### Stale Artifact Problem

**Problem:** When source files are deleted (e.g., removing `touchspin-bs5-complete.ts`), the compiled artifact (`touchspin-bs5-complete.global.js`) remains in devdist. Tests that reference this file will load stale, outdated code.

**Solution:** Use `yarn build:clean` after structural changes (file deletions, renames, refactors) to ensure devdist is in sync with source.

**Example:**
```bash
# After git pull or switching branches
yarn build:clean

# Normal development
yarn dev  # Uses incremental watch

# Troubleshooting "things work in main but not here"
yarn build:clean && yarn test
```

## 📚 Documentation

- `TEST_IMPLEMENTATION_ROADMAP.md` - Current test implementation status
- `tests/STEP-LEXICON.md` - Auto-generated helper function reference
- `.claude/agents/testing.yaml` - Complete testing knowledge base

## 🔍 Temporary Files

Use `/apps/bootstrap-touchspin-openai/tmp/` for:
- Temporary documentation
- Progress tracking
- Work-in-progress notes

## 💡 Key Principles

1. **Simplicity** - Keep code and tests simple and focused
2. **Use existing tools** - Leverage helpers, utilities, and patterns
3. **Test coverage** - Every line should be tested with meaningful tests
4. **Clean commits** - Clear messages, proper attribution
5. **Ask when unsure** - Better to clarify than assume

---

**For detailed testing instructions, coverage strategies, and test implementation, consult the testing agent.**
