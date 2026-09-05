# DEF Property Maintenance — Business Card Spec

## Physical Specifications

- **Dimensions:** 3.5 × 2 inches (standard North American business card)
- **Bleed:** 0.125 inches on all sides
- **Safe zone:** 0.25 inches from all edges
- **Resolution:** 300 DPI minimum for print
- **Color mode:** CMYK for print (RGB for digital preview)
- **File format:** PDF/X-1a for print submission

## Card Front

### Content
```
DEF PROPERTY MAINTENANCE           [eyebrow / small caps]

Dylan Eric Francisco               [Playfair Display, 22pt]
Founder & Operator                 [Space Grotesk, 10pt, smoke]

📍 Kawarthas • Muskoka • Surrounding Areas
🛡 Property Maintenance & Security-Focused Specialist
⚙ AI Property 360™
```

### Design
- Background: Gradient from `#161C2D` to `#1F2638`
- Subtle grid overlay at 3% opacity
- Copper glow radial gradient top-right corner
- Copper accent: `#A87840`
- Copper horizontal rule beneath name
- Bottom left: DEF wordmark area
- Bottom right: optional subtle texture

## Card Back

### Content
```
AI PROPERTY 360™                   [eyebrow, copper]

• Property Maintenance
• Cottage Care
• Property Inspections
• Locksmith Services
• Security-Focused Services
• AI Property 360™

[QR CODE]                          [bottom right, 0.75 × 0.75 in]
Scan to consult
```

### QR Code
- Points to: `DEF_PUBLIC_URL/consultation` (configurable from env)
- Must be generated with actual URL before print production
- Minimum size: 0.75 × 0.75 inches for reliable scanning
- Include 0.125 inch quiet zone on all sides

## Digital Card

URL: `/card`

Elements:
- Visual card front (dark slate, copper accents)
- Visual card back (services list + QR placeholder)
- Action buttons: Start Consultation / Ask DEF AI / AI Property 360™
- Save Contact button (.vcf download)

## Information NOT on the Card

The following are intentionally omitted until Dylan confirms they are ready for public use:
- Phone number
- Email address
- Physical address / postal code
- Website URL (configurable from DEF_PUBLIC_URL env var)
- Social media accounts

## Print Production Notes

Before sending to print:
1. Confirm QR code URL is live and correct
2. Confirm all Dylan contact info to include (phone, email, website)
3. Export as PDF/X-1a CMYK
4. Proof on physical card stock before bulk print
5. Recommended: Matte laminate finish / Soft-touch on dark side

## Prohibited

- No fabricated phone numbers, emails, or addresses
- No licensing claims not verified with Dylan
- No insurance or certification claims
