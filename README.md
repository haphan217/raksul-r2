# Raksul Price Table

A printing-price matrix: pick a paper size, scan prices across delivery speed (columns) and
quantity (rows), select a cell to build an order.

Built with React 19 + TypeScript + Vite. No UI kit, no CSS framework, no utility library, no
HTTP client — those were explicit constraints of the exercise.

---

## Setup

**Prerequisites:** Node.js 20.19+ (developed on 24.3.0) and npm 10+ (developed on 11.4.2).

Add .env
```bash
VITE_DEV_API_URL=
```


```bash
npm install
```

```bash
npm run dev
```

Opens on <http://localhost:5173>.


## Architecture

```
src/
├── App/                       # page composition + layout
├── components/
│   ├── ReusableTable/         # generic table: columns[] + data[]
│   ├── pricing/               # OrderSummary, PaperSizeSelector, PriceTableSection
│   └── ui/                    # Button, Card, Select, SkeletonLoader
├── hooks/                     # usePricingData (fetch), usePriceColumns (meta -> JSX columns)
├── services/pricingApi.ts     # fetch + cache + abort + response validation
├── types/pricing.ts           # domain types + generic table contracts
├── utils/                     # formatNumber, priceTransformer (+ tests)
└── styles/tokens.css          # design tokens
```

## Tests

38 unit tests across `formatNumber` and `priceTransformer` (`npm test`). They cover thousands
grouping at every boundary, a structural check that separators land every three digits for
1–15 digit values, and the transformer's handling of empty, malformed, ragged, and
duplicate-quantity payloads.

UI interaction (hover crosshair, selection, see-more, caching, error retry, responsive layout)
was verified in a real browser against the live endpoint, not in automated tests.

---

## Time taken

Roughly **4h02m wall clock**, 09:33–13:35 with ~1 hour break, working as an AI agent with a
human reviewing and editing between turns. Spans are taken from file timestamps and so include
review gaps — they are not 4h02m of continuous typing.

| Phase | Wall clock | Notes |
| --- | --- | --- |
| Scaffold, types, formatNumber, API service + hook, transformer, UI primitives, first working table | 09:33–10:35 | ~1h. UI primitives + token layer delegated to a parallel sub-agent |
| Refactor table: row header as a real column, flat rows, crosshair hover | 10:35–11:25 | ~50m |
| Restyle: token palette, full-height/max-width shell, summary band, table treatment | 12:35–13:05 | ~30m |
| Restructure: component + co-located CSS module folders | 13:05–13:15 | ~10m |
| Unit tests: Vitest setup + 38 cases | 13:15–13:30 | ~15m |
| Absolute imports: `@/*` alias across the codebase | 13:30–13:35 | ~5m |

Verification (type-check, lint, build, browser checks) ran continuously throughout rather than
as a separate phase.
