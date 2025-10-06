# Internal Documentation & Planning Files

This directory contains in-house documentation, planning materials, and meta files that are not intended for external users.

## Directory Structure

### `/ai-guides/`
AI agent instructions and documentation:
- **AGENTS.md** - AI agent overview and guidelines
- **CLAUDE.md** - Claude Code agent instructions (primary)
- **GEMINI.md** - Gemini agent instructions

### `/test-plans/`
Test planning and tracking:
- **core-test-plan.md** - Core package test plan
- **jquery-test-plan.md** - jQuery plugin test plan
- **RENDERER_ISSUES.md** - Known renderer testing issues

### `/reports/`
Internal analysis and audit reports:
- **renderer-settings-proposal.md** - Renderer settings design proposal
- **types-audit.md** - TypeScript types audit report

### Root Level
Development and planning documents:
- **ARCHITECTURE.md** - Internal architecture notes
- **BUILDING.md** - Internal build documentation
- **TESTING.md** - Internal testing documentation
- **DEVELOPMENT_WORKFLOW.md** - Development workflow guide
- **DEVELOPER_QUICK_DOCS.md** - Quick developer reference
- **TROUBLESHOOTING.md** - Internal troubleshooting guide
- **ROADMAP.md** - Project roadmap
- **FUTURE_PLANS.md** - Future feature planning
- **TEST_IMPLEMENTATION_ROADMAP.md** - Test implementation tracking
- **STEP-LEXICON.md** - Test step lexicon (generated)

## External Documentation

User-facing documentation is located in:
- **Root**: `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `MIGRATION.md`
- **`/docs/`**: Comprehensive user and developer documentation
- **Packages**: Each package has its own `README.md`

## Audit & Release Reports

Release-related documentation in `/tmp/`:
- **RELEASE_AUDIT_2025.md** - Comprehensive v5 release audit
- **FIXES_APPLIED.md** - Release readiness fixes implementation
- **RELEASE_NEXT_STEPS.md** - Release execution guide
- **EXECUTIVE_SUMMARY.md** - Audit executive summary
- **BRANCH_RENAME_PLAN.md** - Branch migration plan

---

**Note:** Files in this directory are maintained for internal development and AI agent collaboration. They are not published to npm or included in user-facing documentation sites.
