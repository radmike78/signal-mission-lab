# Rootless Podman deployment

The existing React client, FastAPI API, public corpus and legacy client are packaged into one OCI application image. PostgreSQL remains a separate private service. This runbook does not provision your server, TLS, organizational identity or database. No Docker daemon or Compose provider is required.

## Build and local training

Use an unprivileged Linux service account with rootless Podman, subuid/subgid mappings, slirp4netns, systemd user services and cgroup v2. The Quadlet targets Podman 4.9 or later; validate against your installed version. Keep SELinux and the default seccomp policy enabled. Install distro-supported packages using your server's approved process.

From the repository root:

```bash
podman build --format oci -f deploy/Containerfile -t localhost/signal-mission-lab:reviewed .
bash scripts/podman-smoke.sh
mkdir -p ~/.config/containers/systemd
install -m 0644 deploy/quadlet/signal-mission-lab.container ~/.config/containers/systemd/
systemctl --user daemon-reload
systemctl --user start signal-mission-lab.service
systemctl --user status signal-mission-lab.service
curl --fail http://127.0.0.1:8080/health
```

Open `http://localhost:8080` on that host. To view a remote host privately, use an SSH tunnel (`ssh -L 8080:127.0.0.1:8080 user@server`) and open localhost on your workstation. Do not change the listener to a public HTTP address.

Quadlet's `[Install]` section supplies startup dependencies; do not run `systemctl enable` on the generated service. To keep the user service available after logout/boot, the host administrator must enable lingering for the dedicated account (`loginctl enable-linger ACCOUNT`). Do not run the container as root to work around missing user-service configuration.

The unit uses container UID 10001, a read-only filesystem, dropped capabilities, no-new-privileges, CPU/memory/PID limits, a health check and on-failure restarts. It mounts no application/data directory. Rootless Podman supplies necessary writable runtime temporary filesystems; these are not durable storage. Image pulls are disabled at startup; build/load a reviewed image first. Egress is not automatically restricted by this sample: enforce host/network rules allowing only required database/DNS/TLS dependencies. The smoke check uses no network namespace connectivity and executes HTTP checks inside the container.

## Optional persistent accounts

The public training client works without a database. For accounts, prepare PostgreSQL using [ACCOUNTS.md](ACCOUNTS.md): explicit migrations with an administrative identity, restricted API grants, verify-full TLS, trusted CA, backups and recovery. Never store the database in the disposable application container. There is no automatic database initialization or embedded PostgreSQL in this image.

Create a Podman secret from a securely provisioned runtime-role connection URL file:

```bash
podman secret create sml-db-runtime /secure/path/runtime-db-url
mkdir -p ~/.config/containers/systemd/signal-mission-lab.container.d
install -m 0600 deploy/quadlet/accounts.conf.example ~/.config/containers/systemd/signal-mission-lab.container.d/accounts.conf
```

Before starting, customize the drop-in's CA path and supply a URL containing `sslmode=verify-full` and `sslrootcert=/run/db-ca.crt`. Match the database DNS name to its certificate. Use a private CA-file copy for SELinux relabeling; never disable SELinux or mount a broad credential directory. The mounted secret is readable by container UID 10001 only. Configure `SML_DATABASE_URL_FILE` rather than putting a password in the image, unit, command line or environment. Supplying both the file and direct URL settings fails closed. Podman secret storage is not a substitute for host disk encryption and a production secret-management policy.

Migrations/provisioning use the same image with `python -m backend.manage ...`, but a **separate administrator secret**, explicitly mounted CA, and required private database connectivity. Run those as short-lived owner-only administration containers; never mount the administrator secret into the API service or publish provisioning output to logs. Recreate the application container after rotating its runtime secret using your Podman version's supported secret workflow. Validate rotation before revoking the prior database credential.

## Public HTTPS hosting

The supplied unit is a loopback training baseline. Public hosting requires a trusted TLS reverse proxy, hostname allowlist, edge limits and a tested proxy path. Accounts intentionally reject plain HTTP. Do not set `SML_ENV=local` or `test` for production.

Set `SML_ALLOWED_HOSTS` to your explicit domain in a Quadlet drop-in. The image ignores proxy headers by default. If terminating TLS at a proxy, override `Exec=` with the existing Uvicorn command plus `--proxy-headers --forwarded-allow-ips` restricted to the actual proxy peer addresses observed by the container. Do not trust `*` or assume a peer address: rootless port forwarding can affect source addresses. Restrict access to the origin listener, strip untrusted incoming forwarding headers at the proxy, and test that outside clients cannot spoof the scheme. Validate effective HTTPS/HSTS/CSP headers and authenticated workflows end-to-end before exposure.

## Operations and rollback

Use `journalctl --user -u signal-mission-lab.service` for sanitized service errors and `podman healthcheck run signal-mission-lab` for a manual health check. Keep access/body/token logging disabled. Define external availability alerts, audit retention and encrypted off-host database backups. Health checks do not exercise authenticated database transactions.

Retain the previous reviewed image ID and deployment configuration before updating. Build/tag the new reviewed image, then `systemctl --user restart signal-mission-lab.service` and verify health, static assets, account isolation and database access. Roll back by restoring the prior image reference/tag and restarting; database rollback is separate and requires a compatible schema and tested restore plan. Do not auto-update mutable images or delete/prune old images/volumes as part of deployment.

## Validation limits

`scripts/podman-smoke.sh` builds with Podman as a non-root user and tests the OCI runtime with no network, read-only storage, UID 10001, bounded resources, health, UI, legacy content and graph API. Dedicated CI validates Quadlet generation and runs that script. The older Docker image definition is retained for compatibility and tested for parity with the Containerfile. Local unit tests cover file-mounted secret configuration and TLS enforcement.

Podman is unavailable in the editing workspace; actual Podman runtime evidence comes from the dedicated CI job. Real-host Quadlet boot/linger, SELinux, TLS/proxy, database secrets/connectivity, backups, resource sizing and deployment acceptance still require validation on your chosen host. This is not a production-readiness claim.

References: [Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html), [Podman secrets](https://docs.podman.io/en/latest/markdown/podman-secret-create.1.html).
