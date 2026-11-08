# DESIGN.md — free forever

The design system for this page. Read it before changing UI; update it when the
system changes. Written after the audit-ledger rework.

## Concept

The page is a **ruled audit sheet**, not a set of cards. Entries sit inside the
document's rules; nothing floats above it. That choice comes from the content:
the whole product is a claim about who pays, so the surface behaves like a
statement with figures, hairlines and margin notes.

Anti-reference (what this replaced): warm cream ground, rounded cards with soft
shadows, coloured 3px side tabs, a small tracked kicker above every heading.
Those are the defaults of every generated directory page and are out of bounds
here.

## Ground and ink

| Token | Value | Use |
|:--|:--|:--|
| `--paper` | `#f2f3ee` | page ground (cool, green-grey — deliberately not cream) |
| `--paper-2` | `#e7e9e1` | pressed/hover fills |
| `--ink` | `#0f110c` | body text, structural rules, inverted blocks |
| `--ink-2` | `#3a3e35` | secondary copy (9.8:1 on paper) |
| `--ink-3` | `#5f6457` | metadata (5.5:1 on paper) |
| `--rule` | `#b4bba6` | row hairlines (1.8:1 — structural, not text) |
| `--rule-strong` | `#a2a899` | control borders |

Semantic colours encode **who pays**, never decoration:

| Token | Value | Meaning | Contrast on its wash |
|:--|:--|:--|:--|
| `--green` | `#0d6b3d` | free forever | 5.4:1 |
| `--amber` | `#8a4a0a` | limited / vendor-probed | 5.6:1 |
| `--grey` | `#565a50` | reference | 5.7:1 |
| `--flag` | `#a2331c` | the catch | 5.7:1 |

Every text pair clears 4.5:1. Do not grey secondary text on a tinted surface;
tint it from the hue.

## Type

| Role | Family | Notes |
|:--|:--|:--|
| Display | Bricolage Grotesque | headings, entry names, pitch lines. Tracking floor −0.035em. |
| Body | IBM Plex Sans | 16px/1.6 base, 65–75ch measure |
| Figures / labels | IBM Plex Mono | counts, sources, timestamps; `font-variant-numeric: tabular-nums` |

Scale: 84 / 76 / 42 / 34 / 20 / 18 / 16 / 14 / 13 / 12px. **No functional text
below 12px.** Uppercase mono is reserved for labels and figures, never prose.

## Structure

- One measure: `--max: 1280px`, `--pad` steps 20 → 32 → 40 → 48 → 56px.
- Square corners everywhere. No border radius, no box shadows.
- Hierarchy is carried by **hairline rules and space**, not containers.
  `1px solid var(--ink)` opens a section; `1px solid var(--rule)` separates rows.
- Multi-item blocks (defs, funding, method) are ruled columns separated by
  vertical hairlines, with the outer column flush to the container edge.
- Tier colour appears as a 3px top rule on the tier statement and as an outlined
  tag on entries. Never as a thick side tab.

## Entries

- **≥1024px** — one row per tool: identity (196–214px) · facts · catch margin
  note · meta. Rows are separated by hairlines; hover tints the row.
- **<1024px** — one stacked entry per tool, also hairline-separated.
- Exactly **one rendering is visible per breakpoint**. `.stack` is declared
  before the desktop media query on purpose; if it moves later in the file it
  overrides `display: none` and every tool renders twice.
- The catch is a margin note on a 1px `--flag` rule. All catch points are
  reachable through a real disclosure button (`aria-expanded`), never a dead
  "+ N more" line.

## States

- Empty search: names the problem and offers two recoveries (clear search, show
  all 42). Never a dead end.
- Filter chips are a single-select tab set: `aria-pressed` mirrors `is-on`.
- `:focus-visible` is a 2px `--green` outline at 3px offset on every control.
- Tap targets ≥ 24px (chips 42px, tags 26px, buttons 44px).
- `::selection` is a green wash; carets are green; scrollbars are themed.

## Motion

One authored moment: the hero statement, lede and tier figures resolve once with
a blur + clip-path rise, 0.7s on `cubic-bezier(.16, 1, .3, 1)`. Nothing else
animates on entry. Hover and focus transitions are 120–160ms. All of it is
inside `prefers-reduced-motion: no-preference`.

## Known exceptions

- **Google Fonts.** The three faces load from `fonts.googleapis.com` with
  `display=swap`; the page is otherwise offline-capable. There is a small FOUT
  layout shift on a cold cache.
- **Detector `cramped-padding` on `.fund`** is a verified false positive: the
  funding list is a ruled register whose text aligns to the column rule by
  design, not a bordered card. Insetting it would break alignment with the
  section heading.
- Entry facts are line-clamped at 4 lines on desktop by design; the full text is
  in the phone layout and the structured data.
