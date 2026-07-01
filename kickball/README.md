# Kickball Tracker

Mobile-first kickball scoring and stats prototype for Liquid Breakfast Club.

Canonical local project path:

```text
~/Sites/studio/kickball
```

## What It Does Now

- Tracks a live game locally in the browser
- Stores game state in local storage
- Seeds the Liquid Breakfast Club roster
- Tracks player gender designation for coed lineup rules
- Warns for back-to-back men in the kicking lineup
- Warns for more than 10 fielders or more than 5 men on defense
- Tracks current kicker, inning, outs, bases, score, and recent events
- Includes roster, lineup, defense, stats, and admin views

## Open Locally

Open `index.html` directly in a browser.

For PWA/service-worker behavior, serve it over a local web server:

```sh
python3 -m http.server 8080
```

Then visit:

```text
http://localhost:8080
```

Run that from:

```sh
cd ~/Sites/studio/kickball
python3 -m http.server 8080
```

## Deploy Target

Preferred public URL:

```text
https://kickball.thomgriggs.com
```

This repo is static and should be hosted on Cloudflare Pages.

Use these settings:

- Build command: none
- Build output directory: `/`
- Custom domain: `kickball.thomgriggs.com`

See `DEPLOYMENT.md` for the exact Cloudflare Pages and DNS path.

## Known Prototype Limits

- Data is device-local only
- No accounts yet
- No shared live game sync yet
- Split lineup slots are planned but not interactive yet
- Defensive plays are planned but not detailed yet
- Voice scoring is a future feature
