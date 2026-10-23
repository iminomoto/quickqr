# QuickQR — Docker Deployment Guide

**Version 2.1.1 · October 2026**

This guide walks through deploying QuickQR on a barebone Linux machine — bare
metal or VM — that has **nothing installed except Docker**. Every command is
copy-pasteable. By the end you will have the app running behind HTTPS with
automatic restarts and a container health check.

---

## 1. What you are deploying

QuickQR is a **fully client-side** QR generator. The server never sees QR
data: the browser builds, validates, and renders every code locally. The
container's only job is to serve static assets and a server-rendered shell.

| Property | Value |
|---|---|
| Image | Multi-stage build (`deps → build → runner`), `node:20-alpine` |
| Runtime | Next.js standalone server (`server.js`), non-root user `nextjs` |
| Listen port (inside container) | `3000` |
| State / database | **None** — nothing to back up except `.env` |
| Health check | `wget http://127.0.0.1:3000/` every 30 s |
| Restart policy | `unless-stopped` (survives host reboots) |
| Memory (idle) | Roughly 50–100 MB |

Because the app is stateless, deployment is deliberately boring: build the
image, run it, put a TLS proxy in front.

### Machine sizing

- **Minimum:** 1 GB RAM, 1 vCPU, ~5 GB disk (the build is the hungry part).
- **Recommended:** 2 GB RAM — a `next build` can OOM on 1 GB hosts without
  swap (see §12 if the build dies with exit code 137).
- **Architecture:** x86-64 or arm64 both work (base images are multi-arch).

### Software prerequisites

- Linux with systemd (Ubuntu 22.04+/Debian 12+ examples below; any distro
  with Docker Engine ≥ 24 and Docker Compose plugin v2 works).
- A domain name pointing at the machine's IP (only needed for HTTPS in §9;
  you can skip it for IP-only testing).

---

## 2. Install Docker Engine + Compose plugin

Skip this section if `docker --version` and `docker compose version` already
work.

### Option A — official repository (recommended, Ubuntu/Debian)

```bash
# As a sudo-capable user:
sudo apt-get update
sudo apt-get install -y ca-certificates curl

sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin
```

> On Debian, replace `ubuntu` with `debian` in the two URLs.

### Option B — convenience script

```bash
curl -fsSL https://get.docker.com | sudo sh
```

### Verify + allow non-root use

```bash
sudo docker run --rm hello-world     # expect the Hello message
docker compose version               # expect v2.x
sudo usermod -aG docker "$USER"      # then log out and back in
```

The `docker` group is effectively root-equivalent — that is normal and
accepted for a single-purpose deploy host.

---

## 3. Get the source onto the machine

The build context must be the repo root (it contains `Dockerfile`,
`docker-compose.yml`, `.dockerignore`).

### Option A — clone from git

```bash
sudo apt-get install -y git          # if git is missing
git clone https://github.com/YOUR_USER/quickqr.git
cd quickqr
```

### Option B — upload a tarball (no git server needed)

On your **development machine**:

```bash
cd /path/to/quickqr
tar --exclude node_modules --exclude .next --exclude .git \
  -czf /tmp/quickqr.tgz .
scp /tmp/quickqr.tgz user@your-server:~
```

On the **server**:

```bash
mkdir -p ~/quickqr && tar -xzf ~/quickqr.tgz -C ~/quickqr
cd ~/quickqr
```

Quick check that nothing essential is missing:

```bash
ls Dockerfile docker-compose.yml .env.example   # all three must exist
```

---

## 4. Configure the environment

`NEXT_PUBLIC_SITE_URL` is the canonical origin baked into metadata,
sitemap, robots.txt, and OG images.

```bash
cp .env.example .env
nano .env        # or vim / vi
```

Set it to the exact public origin (no trailing slash):

```bash
NEXT_PUBLIC_SITE_URL=https://qr.example.com
```

**Critical build-time semantics:** this value is *inlined at build time*.
Changing it later does **not** take effect on restart — the image must be
rebuilt (§11). If you leave it unset, the app falls back to the placeholder
`https://quickqr.example.com`, which would leak into search metadata.

Serving over a bare IP for a trial run? Use `NEXT_PUBLIC_SITE_URL=http://YOUR_IP`.

---

## 5. Build the image

```bash
docker compose build prod
```

What happens, stage by stage:

1. **deps** — `npm ci` from the lockfile (cached unless `package*.json` change).
2. **build** — `next build` with `output: "standalone"`; inlines the env var
   and self-hosts the fonts.
3. **runner** — slim `node:20-alpine` containing only the standalone output,
   static assets, and `public/`. Runs as non-root `nextjs`, declares the
   `HEALTHCHECK`.

Typical build time: **1–4 minutes** on modern hardware. Progress is quiet;
success ends without errors. If it fails with `Killed`/exit 137, jump to §12.

---

## 6. Start the app

```bash
docker compose up -d prod
docker compose ps
```

Expected `docker compose ps` output (names vary):

```
NAME                STATUS                   PORTS
quickqr-prod-1      Up 1 minute (healthy)    0.0.0.0:3000->3000/tcp
```

`STATUS` cycles `starting → healthy` about 10–15 s after first start
(the health check allows a 10 s start period).

---

## 7. Verify the deployment

```bash
# 1. HTTP status and security headers
curl -I http://localhost:3000/
```

Confirm: `HTTP/1.1 200 OK` plus the security headers the app sets
(`x-content-type-options: nosniff`, `x-frame-options: DENY`,
`strict-transport-security`, and in production a `content-security-policy`).

```bash
# 2. Container health detail
docker inspect --format='{{.State.Health.Status}}' "$(docker compose ps -q prod)"

# 3. Application logs (should be quiet — Ctrl-C only stops following)
docker compose logs -f --tail 100 prod

# 4. Real browser check from your workstation
#    Open http://your-server:3000 — the intro plays, and generating a QR code
#    must work entirely client-side (DevTools → Network: no data leaves).
```

The container ships busybox `wget`; if step 2 ever reports `unhealthy`, run
the probe inside the container:

```bash
docker exec "$(docker compose ps -q prod)" wget -qO- http://127.0.0.1:3000/ | head -5
```

---

## 8. (Optional) Stop exposing port 3000 publicly

If you will put a reverse proxy on the same machine (§9), bind the app to
loopback only so it is unreachable from the internet except through the
proxy. Edit `docker-compose.yml`:

```yaml
    ports:
      - "127.0.0.1:3000:3000"   # was "3000:3000"
```

Recreate: `docker compose up -d prod`. Verify from outside that
`http://your-server:3000` now times out while the proxy domain works.

---

## 9. HTTPS with Caddy (automatic certificates)

Caddy obtains and renews Let's Encrypt certificates automatically — no
certbot cron jobs. Use any other proxy (nginx, Traefik) if you prefer; the
requirement is simply that it forwards to `127.0.0.1:3000` and sets
`X-Forwarded-Proto` (Caddy does both by default).

```bash
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | \
  sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | \
  sudo tee /etc/apt/sources.list.d/caddy-stable.list > /dev/null
sudo apt-get update && sudo apt-get install -y caddy
```

Create the site config:

```bash
sudo tee /etc/caddy/Caddyfile > /dev/null <<'EOF'
qr.example.com {
    encode zstd gzip
    reverse_proxy 127.0.0.1:3000
}
EOF

sudo systemctl reload caddy
```

Before reloading, make sure the DNS **A record** for `qr.example.com`
points at the server IP — Caddy will fetch the certificate on first request.
Then visit `https://qr.example.com`.

---

## 10. Firewall

```bash
sudo apt-get install -y ufw
sudo ufw allow OpenSSH          # keep your SSH access first!
sudo ufw allow 80/tcp           # HTTP (ACME + redirect)
sudo ufw allow 443/tcp          # HTTPS
sudo ufw enable
sudo ufw status
```

Port 3000 needs no rule: with §8 it listens on loopback only; without §8
you may still leave it blocked at the firewall — users go through the proxy.

---

## 11. Day-2 operations

### Update to a new version

```bash
cd ~/quickqr
git pull                        # or re-upload + extract the tarball
docker compose up -d --build prod
```

`--build` is the important part: the running container is a snapshot of the
image. There is roughly 1–3 minutes of downtime while the image rebuilds.

### Restart / stop / status

```bash
docker compose restart prod      # quick restart
docker compose down              # stop and remove the container (image kept)
docker compose up -d prod        # start again
docker compose ps                # status + health
```

The `unless-stopped` restart policy brings the app back automatically after
host reboots and Docker daemon restarts.

### Logs

```bash
docker compose logs -f --tail 200 prod     # follow
docker compose logs --since 1h prod        # last hour only
```

### Backups

There is **no application data** — no database, no uploads, no volumes. The
only files worth backing up are your configuration:

```bash
tar czf ~/quickqr-config-backup-$(date +%F).tgz -C ~/quickqr .env docker-compose.yml
```

### Disk hygiene

```bash
docker system df                                  # what images/build cache use
docker image prune                                # remove dangling layers (safe)
docker compose down --rmi local                   # remove this project's images
docker image prune -a                             # removes ALL unused images
```

Prune old builder cache specifically with `docker builder prune`. Run prunes
occasionally — Next.js rebuilds leave superseded layers behind.

---

## 12. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Build dies with `Killed` or exit `137` | Out of memory during `next build` | Add swap (`fallocate -l 2G /swapfile …`) or use a 2 GB host; rebuild |
| `port is already allocated` | Another service owns host port 3000 | Change the host side of the mapping, e.g. `"8080:3000"`, then `docker compose up -d prod` |
| Health stuck at `starting`, then `unhealthy` | App crashed on boot | `docker compose logs prod`; usually an env/format error; fix and rebuild |
| Metadata/sitemap still show `quickqr.example.com` | `.env` was unset or edited *after* the build | Set `NEXT_PUBLIC_SITE_URL`, then `docker compose build prod` and recreate |
| Blank page, console shows CSP violations | A resource is loaded from an origin the production CSP does not allow | Check the browser console for the blocked URL; self-host the resource or extend the CSP in `next.config.ts`, then rebuild |
| Fonts 404 or headings fall back to system sans | Stale or partial `.next` output | Clean rebuild: `docker compose build --no-cache prod` |
| Code edits on the server have no effect | Prod serves the built snapshot, not source | Expected — rebuild (or use the dev profile locally, never in prod) |
| `no configuration files provided` | Not in the repo root | `cd` to the directory containing `docker-compose.yml` |
| Compose dev profile confusion | `docker compose up app` starts the **dev** service | Prod is the service named `prod`; dev mounts source and publishes host port 3001 |

---

## 13. Security notes

- **Data model:** all QR generation happens in the browser. The server
  handles no user data, so there is nothing to leak and nothing to patch on
  a data layer.
- **Headers:** production responses carry nosniff, frame denial, referrer
  policy, HSTS, and a restrictive CSP (configured in `next.config.ts`).
  Browsers only honor HSTS over HTTPS, so plain-IP testing is unaffected.
- **CSP:** if you add any external script/font/image, verify it against the
  CSP before deploying — the browser will hard-block it otherwise.
- **Non-root:** the container runs as user `nextjs` (uid 1001); `docker exec`
  into it lands unprivileged.
- **Surface:** expose only 80/443 through the proxy; keep Docker itself
  updated (`apt-get upgrade` monthly) and SSH key-only.

---

## 14. Appendix

### A. Service reference (`docker-compose.yml`)

| Service | Profile | Purpose | Host port |
|---|---|---|---|
| `prod` | *(always available)* | Production image (`target: runner`) | `3000` (make it `127.0.0.1:3000` behind a proxy) |
| `app` | `dev` | Live-reload dev server, bind-mounts `./src` + `./app` | `3001` |

### B. Environment variables

| Variable | Required | Stage | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Recommended | **Build** | Canonical origin, e.g. `https://qr.example.com`. Sanitized automatically (adds `https://` if missing, strips quotes/slashes). Falls back to the placeholder if unset. |

### C. One-page cheat sheet

```bash
# First deploy
cp .env.example .env && nano .env
docker compose up -d --build prod
docker compose ps                       # wait for (healthy)

# Update
git pull && docker compose up -d --build prod

# Status / logs / restart
docker compose ps
docker compose logs -f --tail 200 prod
docker compose restart prod

# Health probe
docker inspect --format='{{.State.Health.Status}}' "$(docker compose ps -q prod)"

# Full stop / cleanup
docker compose down
docker compose down --rmi local
docker image prune
```

### D. File map

| Path | Role |
|---|---|
| `Dockerfile` | Multi-stage build; `runner` stage is what runs in prod |
| `docker-compose.yml` | `prod` and `app` (dev) services, build args, ports |
| `.env` | Your local config (git-ignored); read by compose for build args |
| `.env.example` | Template for `.env` |
| `.dockerignore` | Keeps node_modules/.next/.git out of the build context |
| `next.config.ts` | `output: "standalone"`, security headers, prod-only CSP |
| `.github/workflows/ci.yml` | Lint → typecheck → unit tests → build → Playwright E2E |

---

*End of guide. QuickQR v2.1.1 — client-side by design: no data leaves the browser.*
