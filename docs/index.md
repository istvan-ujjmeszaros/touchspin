# TouchSpin Documentation Hub

Your entry point for architecture, extension, and reference material across the TouchSpin monorepo. Start here to explore how the TypeScript codebase is structured, how to extend it, and where to find legacy notes.

## 🧭 Start Here

| Topic | Read This | Why |
|-------|-----------|-----|
| Modern architecture overview | [Architecture Overview](architecture/overview.md) | Understand package roles, runtime flow, and extensibility points |
| Evolution history | [Architecture History](architecture/history.md) | See how the project moved from jQuery to modular TypeScript |
| Migrating legacy code | [Migration Guide](architecture/migration-guide.md) | Align older integrations with the current API |
| Adding a renderer | [Renderer Guide](architecture/renderer-guide.md) & [Creating a Custom Renderer](architecture/creating-custom-renderer.md) | Build support for another design system |
| Framework wrappers | [Framework Wrapper Guide](architecture/framework-wrapper-guide.md) | Wrap the core for React, Vue, Angular, or Web Components |

## 🔍 Quick Navigation

- **Architecture Analysis**: [Method comparison](architecture/methods-and-evolution.md), [migration guide](architecture/migration-guide.md), [three-stage evolution](architecture/three-stage-evolution.md)
- **Reference**: [API quick reference](reference/api-quick-reference.md), [options ↔ feature matrix](reference/options-feature-matrix.md), [event matrix](reference/event-matrix.md), [renderer checklist](reference/renderer-checklist.md), [options & events overview](reference/options-and-events.md)
- **Visuals**: Core diagrams live in [architecture/diagrams/](architecture/diagrams/) (overview, data flow, initialization, event timeline, boundary handling, more)
- **Legacy Archive**: Historical pseudo-code, JSON models, and test traceability live under [legacy/](legacy/) for research only

## 📚 Suggested Workflows

- **New contributor** → read the [Architecture Overview](architecture/overview.md), then skim [Architecture History](architecture/history.md) for context.
- **Porting a legacy project** → follow the [Migration Guide](architecture/migration-guide.md) and consult the [event matrix](reference/event-matrix.md) for differences.
- **Implementing a renderer** → start with the [Renderer Guide](architecture/renderer-guide.md), then dive into [Creating a Custom Renderer](architecture/creating-custom-renderer.md) and the [renderer checklist](reference/renderer-checklist.md).
- **Publishing framework bindings** → review the [Framework Wrapper Guide](architecture/framework-wrapper-guide.md) and reuse the patterns shown there.
- **Debugging behavior** → inspect the [event lifecycle diagram](architecture/diagrams/event-lifecycle.md) alongside the [options matrix](reference/options-feature-matrix.md) and [options & events overview](reference/options-and-events.md).

