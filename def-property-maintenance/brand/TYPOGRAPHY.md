# DEF Property Maintenance — Typography System

## Font Stack

| Role | Font | Fallback | CSS Variable |
|------|------|----------|-------------|
| Display / Headlines | Playfair Display (600–800) | Georgia, serif | `--font-display` |
| Body / UI | Inter | DM Sans, system-ui | `--font-body` |
| Labels / Mono UI | Space Grotesk | DM Sans, system-ui | `--font-label` |

## Scale

| Class | Size | Use |
|-------|------|-----|
| Display hero | `clamp(2.5rem, 6vw, 5rem)` | Page hero headlines |
| H1 page | `clamp(2.25rem, 5vw, 4rem)` | Section hero |
| H1 content | `clamp(2rem, 4vw, 3rem)` | Inner page titles |
| H2 | `clamp(1.75rem, 3.5vw, 2.75rem)` | Section headings |
| H3 | `1.25rem` | Card titles |
| Body large | `1.125rem` | Intro paragraphs |
| Body base | `1rem` | Default body |
| Body small | `0.875rem` | Secondary text, lists |
| Label | `0.75rem` | Badges, eyebrows, captions |
| Micro | `0.625rem` | Legal notes, attributions |

## Voice Characteristics

- Professional but approachable — cottage country tone, not corporate
- Direct and specific — no vague marketing language
- Honest — never overclaim services or capabilities
- Canadian spelling throughout: neighbour, colour, centre, programme
- Em dashes for parenthetical phrases (not hyphens)
- Trademark symbol on AI Property 360™ — always, every mention

## Eyebrow Pattern

Short uppercase labels above headlines, styled with `.eyebrow` class:
```
<span className="eyebrow">What We Do</span>
```
Paired with copper copper-line decorators on either side in centered contexts.
