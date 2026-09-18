# Session token analysis

One AI-assisted build session (2026-09-17, 09:33–13:49, 196 model turns).
**~4.9M effective tokens** — 22.2M raw, weighted at 0.1x for cached re-reads, 2x for cache
writes, 5x for generated output.

## Where it went

| Group | Effective | Share |
| --- | --- | --- |
| Instructions re-read every turn (system prompt + tool list) | 1,643k | 33% |
| Code written into files | 1,441k | 29% |
| Answers + thinking | 478k | 10% |
| Reminders / skill + tool listings injected mid-session | 473k | 10% |
| Sub-agent (UI primitives + CSS) | 321k | 7% |
| Shell output (builds, tests, greps) | 273k | 6% |
| Browser verification | 153k | 3% |
| Design images + user messages | 126k | 3% |


## Major findings

1. **Fixed overhead is the single largest line item.** Nobody authored it during the session — it is the cost of starting a turn.
2. **Writing code is the largest *controllable* cost.** Whole-file rewrites of `ReusableTable`, `OrderSummary` and the CSS
   modules dominated this line.
3. **Inputs and Verification was cheap.**
4. **Churn was invisible but real.** Formatter-rewritten quotes broke string-match patches
   between turns, costing re-reads and re-patches; a non-compositing browser pane produced
   stalled CSS transitions and a zero-size viewport, so several measurements had to be redone.

## Lessons / solutions

| Lesson | Applied as |
| --- | --- |
| Patch, don't rewrite — rewrite only if >50% changes or the file is <40 lines | Rule in [CLAUDE.md](CLAUDE.md) |
| Let the formatter own quotes/import order; never rewrite a file for style | Rule in [CLAUDE.md](CLAUDE.md) |
| Delegate self-contained chunks — the sub-agent produced 8 files for 7% of spend, in parallel | Use sub-agents for isolated file sets |
| Batch related asks into one turn; fixed per-turn overhead makes small turns proportionally wasteful | e.g. "restructure folders **and** switch to absolute imports" |
| Make the browser pane visible before UI verification | Avoids re-measuring stalled transitions |

