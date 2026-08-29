---
name: eas-android-build
description: Build an installable Android .apk of this app in the cloud via EAS Build and deliver it to the user. Trigger this whenever the user asks for an APK, an Android build, to "build the app", to test the app on a real Android phone, or anything like "дай мне apk", "собери приложение", "хочу установить это на телефон" — even if they don't name EAS or eas-cli explicitly. Not for iOS builds or for just running the app locally in a simulator/emulator (use the `run` skill or the Expo dev server for that).
---

# EAS Android APK build

This project is built with Expo and already has an `eas.json` `preview` profile
configured for `"buildType": "apk"` — a real installable `.apk` file, not the
`.aab` bundle Google Play expects. Cloud builds run on Expo's infrastructure,
so no local Android SDK/NDK/`adb` is needed on this machine (and there usually
isn't one — check before assuming otherwise).

Each build consumes the user's EAS account build minutes/quota and takes
roughly 5–15 minutes. Being asked for an APK is itself the go-ahead to spend
that quota — don't re-ask permission to start the build. Do stop and ask
about the one thing below that isn't yours to decide silently: uncommitted
changes.

## 1. Confirm the tooling actually resolves

`eas-cli` is the package name — `npx eas ...` does **not** resolve to it and
fails with a confusing npm error. Always use:

```bash
npx eas-cli@latest --version
```

## 2. Confirm the user is logged in

```bash
npx eas-cli@latest whoami
```

EAS sessions are cached in `~/.expo/state.json`, so on a machine that's been
used for this project before this will usually already show a username —
don't assume you need to log in.

If it prints something like "Not logged in": **stop and tell the user to run
`eas login` themselves**, in their own terminal. Logging in means entering an
Expo account password (or an interactive browser auth flow) — that's a
credential entry only the user should do, not something to attempt on their
behalf. Once they confirm they're logged in, re-run `whoami` to verify before
continuing.

## 3. Check for uncommitted changes

EAS Build packages up the current project directory as it sits on disk right
now — it doesn't care whether anything is committed. That's exactly why this
step matters: if there are uncommitted edits, the build will silently include
or exclude them in a way that may not match what the user thinks they're
shipping.

```bash
git status
```

- If the tree is clean, move on.
- If there are uncommitted changes, show the user what's modified and ask
  whether to commit them first (following this repo's normal commit
  conventions — see CLAUDE.md/AGENTS.md and past commit messages for style)
  or to proceed without them. Don't silently decide either way; this is a
  judgment call about what "the app" means that belongs to the user.

## 4. Sanity-check the build profile

Confirm `eas.json` still has a profile that produces an APK (normally
`preview`, with `"android": {"buildType": "apk"}`). If someone has changed
this since the skill was written, or the user asks for a different profile
(e.g. `production`), use the profile they actually want instead of assuming
`preview` — a `production` Android profile without an explicit `buildType`
defaults to an `.aab`, which won't install directly on a phone the way an
`.apk` does. If that mismatch matters for what the user asked for, flag it.

## 5. Kick off the build in the background

```bash
npx eas-cli@latest build --platform android --profile preview --non-interactive
```

Run this as a background command (`run_in_background: true` in the Bash
tool) — it blocks for the full build duration otherwise. `--non-interactive`
matters: without it, EAS may prompt (e.g. about generating build
credentials) and a prompt with no one able to answer it will just hang.

Once it's running, tell the user the build has started and roughly how long
it usually takes, then stop — **don't poll for progress**. The background
task will notify you when it finishes; sleeping in a loop or repeatedly
checking wastes turns for no benefit.

## 6. Read the result and grab the artifact

When the background task completes, read its output file. A successful run
ends with a block like:

```
🤖 Android app:
https://expo.dev/artifacts/eas/<hash>.apk
```

along with a build log URL earlier in the output
(`https://expo.dev/accounts/<account>/projects/<project>/builds/<id>`) —
worth keeping around in case something looks off and the user wants to dig
into the logs later.

If the build failed instead, don't retry blindly — read the failure output,
explain what went wrong in plain terms, and surface the log URL so the user
(or you, with their go-ahead) can investigate further.

## 7. Download and deliver the APK

Download the artifact into the scratchpad directory and send it to the user
as a file — a link alone makes them leave the conversation and doesn't match
what "give me the app as an apk" is actually asking for:

```bash
curl -L -s "<artifact-url>" -o "<scratchpad>/<AppName>.apk" -w "HTTP %{http_code}, size %{size_download} bytes\n"
```

Use the app's display name (from `app.json`'s `expo.name`) for the filename
so it's recognizable, then hand it to the user with `SendUserFile`
(`status: "proactive"` if you're delivering it after they've stepped away
from the conversation while the build ran, `"normal"` if they're actively
waiting on it). Mention the build profile/architecture and that installing
it will require allowing "install from unknown sources" on the phone, since
it isn't distributed through the Play Store.
