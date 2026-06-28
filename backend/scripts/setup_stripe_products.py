"""
backend/scripts/setup_stripe_products.py

Creates the 4 PrimeDox AI subscription tiers as Stripe Products + recurring
Prices in whichever mode STRIPE_SECRET_KEY belongs to (test or live — same
prefix rule as everywhere else in this backend). Idempotent: re-running it
does not create duplicates, it looks up existing products by name first.

Pricing matches the live zprimedoxaihq-site/pricing.html copy exactly
(Free Trial $0 / Basic $49 / Pro $149 / Enterprise $499) — NOT the $999
Enterprise figure from the original build-order draft, since that would
mean Stripe charges a different amount than the price the customer actually
saw on the page. Flag to Derek if $999 was an intentional repricing the site
hasn't caught up to yet.

Usage:
    STRIPE_SECRET_KEY=sk_test_... python -m backend.scripts.setup_stripe_products

Prints the resulting price IDs — paste those into STRIPE_PRICE_STARTER /
STRIPE_PRICE_PRO / STRIPE_PRICE_ENTERPRISE in whichever env (.env locally,
Railway dashboard in production) backend/core/config.py reads from.
"""

import os

import stripe

PLANS = [
    {
        "plan_id": "starter",
        "name": "PrimeDox AI — Basic",
        "description": "Full-speed access for professionals running real workloads.",
        "amount_cents": 4900,
    },
    {
        "plan_id": "pro",
        "name": "PrimeDox AI — Pro",
        "description": "Scaled access for teams and organizations.",
        "amount_cents": 14900,
    },
    {
        "plan_id": "enterprise",
        "name": "PrimeDox AI — Enterprise",
        "description": "Custom-built access for complex or high-volume needs.",
        "amount_cents": 49900,
    },
]


def _find_existing_price(product_name: str) -> str | None:
    products = stripe.Product.list(limit=100).data
    match = next((p for p in products if p.name == product_name), None)
    if not match:
        return None
    prices = stripe.Price.list(product=match.id, active=True, limit=1).data
    return prices[0].id if prices else None


def main() -> None:
    stripe.api_key = os.environ["STRIPE_SECRET_KEY"]
    mode = "LIVE" if stripe.api_key.startswith("sk_live_") else "TEST"
    print(f"Creating products in Stripe {mode} mode\n")

    results = {}
    for plan in PLANS:
        existing = _find_existing_price(plan["name"])
        if existing:
            print(f"  {plan['plan_id']:<12} already exists -> {existing}")
            results[plan["plan_id"]] = existing
            continue

        product = stripe.Product.create(name=plan["name"], description=plan["description"])
        price = stripe.Price.create(
            product=product.id,
            unit_amount=plan["amount_cents"],
            currency="usd",
            recurring={"interval": "month"},
        )
        print(f"  {plan['plan_id']:<12} created       -> {price.id}")
        results[plan["plan_id"]] = price.id

    print("\nPaste into your env:")
    print(f"  STRIPE_PRICE_STARTER={results['starter']}")
    print(f"  STRIPE_PRICE_PRO={results['pro']}")
    print(f"  STRIPE_PRICE_ENTERPRISE={results['enterprise']}")


if __name__ == "__main__":
    main()
