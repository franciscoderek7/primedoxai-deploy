#!/usr/bin/env bash
# Local-dev convenience only. There is no Railway/Render/Supabase CLI
# authentication wired into this script or this environment — actual
# production deploy is a manual step in those dashboards (or a CI job
# with credentials this repo does not have). This script just brings the
# backend up locally against dockerized Postgres/Redis for a final
# sanity check before you push.
set -euo pipefail
cd "$(dirname "$0")/.."

docker compose -f infra/docker/docker-compose.yml up --build
