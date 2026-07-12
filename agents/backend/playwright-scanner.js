/**
 * Deep URL Scanner — Playwright headless browser
 * Supplements gap-scanner.js (HTTP-based) with full-render checks:
 *   - Accessibility via axe-core injection
 *   - Mobile viewport overflow detection
 *   - Visible payment button detection
 *   - Cookie consent widget detection
 *   - Tech stack fingerprinting
 *   - Internal broken link sampling
 *
 * Respects robots.txt. Max 10 concurrent via semaphore.
 */

const path = require('path');

// ── Semaphore for concurrency control ────────────────────────────────────────
class Semaphore {
  constructor(max) { this.max = max; this.count = 0; this.queue = []; }
  acquire() {
    if (this.count < this.max) { this.count++; return Promise.resolve(); }
    return new Promise(r => this.queue.push(r)).then(() => { this.count++; });
  }
  release() {
    this.count--;
    if (this.queue.length) this.queue.shift()();
  }
}

const sem = new Semaphore(10);

// ── Resolve Chromium executable ──────────────────────────────────────────────
function getChromiumPath() {
  const envPath = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (envPath) {
    // Check common sub-paths used by different Playwright versions
    const candidates = [
      path.join(envPath, 'chromium'),
      path.join(envPath, 'chromium', 'chrome'),
      path.join(envPath, 'chromium-1169', 'chrome-linux', 'chrome'),
    ];
    const fs = require('fs');
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
  }
  return undefined; // Let Playwright find it
}

// ── Main deep scan ────────────────────────────────────────────────────────────
async function deepScan(targetUrl, opts = {}) {
  let playwright;
  try {
    playwright = require('playwright');
  } catch {
    return { error: 'Playwright not installed — run: npm install playwright', url: targetUrl };
  }

  if (!/^https?:\/\//i.test(targetUrl)) targetUrl = 'https://' + targetUrl;

  await sem.acquire();

  const browser = await playwright.chromium.launch({
    executablePath: getChromiumPath(),
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (compatible; EmpireGapScanner/2.0; +https://franciscoholdingsinc.com/scanner)',
      viewport: { width: 1280, height: 800 },
    });

    // ── robots.txt check ──────────────────────────────────────────────────
    try {
      const parsed = new URL(targetUrl);
      const robotsResp = await context.request.get(`${parsed.protocol}//${parsed.host}/robots.txt`, { timeout: 5000 });
      const robots = await robotsResp.text();
      // Check for blanket Disallow: / under User-agent: *
      if (/User-agent:\s*\*[^]*?Disallow:\s*\/\s*(\n|$)/.test(robots)) {
        await browser.close();
        sem.release();
        return { skipped: true, reason: 'robots.txt disallows scanning', url: targetUrl };
      }
    } catch { /* robots.txt missing or unreachable — allow */ }

    const page = await context.newPage();
    const startMs = Date.now();
    let httpStatus = 200;

    page.on('response', resp => {
      if (resp.url() === targetUrl || resp.url() === targetUrl + '/') httpStatus = resp.status();
    });

    try {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } catch (e) {
      return { error: e.message, url: targetUrl };
    }

    const loadMs = Date.now() - startMs;

    // ── Desktop full-page analysis ────────────────────────────────────────
    const desktop = await page.evaluate(() => {
      const html = document.documentElement.innerHTML.toLowerCase();
      const text = (document.body?.innerText || '').toLowerCase();
      const links = Array.from(document.querySelectorAll('a[href]'));
      const imgs  = Array.from(document.querySelectorAll('img'));

      const tech = {
        react:        html.includes('_reactrootcontainer') || html.includes('__react'),
        vue:          html.includes('__vue__') || html.includes('vue.js'),
        wordpress:    html.includes('/wp-content/') || html.includes('wp-json'),
        shopify:      html.includes('cdn.shopify.com'),
        wix:          html.includes('.wix.com'),
        squarespace:  html.includes('squarespace'),
        webflow:      html.includes('webflow'),
        stripe:       html.includes('js.stripe.com'),
        paypal:       html.includes('paypal.com/sdk'),
        googleAnalytics: html.includes('google-analytics.com') || html.includes('gtag(') || /g-[a-z0-9]{8,}/i.test(html) || /ua-\d{7,}/i.test(html),
        gtm:          html.includes('googletagmanager.com') || html.includes('gtm-'),
        hubspot:      html.includes('js.hs-scripts.com') || html.includes('hubspot'),
        intercom:     html.includes('intercom'),
        mailchimp:    html.includes('mailchimp'),
        klaviyo:      html.includes('klaviyo'),
        hotjar:       html.includes('hotjar'),
      };

      const paymentSignals = {
        hasStripe:     html.includes('js.stripe.com'),
        hasPayPalSDK:  html.includes('paypal.com/sdk'),
        hasPricing:    text.includes('pricing') || text.includes('/month') || text.includes('/mo') || text.includes('/yr'),
        hasBuyButton:  text.includes('buy now') || text.includes('add to cart') || text.includes('get started') || text.includes('subscribe'),
        hasCheckoutLink: links.some(a => /checkout|buy|stripe|paypal/.test(a.href.toLowerCase())),
        hasPayPalMe:   links.some(a => a.href.includes('paypal.me/')),
      };

      const legal = {
        hasPrivacy:      links.some(a => /privacy/.test(a.href + ' ' + (a.textContent||'')).toLowerCase()) || text.includes('privacy policy'),
        hasTerms:        links.some(a => /terms|tos/.test((a.href + ' ' + (a.textContent||'')).toLowerCase())) || text.includes('terms of service'),
        hasCookieBanner: text.includes('cookie') && (text.includes('accept') || text.includes('consent') || text.includes('agree')),
        hasCookieWidget: html.includes('cookiebot') || html.includes('onetrust') || html.includes('cookieconsent'),
      };

      const contact = {
        hasEmail:       /[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}/i.test(document.body?.innerHTML || ''),
        hasPhone:       /\+?1?\s*[-.]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(document.body?.innerText || ''),
        hasContactForm: !!document.querySelector('form') && (text.includes('contact') || text.includes('send') || text.includes('message')),
        hasContactLink: links.some(a => (a.href + ' ' + (a.textContent||'').toLowerCase()).includes('contact')),
      };

      const socialProof = {
        hasTestimonials: text.includes('testimonial') || text.includes('what our') || text.includes('clients say'),
        hasRatings:      /\d+(\.\d+)?\s*(stars?|\/5)|[★⭐]{3,}/.test(document.body?.innerText || ''),
        hasClientLogos:  imgs.some(img => /logo|client|partner|trust/i.test(img.alt + img.src)),
        hasSocialLinks:  links.some(a => /facebook\.com|twitter\.com|x\.com|linkedin\.com|instagram\.com|youtube\.com|tiktok\.com/.test(a.href)),
      };

      const imgsWithoutAlt = imgs.filter(img => !img.alt && !img.getAttribute('role')).length;

      return {
        hasViewportMeta: !!document.querySelector('meta[name="viewport"]'),
        title:           document.title,
        metaDescription: document.querySelector('meta[name="description"]')?.content || null,
        h1:              document.querySelector('h1')?.innerText?.trim() || null,
        h1Count:         document.querySelectorAll('h1').length,
        ogTitle:         document.querySelector('meta[property="og:title"]')?.content || null,
        canonical:       document.querySelector('link[rel="canonical"]')?.href || null,
        linkCount:       links.length,
        imageCount:      imgs.length,
        imgsWithoutAlt,
        formCount:       document.querySelectorAll('form').length,
        tech,
        paymentSignals,
        legal,
        contact,
        socialProof,
        finalUrl:        window.location.href,
      };
    });

    // ── Mobile overflow check ─────────────────────────────────────────────
    let mobileOverflow = false;
    try {
      const mob = await context.newPage();
      await mob.setViewportSize({ width: 375, height: 667 });
      await mob.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      mobileOverflow = await mob.evaluate(() => document.body.scrollWidth > window.innerWidth + 8);
      await mob.close();
    } catch { /* non-fatal */ }

    // ── axe-core accessibility scan ───────────────────────────────────────
    let axe = null;
    try {
      await page.addScriptTag({
        url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.9.1/axe.min.js',
      });
      axe = await page.evaluate(async () => {
        const r = await window.axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
          resultTypes: ['violations'],
        });
        return {
          violations: r.violations.slice(0, 10).map(v => ({
            id: v.id, impact: v.impact, description: v.description, count: v.nodes.length,
          })),
          criticalCount: r.violations.filter(v => v.impact === 'critical').length,
          seriousCount:  r.violations.filter(v => v.impact === 'serious').length,
        };
      });
    } catch { /* axe blocked by CSP — skip */ }

    // ── Broken link sampling (first 15 internal links) ────────────────────
    const brokenLinks = [];
    try {
      const base = new URL(targetUrl).hostname;
      const internalLinks = await page.evaluate((baseHost) => {
        return Array.from(document.querySelectorAll('a[href]'))
          .map(a => a.href)
          .filter(h => h && !h.startsWith('javascript:') && !h.startsWith('mailto:') && !h.startsWith('tel:') && !h.startsWith('#'))
          .filter(h => { try { return new URL(h).hostname === baseHost; } catch { return false; } })
          .slice(0, 15);
      }, base);

      const ctx2 = await browser.newContext();
      for (const link of internalLinks) {
        try {
          const resp = await ctx2.request.head(link, { timeout: 5000 });
          if (resp.status() >= 400) brokenLinks.push({ url: link, status: resp.status() });
        } catch { /* ignore */ }
      }
      await ctx2.dispose();
    } catch { /* non-fatal */ }

    return {
      url: desktop.finalUrl || targetUrl,
      httpStatus,
      loadMs,
      ssl: targetUrl.startsWith('https://'),
      mobileOverflow,
      desktop,
      axe,
      brokenLinks,
      scannedAt: new Date().toISOString(),
    };

  } finally {
    await browser.close();
    sem.release();
  }
}

// ── Build gap findings from deep scan result ─────────────────────────────────
function buildDeepGaps(scan) {
  const d = scan.desktop;
  const gaps = [];

  if (!scan.ssl)
    gaps.push({ id: 'ssl', priority: 'CRITICAL', title: 'No HTTPS/SSL certificate', fix: 'Install SSL — browsers show "Not Secure" warning', value_cad: 900 });
  if (!d.hasViewportMeta || scan.mobileOverflow)
    gaps.push({ id: 'mobile', priority: 'HIGH', title: `Mobile issues (${!d.hasViewportMeta ? 'no viewport tag' : 'layout overflow'})`, fix: 'Add viewport meta tag and fix responsive CSS', value_cad: 800 });
  if (!d.paymentSignals.hasPricing && !d.paymentSignals.hasCheckoutLink && !d.paymentSignals.hasStripe && !d.paymentSignals.hasPayPalSDK && !d.paymentSignals.hasPayPalMe)
    gaps.push({ id: 'payments', priority: 'HIGH', title: 'No payment system detected', fix: 'Add PayPal or Stripe checkout buttons with clear pricing', value_cad: 1500 });
  if (!d.tech.googleAnalytics && !d.tech.gtm && !d.tech.hotjar)
    gaps.push({ id: 'analytics', priority: 'HIGH', title: 'No analytics tracking', fix: 'Install GA4 or Plausible — flying blind without conversion data', value_cad: 400 });
  if (!d.legal.hasPrivacy)
    gaps.push({ id: 'privacy', priority: 'HIGH', title: 'No privacy policy', fix: 'Add privacy policy page (PIPEDA mandatory for Canadian businesses)', value_cad: 500 });
  if (!d.contact.hasEmail && !d.contact.hasPhone && !d.contact.hasContactForm)
    gaps.push({ id: 'contact', priority: 'MEDIUM', title: 'No contact information visible', fix: 'Add email, phone, or contact form — visitors cannot reach you', value_cad: 400 });
  if (!d.legal.hasCookieBanner && !d.legal.hasCookieWidget)
    gaps.push({ id: 'cookies', priority: 'MEDIUM', title: 'No cookie consent banner', fix: 'Add cookie consent for PIPEDA/GDPR compliance', value_cad: 200 });
  if (!d.socialProof.hasTestimonials && !d.socialProof.hasRatings && !d.socialProof.hasClientLogos)
    gaps.push({ id: 'social_proof', priority: 'MEDIUM', title: 'No social proof (testimonials/reviews)', fix: 'Add testimonials, star ratings, or client logos', value_cad: 600 });
  if (scan.brokenLinks.length > 0)
    gaps.push({ id: 'broken_links', priority: 'MEDIUM', title: `${scan.brokenLinks.length} broken internal link(s)`, fix: `Fix: ${scan.brokenLinks.map(l => l.url).slice(0,2).join(', ')}`, value_cad: 300 });
  if (axeHasCritical(scan.axe))
    gaps.push({ id: 'accessibility', priority: 'MEDIUM', title: `${scan.axe.criticalCount + scan.axe.seriousCount} critical/serious accessibility violations`, fix: 'Fix WCAG 2.1 AA violations — impacts SEO and legal exposure', value_cad: 400 });
  if (!d.title || d.title.length < 10)
    gaps.push({ id: 'seo_title', priority: 'MEDIUM', title: 'Missing or too-short page title', fix: 'Add a descriptive 50–60 character page title', value_cad: 250 });
  if (!d.metaDescription)
    gaps.push({ id: 'seo_meta', priority: 'MEDIUM', title: 'Missing meta description', fix: 'Add 150–160 character meta description for search snippets', value_cad: 250 });

  return gaps.sort((a, b) => ({ CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }[a.priority] - ({ CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }[b.priority] || 9)));
}

function axeHasCritical(axe) {
  return axe && (axe.criticalCount > 0 || axe.seriousCount > 0);
}

// ── Express route registration ────────────────────────────────────────────────
function registerDeepRoutes(app, limiter) {
  app.post('/api/deep-scan', limiter, async (req, res) => {
    const { url } = req.body || {};
    if (!url) return res.status(400).json({ error: 'url required' });

    try {
      const result = await deepScan(url);
      if (result.error)   return res.status(422).json({ success: false, ...result });
      if (result.skipped) return res.status(200).json({ success: false, ...result });

      const gaps = buildDeepGaps(result);
      res.json({ success: true, ...result, gaps_found: gaps, gap_count: gaps.length });
    } catch (err) {
      console.error('[deep-scan]', err.message);
      res.status(500).json({ error: 'Deep scan failed', message: err.message });
    }
  });
}

module.exports = { deepScan, buildDeepGaps, registerDeepRoutes };
