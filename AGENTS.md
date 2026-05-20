# Developer Guidelines for opencode

## Environment & Tooling
*   **Runtime/Package Manager**: Use `bun` (not `npm` or `yarn`). Run commands with `bun run <script>`.
*   **Linters/Formatters**: 
    *   Linter: `oxlint` (run via `bun run lint` or `bun run lint:fix`).
    *   Formatter: `oxfmt` (run via `bun run format`).
    *   Pre-commit hooks: Uses `simple-git-hooks` to run `bun oxlint --fix` before committing.
*   **Testing**: Uses `vitest`. Run with `bun run test`.
*   **Typechecking**: Uses `tsc --noEmit`. Run with `bun run typecheck`.

## Architecture & Codebase Quirks
*   **Extension Manifest**: `manifest.json` is dynamically generated. Never edit `manifest.json` directly in the extension folder; instead, update `src/manifest.ts` and run `bun scripts/prepare.ts` (or run a full build/dev command).
*   **Site Registry**: Located in `/registry`. Site-specific scrapers must use `defineRegistry` from `registry/types/index.ts`. All registries are bundled dynamically at compile-time using Vite's `?all-registry` loader query.
*   **Asset Imports**: Custom asset loaders exist in Vite/bundler configuration. For example, binary files (like fonts) are imported using `?uint8array&base64` query strings (e.g. `import Font from "~/assets/...ttf?uint8array&base64"`).
*   **Content Scripts**:
    *   Core components are built as Vue Custom Elements (`.ce.vue` files) under `src/contentScripts/ce/` and registered dynamically via `src/contentScripts/ce/register.ts`.
    *   Core logic files (like `generate-epub.ts`, `generate-cbz.ts`) are in `src/contentScripts/logic/`.
    *   Shared utility functions for rate-limiting, CORS-safe fetches, and helpers reside in `src/contentScripts/logic/utils.ts`.

## Build Verification Steps
Always execute the following workflow sequentially after modifying code:
1.  `bun run lint:fix` & `bun run format`
2.  `bun run typecheck`
3.  `bun run test`
4.  `bun run build` (Ensures that custom Vite plugins and CSS-CE scripts compile without bundling errors).
