# DEF Property Maintenance — Color System

## Palette: Muskoka Slate + Warm Copper

### Darks (backgrounds, surfaces)
| Token | Hex | Use |
|-------|-----|-----|
| `--def-night` | `#0D1421` | Primary dark background |
| `--def-slate` | `#161C2D` | Secondary dark, card backgrounds |
| `--def-graphite` | `#1F2638` | Tech cards, elevated surfaces |
| `--def-stone` | `#3A4060` | Body text on light, secondary elements |

### Mids (text, UI elements)
| Token | Hex | Use |
|-------|-----|-----|
| `--def-smoke` | `#656B80` | Secondary text, labels |
| `--def-mist` | `#9BA3B8` | Tertiary text, placeholders |
| `--def-cloud` | `#CDD1DC` | Dividers, light borders |
| `--def-snow` | `#F0F2F6` | Page background (light mode) |

### Copper Accent (primary brand color)
| Token | Hex | Use |
|-------|-----|-----|
| `--def-copper` | `#A87840` | Primary actions, links, accents |
| `--def-copper-h` | `#BC8C50` | Hover state |
| `--def-copper-d` | `#845F30` | Active/pressed state |

### Nature Tones (secondary accents)
| Token | Hex | Use |
|-------|-----|-----|
| `--def-forest` | `#1A2E1C` | Deep forest accent |
| `--def-pine` | `#2D4A32` | Pine mid |
| `--def-sage` | `#4A7058` | Location icons, nature accents |

### Alert
| Token | Hex | Use |
|-------|-----|-----|
| `--def-alert` | `#C44B3B` | Error states, urgent notices |

## Usage Rules

- Copper (`#A87840`) is the ONLY accent color. Do not introduce blue, pink, purple, or other accent families.
- Page backgrounds: `--def-snow` (#F0F2F6) for light sections, `--def-night` (#0D1421) or `--def-slate` (#161C2D) for dark sections.
- Button primary: white text on copper background.
- Never use pure black or pure white — always use palette tokens.
- OMNIAGUARD brand uses blue/pink. DEF must never use those colors.
