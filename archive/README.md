# CCLDR.NET Archive — Emergency Preservation

Archived: 2026-06-03

## Files

| File | Description |
|------|-------------|
| `ccldr/*.html` | All 14 site pages — static, self-contained, no external deps |
| `ccldr/case-law.json` | Structured case law: Parker, Hitzig, Smith, Allard + Charter map |
| `ccldr/pricing.json` | All 4 tiers with monthly/annual CAD pricing and Stripe slots |
| `ccldr/beno-x.json` | BENO-X framework: 5 pillars, argument logic, modules |
| `ccldr/twelve-appearances.json` | 12-Appearance methodology + Jordan framework |
| `ccldr/site-manifest.json` | Full page inventory with descriptions |

## Instant Redeployment

### GitHub Pages (any repo)
```bash
git init
cp -r archive/ccldr/* .
echo "yourcustomdomain.com" > CNAME
touch .nojekyll
git add -A && git commit -m "deploy: CCLDR archive"
git remote add origin git@github.com:USERNAME/REPO.git
git push -u origin main
```
Then enable GitHub Pages in repo Settings → Pages → main / root.

### Netlify (drag and drop)
1. Go to app.netlify.com → Add new site → Deploy manually
2. Drag the `archive/ccldr/` folder into the deploy area
3. Set custom domain in Site Settings → Domain Management

### Any static host
Upload all files in `archive/ccldr/` to the web root. 
Site has zero external dependencies — pure HTML/CSS/JS inline.

## Pricing Quick Reference

| Tier | Monthly (CAD) | Annual (CAD) | Saves |
|------|--------------|--------------|-------|
| Warrior | $149 | $1,490 | $298 |
| Professional | $499 | $4,990 | $998 |
| Elite | $999 | $9,990 | $1,998 |
| Sovereign | $1,499 | $14,990 | $2,998 |

## Interac e-Transfer
franciscoderek7@gmail.com
