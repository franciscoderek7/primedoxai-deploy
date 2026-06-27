#!/usr/bin/env bash
# Run backend tests locally. Assumes a venv with backend/requirements.txt installed.
set -euo pipefail
cd "$(dirname "$0")/.."
python -m pytest backend/tests -v
