# Docker-first development

Prerequisites: Docker Engine/Compose 2.24+ on Linux, or Docker Desktop with Linux
containers on Windows. The application does not require host Node.js.
Generation itself requires Node.js 24 and Git.

From the project directory:

```sh
docker compose -f compose.yaml -f compose.development.yaml -f deploy/compose/self-hosted-data.yaml up --build -d --wait
```

Nginx is reachable only at `http://127.0.0.1:8080`; set `HTTP_PORT` if needed.
PostgreSQL is private. The development credentials are deliberately local-only.
The migration service completes before the API starts.
GET `/health/live` and `/health/ready` should succeed. Notes endpoints return 401
because auth is pending; never disable it to demonstrate a success response.

```sh
docker build --target test -t backend-tests:local .
docker compose -f compose.yaml -f compose.development.yaml -f deploy/compose/self-hosted-data.yaml run --rm api npm run test:integration
docker compose -f compose.yaml -f compose.development.yaml -f deploy/compose/self-hosted-data.yaml logs --tail 100 api
docker compose -f compose.yaml -f compose.development.yaml -f deploy/compose/self-hosted-data.yaml down
```

Do not add `--volumes` to normal shutdown; it deletes development data.
Optional Redis: add `-f deploy/compose/redis.yaml --profile redis`. This starts
infrastructure only; it does not implement caching/jobs. Never publish its port.

With host Node.js 24, optional contributor commands are `npm ci`,
`npm run docs:generate`, `npm run check`, and `npm run build`.
Set `DATABASE_URL` only for explicit local database operations. Unit tests do not
need a database. `npm run test:containers` requires Docker and creates an isolated
disposable stack, not your normal project volumes.

On Windows, an IDE/filesystem watcher can lock Vitest's intermediate coverage
directory. Set `COVERAGE_DIRECTORY` to an unwatched temporary directory if cleanup
reports EBUSY. This changes only the report location, not tests or coverage gates.

Read `project.setup.json` and resolve pending requirements before feature work.
