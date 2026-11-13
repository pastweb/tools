# `@pastweb/tools` contribution guide

## Package identity

`@pastweb/tools` is the framework-agnostic foundation of the Pastweb public package
graph. It contains reusable utilities, state primitives, async/query helpers,
mediators, routing support, portal/window-management primitives, and other shared
behavior consumed by the component, React, Vue, and router packages.

The package owns behavior and data contracts, not framework rendering. A change
belongs here when it can be shared by more than one consumer without importing a
UI framework.

## Architectural boundaries

- Keep the implementation independent of React, Vue, browser-specific rendering
  layers, and private application packages.
- Expose stable contracts that can be adapted by framework-specific bridges.
- Never import from `closed-source/` or introduce a dependency that points from
  the public package graph to a private package.
- Keep browser-only behavior behind an explicit, documented entry point so Node
  consumers can still import the package safely.
- Preserve compatibility for the React, Vue, router, and components packages;
  coordinate a breaking change across every affected consumer.

## Source organization

- Organize code by feature or primitive rather than by framework.
- Keep a feature's public surface in its local `index.ts` barrel and keep the
  package root exports deliberate and discoverable.
- Put shared constants and public type contracts next to the feature that owns
  them instead of duplicating them in consumers.
- Prefer named exports. Use a default export only when a documented integration
  or dynamic-loading contract requires it.

## Public API and documentation

- Treat exported types, function signatures, event names, and default behavior as
  public API.
- Prefer `@pastweb/tools` in README and TSDoc examples when a symbol is exported
  from the package root. Use a subpath only for a symbol that is not root-exported
  or when documenting that specific entry point.
- Keep public documentation safe for release: do not include private architecture,
  credentials, unpublished plans, or application-specific implementation details.

## Related guidance

Detailed implementation, testing, documentation, and review workflows are in
[`SKILLS.md`](./SKILLS.md). Apply both documents when changing this package.
