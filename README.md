# 🐾 Cute Error Server

Adorable, customizable error pages served dynamically — with templating, host-based fallback, dark mode, and serious snuggle vibes.

> [!TIP]
> Because even downtime deserves to be delightful. ☁️ 💤

---

## 🧩 What This Does

This service is designed to be used with a reverse proxy like **Traefik** to provide pretty error pages. In particular, [Traefik Error Pages](https://doc.traefik.io/traefik/middlewares/http/errorpages/). It:

- Renders EJS templates like `/503`, `/404`, or for any HTTP status
- Uses the `X-Original-Host` header to load per-domain templates
- Supports **fallback logic**:
  1. User's `{host}/{status}.ejs`
  2. User's `default/{status}.ejs`
  3. Built-in default templates
- Has cozy styles, dark mode and kitten-themed defaults 🐱


## 🛠 Usage with Traefik

### 🐳 `docker-compose.yml`

Add this service to your stack to handle errors from any service behind Traefik. It will catch errors and render cute pages based on the status code.

```yaml
services:
  cute-error-server:
    depends_on:
      - traefik
    container_name: cute-error-server
    image: ghcr.io/sethvoltz/cute-error-server:latest
    restart: unless-stopped
    volumes:
      - ./custom-pages:/data/custom:ro
    networks:
      - traefik
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.cute-error-server-rtr.entrypoints=https"
      - "traefik.http.routers.cute-error-server-rtr.rule=Host(`errors.example.com`)"
      - "traefik.http.routers.cute-error-server-rtr.service=cute-error-server-svc"
      - "traefik.http.services.cute-error-server-svc.loadbalancer.server.port=8080"
      - "traefik.http.middlewares.errors-middleware.errors.status=502,503"
      - "traefik.http.middlewares.errors-middleware.errors.service=cute-error-server-svc"
      - "traefik.http.middlewares.errors-middleware.errors.query=/{status}"
```

Then add the middleware to your services:

```yaml
services:
  my-service:
    # ...
    labels:
      # ...
      - "traefik.http.routers.my-service-rtr.middlewares=errors-middleware@docker"
```

Optionally, you can add an HTTPBin test container to ensure it is working:

```yaml
services:
  httpbin:
    container_name: httpbin
    image: kennethreitz/httpbin:latest
    restart: unless-stopped
    networks:
      - traefik
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.httpbin-rtr.entrypoints=https"
      - "traefik.http.routers.httpbin-rtr.rule=Host(`httpbin.example.com`)"
      - "traefik.http.routers.httpbin-rtr.middlewares=errors-middleware@docker"
      - "traefik.http.routers.httpbin-rtr.service=httpbin-svc"
      - "traefik.http.services.httpbin-svc.loadbalancer.server.port=80"
```

## 📂 Template Lookup Order

On error, the service will try to render (in order):

1. /data/custom/<host>/<status>.ejs
2. /data/custom/default/<status>.ejs
3. /app/views/built-in/<status>.ejs

Built-in 404 and 503 templates are included.


## 💻 Development

### 📦 Requirements

- Node.js v20+
- Docker (for container builds)

### ▶️ Run Locally

```bash
npm install
npm run dev
```

Then test:

```bash
curl -H "X-Original-Host: app.example.com" http://localhost:8080/503
```


## 🐳 Docker

### 🔨 Build

```bash
docker build -t cute-error-server .
```

### ▶️ Run

```bash
docker run -it --rm -p 8080:8080 -v "$(pwd)/examples":/data/custom cute-error-server
```


## 🚀 Build & Release

1. `release-please` for versioning
  - Auto-opens PRs with changelog + version bump
  - On merge, creates a GitHub Release (e.g. v1.0.2)
2. Docker Release Workflow
  - Runs on new GitHub Releases
  - Tags image as v1.0.2 and latest
  - Publishes to GHCR

### ✅ Commit Conventions

Commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard. This is a lightweight convention on top of commit messages. It provides an easy set of rules for creating an explicit commit history. This allows for automatic generation of changelogs and other useful features. The commit message should be structured as follows:

```plaintext
<type>[optional scope]: <description>
```

e.g.

```plaintext
feat: allow provided config object to extend other configs
```

or with a scope:

```plaintext
fix(server): stop crashing when there are no users
```

The following table lists common commit types and their meanings:

| Commit Type | Title                    | Description                                                                                                 | Emoji  |
| ----------- | ------------------------ | ----------------------------------------------------------------------------------------------------------- |:------:|
| `feat`      | Features                 | A new feature                                                                                               | ✨     |
| `fix`       | Bug Fixes                | A bug Fix                                                                                                   | 🐛     |
| `docs`      | Documentation            | Documentation only changes                                                                                  | 📚     |
| `style`     | Styles                   | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)      | 💎     |
| `refactor`  | Code Refactoring         | A code change that neither fixes a bug nor adds a feature                                                   | 📦     |
| `perf`      | Performance Improvements | A code change that improves performance                                                                     | 🚀     |
| `test`      | Tests                    | Adding missing tests or correcting existing tests                                                           | 🚨     |
| `build`     | Builds                   | Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)         | 🛠     |
| `ci`        | Continuous Integrations  | Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs) | ⚙️     |
| `chore`     | Chores                   | Other changes that don't modify src or test files                                                           | ♻️     |
| `revert`    | Reverts                  | Reverts a previous commit                                                                                   | 🗑     |


## 🧁 Customize It

Templates receive:

```ejs
<%= status %>
<%= host %>
<%= timestamp %>
```

Built-in templates use `layout.ejs` layout with cozy CSS and dark mode support.

Want unicorns instead of kittens? You do you. 🦄


## 📜 License

MIT. Free to nap with. 💕
