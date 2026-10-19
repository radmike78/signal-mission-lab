#!/usr/bin/env bash
# Builds an OCI image and checks rootless Podman without host exposure or credentials.
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ "$(podman info --format '{{.Host.Security.Rootless}}')" != true ]]; then
  echo 'Run this check as an unprivileged Podman user.' >&2
  exit 1
fi
podman build --format oci -f deploy/Containerfile -t localhost/signal-mission-lab:ci .
sml_check="sml-check-${RANDOM}-$$"
sml_secret="sml-secret-${RANDOM}-$$"
trap 'podman rm -f "$sml_check" >/dev/null 2>&1 || true; podman secret rm "$sml_secret" >/dev/null 2>&1 || true' EXIT
podman run -d --name "$sml_check" --network none --read-only \
  --cap-drop all --security-opt no-new-privileges --pids-limit 128 \
  --memory 256m --cpus 1 -e SML_SERVE_WEB=1 localhost/signal-mission-lab:ci
podman exec "$sml_check" python -c '
import os,time,urllib.request
assert os.getuid()==10001
for attempt in range(30):
    try:
        with urllib.request.urlopen("http://127.0.0.1:8080/health",timeout=2) as response:
            assert response.status==200
            assert response.headers["Cache-Control"]=="no-store"
        break
    except OSError:
        if attempt==29: raise
        time.sleep(1)
for path,expected in [("/",b"Signal Mission Lab"),("/legacy/",b"Signal Mission Lab"),("/api/graph",b"equipment")]:
    with urllib.request.urlopen("http://127.0.0.1:8080"+path,timeout=3) as response:
        assert expected in response.read()
        assert "frame-ancestors" in response.headers["Content-Security-Policy"]
try:
    open("/app/runtime-write-check","w")
except OSError:
    pass
else:
    raise AssertionError("Application filesystem must be read-only")
'
printf '%s' 'postgresql://synthetic:synthetic@db.invalid/lab?sslmode=verify-full' | podman secret create "$sml_secret" - >/dev/null
podman run --rm --network none --read-only --cap-drop all --security-opt no-new-privileges \
  --secret "$sml_secret,type=mount,target=sml-db-test,uid=10001,gid=10001,mode=0400" \
  -e SML_DATABASE_URL_FILE=/run/secrets/sml-db-test localhost/signal-mission-lab:ci \
  python -c 'import os,stat; from backend.store import configured_store; assert os.getuid()==10001; assert stat.S_IMODE(os.stat("/run/secrets/sml-db-test").st_mode)==0o400; assert not configured_store().sqlite'
echo 'Rootless Podman OCI build, mounted secret and constrained runtime checks passed.'
