"""
In-memory sliding-window rate limiter for /widget-chat.

Deliberately simple — a dict keyed by (site, visitor_id) holding recent
request timestamps. This is per-process state: correct for a single
Railway/Render/Fly instance, and resets on every redeploy/restart. If this
ever runs multiple replicas, swap the dict for the Redis instance already
provisioned for the LangGraph checkpointer instead of writing a new limiter.
"""
import time
from collections import defaultdict
from threading import Lock

_WINDOW_SECONDS = 60
_hits: dict[str, list[float]] = defaultdict(list)
_lock = Lock()


def check_rate_limit(key: str, max_per_minute: int) -> tuple[bool, int]:
    """
    Returns (allowed, retry_after_seconds).
    Records the hit if allowed.
    """
    now = time.monotonic()
    cutoff = now - _WINDOW_SECONDS

    with _lock:
        hits = [t for t in _hits[key] if t > cutoff]
        if len(hits) >= max_per_minute:
            _hits[key] = hits
            retry_after = int(_WINDOW_SECONDS - (now - hits[0])) + 1
            return False, retry_after

        hits.append(now)
        _hits[key] = hits
        return True, 0
