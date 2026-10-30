# create-node-backend

Internal, versioned project generator. Each generated repository owns its backend,
data, documentation and decisions; a project can serve one or several clients.
The generator is **not** a production authentication or payment implementation.

## Team usage

Prerequisites: Node.js 24 LTS and Git. Docker is optional at generation time.
Obtain an approved archive and checksum from your internal distribution location.

```powershell
npm exec --package="C:\TeamTools\create-node-backend-1.0.0.tgz" -- create-node-backend
```

Linux/macOS equivalent:

```sh
npm exec --package=/approved/path/create-node-backend-1.0.0.tgz -- create-node-backend
```

The CLI asks for project name, clients, planning profiles and production data hosting.
It previews the configuration, creates files and an empty Git repository. It does
not commit, set a remote, deploy, collect secrets, or run Docker by default.
Client names and profiles are onboarding facts, not permission to invent features.
Redis Compose configuration is provided separately; BullMQ, payments, GPS, Rust and
telemetry-vendor profiles provide implementation skills, not fake running services.

For automation, save a non-secret configuration:

```json
{
  "schemaVersion": 1,
  "name": "delivery-api",
  "description": "Backend for the delivery project",
  "clients": ["user", "driver", "admin"],
  "profiles": ["redis", "bullmq"],
  "dataHosting": "pending"
}
```

```powershell
npm exec --package="C:\TeamTools\create-node-backend-1.0.0.tgz" -- create-node-backend --config setup.json --non-interactive --yes --parent C:\Projects
```

The parent must exist and must be outside an existing Git worktree. Nonempty
destinations are rejected. `--docker build` or `--docker start` opts into local
Docker actions. If those actions fail the created repository is preserved.
Automatic Docker actions refuse remote/TCP contexts and existing Compose resources
with the same project name. They must not overwrite another project's stack.

## Maintaining this kit (source checkout)

```sh
npm ci
npm run check
cd templates/backend
npm ci
npm run docs:generate
npm run check
cd ../..
npm run pack:release
npm run test:package
```

`npm run pack:release` builds `release/create-node-backend-1.0.0.tgz` and its SHA-256
checksum. It never uploads or publishes. Generator dependencies may be resolved
by npm; an offline installation is not promised.

- [Release and upgrade process](doc/releasing.md)
- [Compatibility and verification](doc/verification.md)
- [Approved architecture decision](doc/decisions/0001-generator-and-template.md)

The generated project's `doc/README.md` is its navigation entrypoint.
The runtime is Docker-first, with an Express/Prisma application behind Nginx.
Production authentication remains deliberately unconfigured: sample protected
endpoints return 401 until an approved provider is implemented.
