#!/usr/bin/env python3
"""
CCLDR Archive Builder — Emergency Preservation + Static Mirror
===============================================================
Packages all CCLDR site files into a deployable static mirror.
Exports structured JSON: case law, pricing, BENO-X, 12-Appearances.

Since files are already local, this script PACKAGES them for
instant redeployment anywhere (Netlify, Vercel, any static host).

    python3 setup/ccldr_archive.py
    python3 setup/ccldr_archive.py --zip    # also create ccldr-archive.zip

Then deploy the zip to Netlify by drag-drop, or push the
archive/ folder to any GitHub repo with Pages enabled.
"""

import os, sys, json, shutil, datetime, zipfile, argparse
from pathlib import Path

REPO_ROOT    = Path(__file__).parent.parent
CCLDR_SRC    = REPO_ROOT / "ccldr-site"
ARCHIVE_DEST = REPO_ROOT / "archive" / "ccldr"
JSON_DIR     = ARCHIVE_DEST


def copy_site_files():
    """Copy all ccldr-site/* to archive/ccldr/"""
    ARCHIVE_DEST.mkdir(parents=True, exist_ok=True)
    copied = 0
    for fp in sorted(CCLDR_SRC.rglob("*")):
        if fp.is_file() and fp.suffix.lower() in (".html", ".css", ".js", ".json", ".txt", ".svg", ".png", ".jpg", ".ico"):
            rel  = fp.relative_to(CCLDR_SRC)
            dest = ARCHIVE_DEST / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(fp, dest)
            copied += 1
    return copied


def write_case_law_json():
    data = {
        "meta": {"framework": "BENO-X", "updated": str(datetime.date.today()),
                 "disclaimer": "Educational only. Not legal advice."},
        "cases": [
            {"citation":"R v Parker","year":2000,"court":"ONCA",
             "neutral":"2000 CanLII 5762 (ON CA)",
             "principle":"Absolute cannabis prohibition violates s.7 for seriously ill patients lacking medical access. Parliament given 12 months to fix CDSA.",
             "charter":["s.7"],"outcome":"Crown lost. Prohibition struck.","beno_pillar":1},
            {"citation":"R v Hitzig","year":2003,"court":"ONCA",
             "neutral":"2003 CanLII 3611 (ON CA)",
             "principle":"MMAR supply provisions unconstitutional. A right without practical supply is no right at all. Government must provide functional access mechanism.",
             "charter":["s.7"],"outcome":"Crown lost. MMAR supply struck.","beno_pillar":2},
            {"citation":"R v Smith","year":2015,"court":"SCC",
             "neutral":"2015 SCC 34",
             "principle":"Restriction to dried form only was arbitrary and overbroad. Patients have constitutional right to any non-harmful cannabis form (oils, edibles, etc.).",
             "charter":["s.7"],"outcome":"Crown lost unanimously.","beno_pillar":3},
            {"citation":"Allard v Canada","year":2016,"court":"Federal Court",
             "neutral":"2016 FC 236",
             "principle":"MMPR personal production ban violated s.7. Forcing patients into commercial market at unaffordable prices is unconstitutional. Led to ACMPR.",
             "charter":["s.7"],"outcome":"Crown lost. MMPR struck.","beno_pillar":4},
            {"citation":"2023 FC 1636 (ongoing)","year":2023,"court":"Federal Court",
             "neutral":"2023 FC 1636",
             "principle":"Ongoing constitutional challenges to current ACMPR provisions. BENO-X argument continues to evolve.",
             "charter":["s.7","s.15"],"outcome":"Ongoing.","beno_pillar":5},
            {"citation":"R v Jordan","year":2016,"court":"SCC",
             "neutral":"2016 SCC 27",
             "principle":"Firm trial delay ceilings: 18 months (Provincial), 30 months (Superior). Above ceiling = presumptively unreasonable. Stay of proceedings remedy.",
             "charter":["s.11b"],"outcome":"Established Jordan framework.","beno_pillar":None},
            {"citation":"R v Grant","year":2009,"court":"SCC",
             "neutral":"2009 SCC 32",
             "principle":"Revised s.24(2) framework: 3-part test for excluding Charter-obtained evidence. Replaced Collins test. Seriousness of violation, impact on accused, society's interest.",
             "charter":["s.24(2)"],"outcome":"Evidence exclusion framework.","beno_pillar":None},
            {"citation":"R v Mernagh","year":2011,"court":"ONCA",
             "neutral":"2011 ONCA 414",
             "principle":"MMAR found constitutionally deficient due to inaccessible physician declarations. Court found systemic access failure violating s.7.",
             "charter":["s.7"],"outcome":"Crown lost at trial; ONCA overturned on narrow grounds. MMAR deficiency acknowledged.","beno_pillar":None},
        ],
        "charter_map": {
            "s.7":"Life, liberty, security — medical access, arbitrary deprivation",
            "s.8":"Unreasonable search and seizure",
            "s.9":"Arbitrary detention",
            "s.10b":"Right to counsel upon arrest/detention",
            "s.11b":"Trial within reasonable time (Jordan framework)",
            "s.11d":"Presumption of innocence",
            "s.15":"Equality before the law",
            "s.24":"Remedies — exclusion of evidence or stay of proceedings"
        }
    }
    out = JSON_DIR / "case-law.json"
    out.write_text(json.dumps(data, indent=2))
    return str(out.relative_to(REPO_ROOT))


def write_pricing_json():
    data = {
        "site": "CCLDR.NET", "currency": "CAD", "updated": str(datetime.date.today()),
        "disclaimer": "Educational subscriptions only. Not legal services.",
        "interac": "franciscoderek7@gmail.com",
        "tiers": [
            {"id":"warrior","name":"Warrior","monthly_cad":149,"annual_cad":1490,
             "save_cad":298,"popular":False,
             "features":["Charter rights education (s.7-s.24)","BENO-X Pillars 1-2 (Parker + Hitzig)",
                         "Core case library (Parker, Hitzig, Smith, Allard)","3 document templates",
                         "Cannabis law glossary","12-Appearance overview (Stages 1-4)"],
             "stripe_m":"PASTE_STRIPE_LINK_HERE_CCLDR_WARRIOR_M",
             "stripe_a":"PASTE_STRIPE_LINK_HERE_CCLDR_WARRIOR_A"},
            {"id":"professional","name":"Professional","monthly_cad":499,"annual_cad":4990,
             "save_cad":998,"popular":True,
             "features":["Full BENO-X Framework (all 5 pillars)","Complete 12-Appearance Timeline",
                         "100+ case library (updated monthly)","Jordan delay calculation",
                         "s.8/s.9/s.10b Charter application templates","Expanded disclosure bundle",
                         "ACMPR designated producer template","AI-enhanced case research"],
             "stripe_m":"PASTE_STRIPE_LINK_HERE_CCLDR_PROFESSIONAL_M",
             "stripe_a":"PASTE_STRIPE_LINK_HERE_CCLDR_PROFESSIONAL_A"},
            {"id":"elite","name":"Elite","monthly_cad":999,"annual_cad":9990,
             "save_cad":1998,"popular":False,
             "features":["Monthly 1:1 education consultation (Doc Weedlaw)",
                         "BENO-X Medical Necessity module","BENO-X Pillar 5 live litigation",
                         "Custom ACMPR compliance setup","Entrapment doctrine module",
                         "Compliance template library","Webinar archive"],
             "stripe_m":"PASTE_STRIPE_LINK_HERE_CCLDR_ELITE_M",
             "stripe_a":"PASTE_STRIPE_LINK_HERE_CCLDR_ELITE_A"},
            {"id":"sovereign","name":"Sovereign","monthly_cad":1499,"annual_cad":14990,
             "save_cad":2998,"popular":False,
             "features":["Unlimited 1:1 education consultations",
                         "Board-level regulatory briefings","Custom case education analysis",
                         "White-label education materials","Custom framework development",
                         "CCLDR Partner Program eligibility (20% commission)"],
             "stripe_m":"PASTE_STRIPE_LINK_HERE_CCLDR_SOVEREIGN_M",
             "stripe_a":"PASTE_STRIPE_LINK_HERE_CCLDR_SOVEREIGN_A"},
        ]
    }
    out = JSON_DIR / "pricing.json"
    out.write_text(json.dumps(data, indent=2))
    return str(out.relative_to(REPO_ROOT))


def write_beno_x_json():
    data = {
        "framework": "BENO-X", "full_name": "Bad Exemption = No Offense",
        "updated": str(datetime.date.today()),
        "disclaimer": "Educational framework only. Not legal advice.",
        "argument": [
            "1. Government created cannabis exemption regime (MMAR → MMPR → ACMPR)",
            "2. Courts found that regime repeatedly violated s.7 Charter rights",
            "3. A constitutionally defective exemption = no valid exemption",
            "4. If no valid exemption exists, possession cannot be a criminal offense",
            "5. Therefore: Bad Exemption = No Offense"
        ],
        "pillars": [
            {"n":1,"case":"R v Parker","year":2000,"court":"ONCA",
             "principle":"Prohibition unconstitutional for ill patients lacking access","charter":"s.7","tier":"Warrior+"},
            {"n":2,"case":"R v Hitzig","year":2003,"court":"ONCA",
             "principle":"Supply access is a constitutional requirement","charter":"s.7","tier":"Warrior+"},
            {"n":3,"case":"R v Smith","year":2015,"court":"SCC (unanimous)",
             "principle":"Restriction to dried form only: arbitrary and overbroad","charter":"s.7","tier":"Professional+"},
            {"n":4,"case":"Allard v Canada","year":2016,"court":"FC",
             "principle":"Eliminating personal production violates s.7","charter":"s.7","tier":"Professional+"},
            {"n":5,"case":"2023 FC 1636 + ongoing","year":2023,"court":"FC",
             "principle":"Current ACMPR under ongoing Charter scrutiny","charter":"s.7+s.15","tier":"Elite+"},
        ],
        "charter_core": ["s.7","s.8","s.9","s.10b","s.11d","s.15","s.24"],
        "educational_modules": [
            "BENO-X Introduction","Pillar 1: Parker — The Foundation",
            "Pillar 2: Hitzig — Supply as a Right","Pillar 3: Smith — Form Rights (SCC Unanimous)",
            "Pillar 4: Allard — Production Rights","Pillar 5: Current Litigation",
            "BENO-X Application Framework","BENO-X Medical Necessity (Elite+)",
        ]
    }
    out = JSON_DIR / "beno-x.json"
    out.write_text(json.dumps(data, indent=2))
    return str(out.relative_to(REPO_ROOT))


def write_manifest_json():
    pages = [
        ("index.html",        "CCLDR.NET Home",                "Main hub, BENO-X intro, pricing"),
        ("charged.html",      "Charged with Cannabis?",         "Emergency landing — 6-step guide, Charter rights"),
        ("pricing.html",      "Pricing & Tiers",                "4 tiers with annual toggle"),
        ("documents.html",    "Document Library",               "Free + locked templates by tier"),
        ("partnerships.html", "Partnership Program",            "Affiliate 15% / Community 20% / Institutional"),
        ("law.html",          "Case Law Library",               "100+ decisions, organized and annotated"),
        ("defense.html",      "Defense Frameworks",             "BENO-X, s.8, s.9, s.10b, disclosure, entrapment"),
        ("guides.html",       "Defense Guides",                 "Step-by-step guides for each court stage"),
        ("history.html",      "Cannabis Prohibition Timeline",  "Full CDSA, MMAR, MMPR, ACMPR, Bill C-45 history"),
        ("glossary.html",     "Legal Glossary",                 "Plain-language definitions"),
        ("global.html",       "Global Cannabis Law",            "International comparative jurisprudence"),
        ("science.html",      "Cannabis Science",               "Medical/scientific basis — DSM-5, pharmacology"),
        ("industry.html",     "Industry & Compliance",          "Regulatory compliance for operators"),
        ("medical.html",      "Medical Access",                 "ACMPR, medical necessity, designated producer"),
    ]
    data = {
        "site": "CCLDR.NET", "archived": str(datetime.date.today()),
        "redeployment": {
            "github_pages": "git push to any public repo + enable Pages",
            "netlify": "Drag archive/ccldr/ folder to app.netlify.com",
            "any_static": "Upload all files in archive/ccldr/ to web root",
            "note": "Zero external dependencies — pure self-contained HTML/CSS/JS"
        },
        "pages": [{"file":f,"title":t,"description":d} for f,t,d in pages],
        "json_exports": ["case-law.json","pricing.json","beno-x.json","twelve-appearances.json","site-manifest.json"],
        "brand": {
            "primary":"#10b981 (emerald)","gold":"#f59e0b","background":"#0b0f1a",
            "persona":"Doc Weedlaw (Derek Francisco)","entity":"Tech Pet Cage / Francisco Holdings Inc."
        }
    }
    out = JSON_DIR / "site-manifest.json"
    out.write_text(json.dumps(data, indent=2))
    return str(out.relative_to(REPO_ROOT))


def create_zip():
    zip_path = REPO_ROOT / "archive" / "ccldr-archive.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for fp in sorted(ARCHIVE_DEST.rglob("*")):
            if fp.is_file():
                zf.write(fp, fp.relative_to(REPO_ROOT / "archive"))
    return zip_path


def main():
    parser = argparse.ArgumentParser(description="CCLDR archive builder")
    parser.add_argument("--zip", action="store_true", help="Also create ccldr-archive.zip")
    args = parser.parse_args()

    print(f"\n{'='*60}")
    print(f"  CCLDR EMERGENCY ARCHIVE BUILDER")
    print(f"  {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}")
    print(f"{'='*60}\n")

    print(f"  Source: {CCLDR_SRC.relative_to(REPO_ROOT)}/")
    print(f"  Dest:   {ARCHIVE_DEST.relative_to(REPO_ROOT)}/\n")

    # 1. Copy HTML files
    n = copy_site_files()
    print(f"  ✓ {n} site files copied")

    # 2. Write JSON exports
    for fn in [write_case_law_json, write_pricing_json, write_beno_x_json, write_manifest_json]:
        path = fn()
        print(f"  ✓ {path}")

    # 3. Optional zip
    if args.zip:
        zp = create_zip()
        size_mb = zp.stat().st_size / 1024 / 1024
        print(f"  ✓ {zp.relative_to(REPO_ROOT)}  ({size_mb:.1f} MB)")

    # 4. Count totals
    total_files = sum(1 for _ in ARCHIVE_DEST.rglob("*") if _.is_file())
    print(f"\n  Archive complete: {total_files} files in archive/ccldr/")
    print(f"""
  INSTANT REDEPLOYMENT:
  ─────────────────────
  Netlify (fastest):
    Drag archive/ccldr/ to app.netlify.com

  GitHub Pages:
    cd /tmp && git clone https://github.com/franciscoderek7/ccldr-archive
    cp -r {ARCHIVE_DEST.relative_to(REPO_ROOT)}/* ccldr-archive/
    cd ccldr-archive && echo "ccldr.net" > CNAME && git add -A
    git commit -m "restore: CCLDR archive" && git push

  Any host:
    Upload all files in archive/ccldr/ to web root
""")


if __name__ == "__main__":
    main()
