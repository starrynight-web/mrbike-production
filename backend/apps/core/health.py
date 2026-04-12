"""
Phase 5 — Health Check Endpoint
Exposes GET /health/ → checks DB, Redis, Cloudinary status.
Used by uptime monitors, load balancers, and DevOps tooling.
"""
import time
from django.http import JsonResponse
from django.db import connection
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_GET


@require_GET
@never_cache
def health_check(request):
    """
    GET /health/
    Returns 200 if all systems are operational, 503 if any critical service is down.
    """
    start = time.time()
    checks = {}
    overall_ok = True

    # ── Database Check ──────────────────────────────
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        checks["database"] = {"status": "ok", "backend": connection.vendor}
    except Exception as e:
        checks["database"] = {"status": "error", "detail": str(e)}
        overall_ok = False

    # ── Redis / Cache Check ─────────────────────────
    try:
        from django.core.cache import cache
        cache.set("_health_check", "1", timeout=5)
        val = cache.get("_health_check")
        if val == "1":
            checks["cache"] = {"status": "ok"}
        else:
            checks["cache"] = {"status": "degraded", "detail": "Set/get mismatch"}
    except Exception as e:
        checks["cache"] = {"status": "error", "detail": str(e)}
        # Cache failure is non-critical — don't fail the overall check

    # ── Cloudinary Check ────────────────────────────
    try:
        import cloudinary
        cfg = cloudinary.config()
        if cfg.cloud_name:
            checks["cloudinary"] = {"status": "ok", "cloud": cfg.cloud_name}
        else:
            checks["cloudinary"] = {"status": "unconfigured"}
    except Exception as e:
        checks["cloudinary"] = {"status": "error", "detail": str(e)}

    # ── Response ─────────────────────────────────────
    elapsed_ms = round((time.time() - start) * 1000, 1)
    status_code = 200 if overall_ok else 503

    return JsonResponse({
        "status": "ok" if overall_ok else "degraded",
        "latency_ms": elapsed_ms,
        "checks": checks,
    }, status=status_code)
