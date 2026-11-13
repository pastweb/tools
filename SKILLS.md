# `@pastweb/tools` implementation skills

This document describes the preferred workflow for extending `@pastweb/tools`.
It complements the package boundaries in `AGENTS.md` and applies to new features,
refactors, bug fixes, tests, and public documentation.

## Start with the shared contract

1. Identify the behavior that must be shared and the consumers that depend on it.
2. Read the existing feature implementation, root exports, tests, and README before
   changing the contract.
3. Keep framework adapters thin: the mediator or primitive should own state
   transitions, event semantics, validation, and normalization; React or Vue code
   should only connect those contracts to its rendering API.
4. Reuse existing types, constants, and utility functions before introducing a
   parallel abstraction.
5. Preserve current defaults and event ordering unless the change explicitly
   changes the public contract. Record intentional changes in tests and docs.

## Organize helpers and feature modules

- Add TSDoc to every exported helper and to helpers moved into shared utility
  modules. Include at least one `@example` that uses the public import path.
- If a helper needs private constants or types, give it a feature directory with
  an `index.ts` barrel, `constants.ts`, and `types.ts`.
- When `utils.ts` grows beyond roughly 200 lines, replace it with a `utils/`
  directory containing an `index.ts` barrel and one module per helper, named after
  the exported helper.
- When a function module grows beyond roughly 50 lines because of helper logic,
  move those helpers into a sibling `utils.ts` and keep the feature entry point
  focused on its public behavior.
- Keep constants in constant case and types in PascalCase. Avoid duplicating a
  default value in both a mediator and a framework bridge.

## Design mediators and framework-neutral behavior

- Keep mediators deterministic and independently testable. Inputs should be
  explicit, and side effects should be isolated behind injected callbacks or
  adapters.
- Normalize event handlers consistently when a public API permits one handler or
  multiple handlers. Preserve the original event and argument order for every
  callback.
- Make lifecycle methods safe to call repeatedly and safe when optional callbacks
  are absent.
- Do not read framework component instances, JSX/VNodes, or framework refs from a
  shared mediator. Define a small bridge contract instead.
- For async behavior, represent loading, success, and error states explicitly and
  ensure stale results cannot overwrite newer requests.
- Keep serialization, caching, and persistence policies configurable rather than
  embedding application-specific storage decisions in a shared primitive.

## Types, exports, and compatibility

- Use precise generic constraints and discriminated unions where they clarify
  valid states. Avoid `any` in public signatures; if an escape hatch is required,
  isolate it at the adapter boundary and document why.
- Prefer additive changes. If a signature or event contract must change, update
  every public consumer, migration notes, tests, and examples in the same change.
- Export a feature from its local barrel first, then add it to the package root
  only when it is intended for general use.
- In examples, import root-exported symbols from `@pastweb/tools`; use a subpath
  only when the symbol is not available from the root or the example is explicitly
  about that subpath.

## Tests

- Use Vitest. Import assertions, suites, and lifecycle helpers from `vitest`, and
  use `vi` for spies, mocks, and timers.
- Name test titles with the `given..., when..., then...` convention so the setup,
  action, and expected behavior are obvious.
- Put tests in `tests/<feature>/<feature>.<environment>.test.ts`.
- Use `.node.test.ts` for runtime-independent or Node-oriented tests and
  `.web.test.ts` for DOM or jsdom behavior.
- Cover the normal path, defaults, optional callbacks, repeated lifecycle calls,
  error paths, and any compatibility behavior changed by the implementation.
- Run the focused feature tests first, then the package test command and type/build
  checks exposed by the package scripts. Investigate failures rather than masking
  them with looser types or skipped tests.

## README and TSDoc

README files should follow the package documentation style:

1. A short description of the package or feature.
2. A `## Features` section when the feature has multiple capabilities.
3. A multi-manager `## Installation` section when installation instructions are
   relevant.
4. A `## Documentation Overview` section for larger APIs.
5. API sections containing syntax, parameters, return values, examples, and notes
   where those details help consumers use the contract correctly.
6. A concise `## Summary` when the README covers several related APIs.

Keep examples copyable, use the same names as the exported API, and document
framework-neutral behavior before showing an adapter. Update the README and TSDoc
when defaults, events, errors, or import paths change.

## Review checklist

Before handing off a change, verify that:

- the implementation remains framework-agnostic;
- root and local exports are intentional;
- defaults and event ordering are covered by tests;
- async and error states cannot leave stale or stuck state;
- public examples use the correct package import;
- tests, type checks, and builds pass through the package's existing scripts; and
- no private or application-specific information was added to public sources.

