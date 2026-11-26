# DESIGN.md: free forever

The design system for this page. Read it before changing UI, and update it when
the system changes. Written after the index rework.

## Concept

One page of white paper with an **aligned index** on it. The page has one job:
let someone find a tool, see what "free" actually means, and read the catch, in
that order.

Three things it is not, all previously rejected:

- not a dark console (neon accent, mono micro labels, instrument panels);
- not a printed ledger (numbered gutter, red marginalia, paper tint);
- not a card stack (rounded white cards on grey, pill badges, big two-tone
  headline). That reads as a template, which is what this rewrite removes.

The rule that replaced them: **no filled boxes**. Structure comes from rules,
alignment and type, plus one colour per tier. If a piece of UI needs a border
and a shadow to exist, it is probably not needed.

## Ground and colour

| Token | Value | Use |
|:--|:--|:--|
| `--paper` | `#ffffff` | the page, top to bottom |
| `--sunk` | `#f7f8f9` | row hover, `:target` |
| `--ink` | `#14161a` | text, headings, section rules, the primary button |
| `--ink-2` | `#4a5158` | secondary copy (7.6:1 on white) |
| `--ink-3` | `#6b7280` | metadata (4.8:1 on white) |
| `--line` | `#d9dce0` | rules and control borders |
| `--line-2` | `#cdd1d6` | dotted markers |
| `--line-soft` | `#e8eaed` | row dividers, the quietest rule |

Colour appears in exactly two places, both carrying meaning:

| Tier | Value |
|:--|:--|
| Free forever | `#0f6b42` |
| Limited free | `#8a5300` |
| Reference | `#4a5568` |

`--catch` (`#a52a19`) marks the word "Catch" and the `+N more` control, nothing
else. A new element that wants a colour should get a label instead.

## Type

| Role | Family | Notes |
|:--|:--|:--|
| Display | Bricolage Grotesque | h1, h2, tool names, counts. Tracking -0.015 to -0.033em. |
| Body | IBM Plex Sans | 16px/1.55 base, 13 to 15px inside rows |
| Data | IBM Plex Mono | domains, counts, dates, list column labels, small labels |

Scale: 40 / 32 / 29 / 19 / 16 / 15 / 14.5 / 13.5 / 13 / 12.5 / 11.5 / 11px.
No uppercase micro labels and no letter-spaced kickers over every block: labels
are 11px mono at ink-3, or 12.5px sans.

## Layout

- One measure: `--wrap: 1160px`, `--pad` 16 to 32px.
- Header 56px, sticky, one hairline under it.
- Masthead: h1 left, lede right, then a rule with the counts on the left and the
  compiled note on the right.
- Toolbar: 34px controls, sticky above 780px, and not sticky on a phone, where
  three pinned rows would be most of the screen.

## The list

Three columns at 780px and up: `200px | 1fr | 30px`.

1. **Tool** column: name (link to the vendor), domain in mono, tier when the
   order is not by tier.
2. **What free gets you, and what it costs you**: the free allowance, then the
   catch with the red label and `+N more` inline.
3. A single quiet caret that opens that row's facts and sources.

A column header row names the two columns, so nothing has to be guessed.

**Tiers are stated once, not 42 times.** When the order is by tier, a group
heading (`Free forever`, `Limited free`, `Reference`) with an ink rule sits above
each block, and the per-row tier is hidden. Sorting by name or by date drops the
groups and prints the tier on each row instead.

The fact panel is flow, not a card: a three column definition list (runs as,
runs on, paid by, licence, read), then why it is on the page, then source links
with an evidence tag.

## Sections

Every section opens with a 1px ink rule and a mono kicker (`01 · The tiers`).
Nothing is boxed:

- Tiers: three columns divided by hairline verticals.
- Funding: one row per payer (210px label column, 2px share bar under the label).
- Checks: a question list with `+` at the right.
- Method: two columns divided by a hairline vertical.
- The closing statement: a 2px ink rule, then type. It used to be a black card.

## States

- Active tier tab: ink text with a 2px underline. Not a segmented pill.
- Active filter chip: ink fill, white text. The Filters button shows a count and
  turns outlined-ink while filters are on.
- Empty search: names the problem, offers two recoveries.
- `:focus-visible`: 2px ink outline, 2px offset.
- Tap targets: 34px toolbar controls, 30px dialog controls, 26px row carets.

## Motion

One settle of 0.34s on the masthead, inside `prefers-reduced-motion: no-preference`.
The caret rotates 0.15s. Nothing else moves.

## Copy rules

- No em dashes anywhere: page, `data/tools.js`, `llms.txt`, code comments. Use a
  colon, comma, full stop, bracket or semicolon.
- The page does not rank tools. `pick` in the data only orders entries inside a
  tier; it is never printed, because the method says this is not a quality
  ranking.
- Every number on screen is derived from `data/tools.js` at run time.

## Known exceptions

- **No logos and no favicons.** A favicon is a third party request, and this page
  argues that vendors should not get your requests for free. Names carry identity.
- **No page footer.** The header holds the navigation and the check date; the
  closing statement ends the page.
- **`#cards` stays empty** for older builds; the row markup is responsive, so one
  renderer serves every breakpoint.
- **Row text is not clamped.** A catch is the reason someone is on the page, and
  hiding its second line would be the wrong saving.
