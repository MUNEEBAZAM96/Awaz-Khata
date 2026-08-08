---
name: api-zod barrel collision after codegen
description: Orval codegen overwrites lib/api-zod/src/index.ts and reintroduces a name collision; the barrel must be re-fixed after every codegen run.
---

**The rule:** After running `pnpm --filter @workspace/api-spec run codegen`, check `lib/api-zod/src/index.ts`. Orval appends `export * from './generated/types'`, which collides with the zod const of the same name generated for multipart bodies (e.g. `TranscribeAudioBody` exists both as a zod const in `generated/api.ts` and as a type in `generated/types`). The build fails with TS2308.

**Why:** Orval treats the barrel as generated output and rewrites it, discarding manual fixes. Multipart (file upload) endpoints always produce this const/type name pair.

**How to apply:** Rewrite the barrel with `export * from "./generated/api"` plus *explicit* `export type {...}` / `export {...}` lists from `./generated/types`, omitting any name that exists as a zod const. Also: `lib/api-zod/tsconfig.json` needs `"lib": ["es2022", "dom"]` because generated multipart types reference `File`/`Blob`.
