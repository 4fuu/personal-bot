# Updating

```sh
docker compose pull
docker compose up -d
```

Data survives. The client's profile and its install are both volumes, so a
recreate loses nothing; `./data`, `./workspace` and `./logs` are bind mounts and
stay as they are.

## Pinning a version

With `PERSONAL_BOT_TAG` empty, `docker compose pull` tracks `latest` (the newest
release); set it to a tag such as `v2026.1025.0` to pin one, and a pull then only
picks up a rebuild of that same tag. Changing version is changing that one value
and running `up -d` again.

## When the pinned QQ build changes

The image carries the sha256 of the QQ build it installs, and the install leaves a
stamp in the `qq_install` volume: with the stamp present the install is skipped
and the pin is not re-checked. So **if a release changes the pinned QQ build,
remove that volume first**, or the old build keeps being used:

```sh
docker compose down
docker volume ls | grep qq_install   # the name ending in qq_install, prefixed with the project name
docker volume rm <the name listed above>
docker compose up -d
```

Do not remove the client's profile (`qq_profile`): that is the login state and the
local message history, and losing it costs a new QR scan.

## After an upgrade

- Open [概览](./console/) and look at 待处理: problems such as no admin, no main
  model or no Jev key are listed there, each with the button that fixes it.
- The database key usually needs nothing: it lives in
  `data/driver/secrets/db_key` and stays valid across restarts.
