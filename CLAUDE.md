# raksul-r2

React 19 + TypeScript + Vite. Price matrix for printing orders. See [README.md](README.md)
for setup, architecture, and the constraints the exercise imposes (no `Intl`, no utility
libraries, no CSS frameworks) — those constraints are not negotiable, don't "fix" them by
reaching for a library.

## Editing files

- Default to surgical edits. Change only the lines that need changing.
- Rewrite a file whole only when >50% of it changes, or it's <40 lines.
- Never rewrite a file to change formatting, quotes, or import order — the formatter owns that.
- When a patch fails to apply, re-read the exact lines and retry the patch. Do not fall back
  to rewriting the file.
  
## Conventions

- A component that owns a stylesheet lives in a folder named after it: `index.tsx` plus its
  CSS module beside it (`Button/index.tsx` + `Button/Button.module.css`).
- Cross-directory imports use the `@/*` alias; same-folder imports stay relative.
- Styling is vanilla CSS Modules over the tokens in `src/styles/tokens.css`. Reference tokens
  with a literal fallback: `var(--rk-border, #e2e8f0)`.
- `priceTransformer` stays pure data (`.ts`, no JSX). Formatting and JSX belong in
  `usePriceColumns`.
- `formatNumber` is hand-rolled on purpose. Never swap it for `toLocaleString` /
  `Intl.NumberFormat`.

## Checks

Run before calling work done:

```bash
npm run lint && npx tsc -b --noEmit && npm test && npm run build
```
