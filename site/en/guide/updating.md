# Updating

```sh
docker compose pull
docker compose up -d
```

Updating and recreating the containers preserves all data: the client's profile
(`qq_profile`) and installed binary (`qq_install`) live in named volumes, while
`./data`, `./workspace`, and `./logs` are host bind mounts that remain intact.

## Pinning a release tag

When `PERSONAL_BOT_TAG` in `.env` is left empty, `docker compose pull` tracks
`latest` (the newest release). Set it to a specific release tag such as
`v2026.1025.0` to pin that version; subsequent pulls will only pick up rebuilds
of that tag. To switch versions, update `PERSONAL_BOT_TAG` and run
`docker compose up -d`.

## When a release updates the pinned QQ build

The `qq` image baking in the SHA-256 of its pinned QQ build writes a completion
stamp into the `qq_install` volume on first install. As long as that stamp
exists, later starts skip installation without re-checking the version. **If a
new release changes the pinned QQ build, remove the `qq_install` volume before
starting the updated stack** so the new client package is installed:

```sh
docker compose down
docker volume ls | grep qq_install   # find the volume ending in qq_install (prefixed with the project name)
docker volume rm <volume-name>
docker compose up -d
```

Do not remove `qq_profile`: that volume holds the login state and local message
databases, and deleting it requires a fresh QR scan.

## After upgrading

- Open [Overview](./console/) and check whether the **待处理** card appears at
  the top: any missing setup (no admin, no main model, missing Jev key, or a
  failed skill update) is listed there with a direct action button.
- The database key in `data/driver/secrets/db_key` remains valid across normal
  upgrades and does not need to be re-extracted.
