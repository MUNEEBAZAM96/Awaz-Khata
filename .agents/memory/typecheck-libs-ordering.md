---
name: Typecheck requires built libs
description: api-server typecheck fails with TS6305 unless workspace libs are built first
---

The `typecheck` workflow runs only the api-server package's `tsc --noEmit`. Because api-server uses TypeScript project references to `lib/api-zod` (and `lib/db`), it fails with TS6305 ("Output file ... has not been built from source") whenever the libs' `dist` output is stale or missing.

**Why:** Project references resolve against built `.d.ts` output, not source; the libs have no per-package build script — only the root `typecheck:libs` (`tsc --build`) produces `dist`.

**How to apply:** If the `typecheck` workflow fails with TS6305, run `pnpm run typecheck:libs` at the workspace root first, then re-run. The root `pnpm run typecheck` already does this ordering.
