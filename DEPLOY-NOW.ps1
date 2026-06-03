# ═══════════════════════════════════════════════════════════════════
#  FRANCISCO HOLDINGS — MASTER DEPLOY SCRIPT (Windows PowerShell)
#  Run this from YOUR local machine in PowerShell 5.1+ or pwsh 7+
#
#  What it does:
#    1. Validates GitHub + Stripe credentials
#    2. Creates 15 Stripe products + payment links (CAD)
#    3. Fetches 5 site HTML files from GitHub branch
#    4. Patches PLACEHOLDER_URL_1..15 with real Stripe URLs
#    5. Pushes all 5 sites to separate GitHub Pages repos
#    6. Enables GitHub Pages on each repo
#    7. Prints all live URLs + saves payment links
#
#  Sites deployed (MindShift left untouched in your GitHub):
#    cleanswarm-checkout, ccldr-payments, revenue-dashboard,
#    omniaguard-site, primedoxai-site
# ═══════════════════════════════════════════════════════════════════

param(
    [string]$GH_TOKEN = $env:GH_TOKEN,
    [string]$STRIPE_SECRET_KEY = $env:STRIPE_SECRET_KEY
)

$ErrorActionPreference = "Stop"

function Banner($msg) { Write-Host "`n═══ $msg ═══" -ForegroundColor Cyan }
function Ok($msg)     { Write-Host "✓ $msg" -ForegroundColor Green }
function Info($msg)   { Write-Host "▸ $msg" -ForegroundColor Cyan }
function Warn($msg)   { Write-Host "⚠ $msg" -ForegroundColor Yellow }
function Die($msg)    { Write-Host "✗ FATAL: $msg" -ForegroundColor Red; exit 1 }

# ─── 0. PREREQUISITES ──────────────────────────────────────────────
Banner "Checking prerequisites"

foreach ($cmd in @("git", "curl")) {
    if (Get-Command $cmd -ErrorAction SilentlyContinue) {
        Ok "$cmd found"
    } else {
        Die "$cmd not found. Install Git for Windows from https://git-scm.com"
    }
}

# ─── 1. CREDENTIALS ────────────────────────────────────────────────
Banner "Credentials"

if ([string]::IsNullOrEmpty($GH_TOKEN)) {
    Write-Host "GitHub Personal Access Token needed." -ForegroundColor Yellow
    Write-Host "  Create at: https://github.com/settings/tokens/new"
    Write-Host "  Scopes required: repo, workflow"
    $GH_TOKEN = Read-Host "  Paste GH token (ghp_...)"
}

if ([string]::IsNullOrEmpty($STRIPE_SECRET_KEY)) {
    Write-Host "`nStripe Secret Key needed." -ForegroundColor Yellow
    Write-Host "  Get at: https://dashboard.stripe.com/apikeys"
    $SecureKey = Read-Host "  Paste sk_test_ or sk_live_ key" -AsSecureString
    $STRIPE_SECRET_KEY = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureKey)
    )
}

$GH_HEADERS  = @{ Authorization = "token $GH_TOKEN"; Accept = "application/vnd.github.v3+json" }
$STR_HEADERS = @{ Authorization = "Bearer $STRIPE_SECRET_KEY" }

try {
    $me = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $GH_HEADERS
    $GH_USER = $me.login
    Ok "GitHub user: $GH_USER"
} catch {
    Die "GitHub token invalid or network unreachable: $_"
}

try {
    $acct = Invoke-RestMethod -Uri "https://api.stripe.com/v1/account" -Headers $STR_HEADERS
    Ok "Stripe account: $($acct.id)"
} catch {
    Die "Stripe key invalid or network unreachable: $_"
}

$WORKDIR = Join-Path $env:TEMP "fh-deploy-$(Get-Random)"
New-Item -ItemType Directory -Path $WORKDIR -Force | Out-Null
Info "Working directory: $WORKDIR"

$LINKS = @{}

# ─── 2. STRIPE PRODUCTS + PAYMENT LINKS ────────────────────────────
Banner "Creating Stripe Products & Payment Links (15 total)"

function Make-Link {
    param(
        [string]$Label,
        [int]$Amount,
        [bool]$Recurring,
        [string]$Placeholder,
        [string]$Name,
        [string]$Desc
    )
    Info "Creating: $Name..."

    $prodBody = "name=$([Uri]::EscapeDataString($Name))&description=$([Uri]::EscapeDataString($Desc))"
    try {
        $prod = Invoke-RestMethod -Method Post `
            -Uri "https://api.stripe.com/v1/products" `
            -Headers $STR_HEADERS `
            -Body $prodBody `
            -ContentType "application/x-www-form-urlencoded"
    } catch { Warn "Product FAILED for $Label — skipped"; return }

    if ($Recurring) {
        $priceBody = "product=$($prod.id)&unit_amount=$Amount&currency=cad&recurring[interval]=month"
    } else {
        $priceBody = "product=$($prod.id)&unit_amount=$Amount&currency=cad"
    }
    try {
        $price = Invoke-RestMethod -Method Post `
            -Uri "https://api.stripe.com/v1/prices" `
            -Headers $STR_HEADERS `
            -Body $priceBody `
            -ContentType "application/x-www-form-urlencoded"
    } catch { Warn "Price FAILED for $Label — skipped"; return }

    $linkBody = "line_items[0][price]=$($price.id)&line_items[0][quantity]=1"
    try {
        $link = Invoke-RestMethod -Method Post `
            -Uri "https://api.stripe.com/v1/payment_links" `
            -Headers $STR_HEADERS `
            -Body $linkBody `
            -ContentType "application/x-www-form-urlencoded"
    } catch { Warn "Payment link FAILED for $Label — skipped"; return }

    $script:LINKS[$Placeholder] = $link.url
    Ok "$Label → $($link.url)"
}

# CleanSwarm
Write-Host "`n[ CLEANSWARM — Recurring Subscriptions ]" -ForegroundColor White
Make-Link "CleanSwarm Starter" 19900  $true  "PLACEHOLDER_URL_1"  "CleanSwarm Starter"         "AI scheduling, billing & team management — up to 3 crew members"
Make-Link "CleanSwarm Growth"  49900  $true  "PLACEHOLDER_URL_2"  "CleanSwarm Growth"           "Scale your cleaning business — up to 15 crew, multi-location, AI forecasting"
Make-Link "CleanSwarm Scale"   124900 $true  "PLACEHOLDER_URL_3"  "CleanSwarm Scale"            "Enterprise cleaning fleet — unlimited crew, white-label, API access"

# CCLDR
Write-Host "`n[ CCLDR — One-Time Education Products ]" -ForegroundColor White
Make-Link "CCLDR Warrior"      14900  $false "PLACEHOLDER_URL_4"  "CCLDR Warrior"              "Foundation constitutional defense education — Charter rights overview and disclosure templates"
Make-Link "CCLDR Professional" 49900  $false "PLACEHOLDER_URL_5"  "CCLDR Professional"         "Advanced defense education — BENO-X Framework, 12-Appearance method, motion library"
Make-Link "CCLDR Elite"        99900  $false "PLACEHOLDER_URL_6"  "CCLDR Elite"                "Complete constitutional arsenal — strategy sessions, OmniaGuard protection, full curriculum"
Make-Link "CCLDR Sovereign"    149900 $false "PLACEHOLDER_URL_7"  "CCLDR Sovereign"            "Total sovereignty — 6 sessions, full case review, all future courses included"

# MindShift (products created, site stays in repo)
Write-Host "`n[ MINDSHIFT — One-Time Coaching Products ]" -ForegroundColor White
Make-Link "MindShift Neuro"    49700   $false "PLACEHOLDER_URL_8"  "MindShift Neuro"            "8-week self-guided neuroplasticity program — daily rewiring protocols, habit architecture"
Make-Link "MindShift Group"    199700  $false "PLACEHOLDER_URL_9"  "MindShift Group Intensive"  "12-week cohort coaching — live sessions, accountability partner, identity reconstruction"
Make-Link "MindShift Premium"  1000000 $false "PLACEHOLDER_URL_10" "MindShift Premium"          "6-month 1-on-1 executive neuro-coaching — custom protocol, results guarantee"

# OmniaGuard
Write-Host "`n[ OMNIAGUARD — Recurring Subscriptions ]" -ForegroundColor White
Make-Link "OmniaGuard Starter"      9900   $true "PLACEHOLDER_URL_11" "OmniaGuard Starter"      "14-layer AI security stack — up to 5 agents, real-time threat detection, dashboard monitoring"
Make-Link "OmniaGuard Professional" 49900  $true "PLACEHOLDER_URL_12" "OmniaGuard Professional" "Advanced AI security — unlimited agents, priority 4-hr SLA, NIST AI RMF compliance kit"
Make-Link "OmniaGuard Enterprise"   199900 $true "PLACEHOLDER_URL_13" "OmniaGuard Enterprise"   "Full enterprise AI security — custom BENO-X policy, 1-hr emergency SLA, full audit trail"

# PrimeDox AI
Write-Host "`n[ PRIMEDOX AI — Recurring Subscriptions ]" -ForegroundColor White
Make-Link "PrimeDox Pro"   4900  $true "PLACEHOLDER_URL_14" "PrimeDox Pro"   "AI agent suite — 22+ specialized agents, Charter defense, business automation"
Make-Link "PrimeDox Elite" 19900 $true "PLACEHOLDER_URL_15" "PrimeDox Elite" "Sovereign digital twin — all agents + OmniaGuard swarm protection, custom training"

Ok "All 15 payment links created"

# ─── 3. FETCH HTML FROM REPO ───────────────────────────────────────
Banner "Fetching HTML files from primedoxai-deploy branch"

$BRANCH = "claude/francisco-revenue-sprint-MEva6"
$RAW_BASE = "https://raw.githubusercontent.com/$GH_USER/primedoxai-deploy/$BRANCH"

$SITES = @(
    "cleanswarm-checkout",
    "ccldr-payments",
    "revenue-dashboard",
    "omniaguard-site",
    "primedoxai-site"
)

foreach ($site in $SITES) {
    $siteDir = Join-Path $WORKDIR $site
    New-Item -ItemType Directory -Path $siteDir -Force | Out-Null
    $url = "$RAW_BASE/$site/index.html"
    try {
        Invoke-WebRequest -Uri $url -OutFile (Join-Path $siteDir "index.html") -UseBasicParsing
        Ok "Fetched $site/index.html"
    } catch {
        Die "Could not fetch $site/index.html from $url"
    }
}

# ─── 4. PATCH PLACEHOLDER URLS ─────────────────────────────────────
Banner "Patching payment link placeholders (PLACEHOLDER_URL_1..15)"

foreach ($site in $SITES) {
    $htmlPath = Join-Path $WORKDIR $site "index.html"
    $html = Get-Content $htmlPath -Raw

    foreach ($key in $LINKS.Keys) {
        if ($html -match [regex]::Escape($key)) {
            $html = $html -replace [regex]::Escape($key), $LINKS[$key]
            Ok "Patched $key in $site"
        }
    }

    Set-Content -Path $htmlPath -Value $html -NoNewline
}

# ─── 5. PUSH TO GITHUB PAGES ───────────────────────────────────────
Banner "Creating GitHub repos & deploying"

$LIVE_URLS = @()

foreach ($site in $SITES) {
    Info "Deploying: $site..."

    # Create repo (ignore error if already exists)
    $repoBody = @{
        name        = $site
        auto_init   = $false
        private     = $false
        description = "Francisco Holdings — $site"
    } | ConvertTo-Json
    try {
        Invoke-RestMethod -Method Post `
            -Uri "https://api.github.com/user/repos" `
            -Headers $GH_HEADERS `
            -Body $repoBody `
            -ContentType "application/json" | Out-Null
    } catch { <# repo may already exist #> }

    # Git push
    $siteDir = Join-Path $WORKDIR $site
    Push-Location $siteDir
    try {
        git init -q 2>&1 | Out-Null
        git checkout -b main 2>&1 | Out-Null
        git config user.email "derek@franciscoholdings.com"
        git config user.name "Derek Francisco"
        git add index.html 2>&1 | Out-Null
        git commit -q -m "Deploy $site — Francisco Holdings Inc." 2>&1 | Out-Null
        $remoteUrl = "https://$GH_TOKEN@github.com/$GH_USER/$site.git"
        git remote add origin $remoteUrl 2>&1 | Out-Null
        git push -u origin main --force -q 2>&1 | Out-Null
        Ok "Pushed $site"
    } catch {
        Warn "Push failed for $site — may need manual creation"
    } finally {
        Pop-Location
    }

    Start-Sleep -Seconds 2

    # Enable GitHub Pages
    $pagesBody = '{"source":{"branch":"main","path":"/"}}'
    try {
        $pagesResp = Invoke-RestMethod -Method Post `
            -Uri "https://api.github.com/repos/$GH_USER/$site/pages" `
            -Headers $GH_HEADERS `
            -Body $pagesBody `
            -ContentType "application/json"
        Ok "GitHub Pages enabled: $site"
    } catch {
        try {
            Invoke-RestMethod -Method Put `
                -Uri "https://api.github.com/repos/$GH_USER/$site/pages" `
                -Headers $GH_HEADERS `
                -Body $pagesBody `
                -ContentType "application/json" | Out-Null
            Ok "GitHub Pages configured: $site"
        } catch { Warn "Pages config failed for $site — enable manually in repo Settings" }
    }

    $LIVE_URLS += "https://$GH_USER.github.io/$site"
}

# ─── 6. SAVE PAYMENT LINKS ─────────────────────────────────────────
Banner "Saving payment link report"

$REPORT = Join-Path $env:USERPROFILE "francisco-holdings-payment-links.txt"
$reportLines = @(
    "# Francisco Holdings — Stripe Payment Links",
    "# Generated: $(Get-Date)",
    "",
    "=== CLEANSWARM (Recurring) ===",
    "Starter  (CAD `$199/mo):   $($LINKS['PLACEHOLDER_URL_1'])",
    "Growth   (CAD `$499/mo):   $($LINKS['PLACEHOLDER_URL_2'])",
    "Scale  (CAD `$1,249/mo):   $($LINKS['PLACEHOLDER_URL_3'])",
    "",
    "=== CCLDR (One-Time) ===",
    "Warrior      (CAD `$149):  $($LINKS['PLACEHOLDER_URL_4'])",
    "Professional (CAD `$499):  $($LINKS['PLACEHOLDER_URL_5'])",
    "Elite        (CAD `$999):  $($LINKS['PLACEHOLDER_URL_6'])",
    "Sovereign  (CAD `$1,499):  $($LINKS['PLACEHOLDER_URL_7'])",
    "",
    "=== MINDSHIFT (One-Time) ===",
    "Neuro        (CAD `$497):  $($LINKS['PLACEHOLDER_URL_8'])",
    "Group      (CAD `$1,997):  $($LINKS['PLACEHOLDER_URL_9'])",
    "Premium  (CAD `$10,000):   $($LINKS['PLACEHOLDER_URL_10'])",
    "",
    "=== OMNIAGUARD (Recurring) ===",
    "Starter    (CAD `$99/mo):  $($LINKS['PLACEHOLDER_URL_11'])",
    "Professional (CAD `$499/mo): $($LINKS['PLACEHOLDER_URL_12'])",
    "Enterprise (CAD `$1,999/mo): $($LINKS['PLACEHOLDER_URL_13'])",
    "",
    "=== PRIMEDOX AI (Recurring) ===",
    "Pro         (CAD `$49/mo): $($LINKS['PLACEHOLDER_URL_14'])",
    "Elite      (CAD `$199/mo): $($LINKS['PLACEHOLDER_URL_15'])"
)
$reportLines | Set-Content -Path $REPORT
Ok "Payment links saved → $REPORT"

# ─── 7. SUMMARY ────────────────────────────────────────────────────
Banner "DEPLOYMENT COMPLETE"

Write-Host "`n5 SITES LIVE (allow 60s for DNS propagation):" -ForegroundColor Green
foreach ($url in $LIVE_URLS) {
    Write-Host "  $url" -ForegroundColor Cyan
}

Write-Host "`nSTRIPE PAYMENT LINKS:" -ForegroundColor Yellow
Get-Content $REPORT | Where-Object { $_ -match "https://" } | Write-Host

Write-Host "`nTest card: 4242 4242 4242 4242 | any future date | any CVC" -ForegroundColor Yellow
Write-Host "`nNOTE: MindShift site left untouched in your GitHub as requested." -ForegroundColor White
Write-Host "      MindShift Stripe products were still created and saved above." -ForegroundColor White

# Cleanup
Remove-Item -Recurse -Force $WORKDIR -ErrorAction SilentlyContinue
