---
name: api-zod barrel after codegen
description: What orval codegen does (and does not) touch in lib/api-zod, and the required barrel maintenance step
---

The `lib/api-zod/src/index.ts` barrel is hand-written with EXPLICIT export lists because `export * from "./generated/types"` collides with same-named zod consts in `./generated/api` (e.g. `TranscribeAudioBody` exists as both a zod const and a type).

**Observed 2026-08-08:** orval's `clean: true` wipes only the `src/generated/` output folders — the hand-written barrel SURVIVES codegen. The real maintenance step is: after adding endpoints/schemas to `openapi.yaml` and running codegen, ADD the new generated type names (and any enum consts, e.g. `ChatMessageRole`) to the barrel's explicit export lists, or downstream imports fail.

**How to apply:** `pnpm --filter @workspace/api-spec run codegen` already chains `typecheck:libs`, which catches both collisions and missing exports immediately — trust that signal instead of assuming the barrel was clobbered.

Also note: generated zod consts are PascalCase (`AskAdvisorBody`), matching the type names — not camelCase.
