# Deployment

Target:

```text
https://kickball.thomgriggs.com
```

## Current Status

The app is committed locally in:

```text
~/Sites/studio/kickball
```

Cloudflare Pages project:

```text
kickball
```

Current production deployment:

```text
https://0263dbdf.kickball-1y4.pages.dev
```

Stable Pages hostname:

```text
https://kickball-1y4.pages.dev
```

Custom domain status:

```text
kickball.thomgriggs.com is attached to the Pages project, but pending DNS.
Cloudflare reports: CNAME record not set.
```

The local GitHub CLI token is currently invalid, so the repository could not be created or pushed from Codex yet.

Refresh auth with:

```sh
gh auth login -h github.com
```

## Cloudflare Pages Path

Cloudflare is the deployment target. GitHub is only the source repository.

Recommended setup:

1. Push this local repo to GitHub as `thomgriggs/kickball`.
2. In Cloudflare, go to Workers & Pages.
3. Create a Pages project.
4. Connect the `thomgriggs/kickball` GitHub repository.
5. Use these build settings:

```text
Project name: kickball
Production branch: main
Framework preset: None
Build command: none
Build output directory: /
Root directory: /
```

6. Add the custom domain:

```text
kickball.thomgriggs.com
```

If `thomgriggs.com` is already managed in Cloudflare DNS, Cloudflare can create the DNS record during custom domain setup.

If adding the DNS record manually, create:

```text
Type: CNAME
Name: kickball
Target: kickball-1y4.pages.dev
Proxy status: Proxied
```

## Push Source To GitHub

From `~/Sites/studio/kickball`:

```sh
gh repo create thomgriggs/kickball --public --source=. --remote=origin --push
```

Or use the helper script:

```sh
./scripts/publish-github.sh
```

## Direct Wrangler Deploy Alternative

If you want to deploy without GitHub integration:

```sh
npx wrangler pages deploy . --project-name=kickball
```

You will still add `kickball.thomgriggs.com` as a Cloudflare Pages custom domain.

## After Deploy

On a phone:

1. Open `https://kickball.thomgriggs.com`.
2. Add it to the home screen.
3. Test scoring while on cellular.
4. Confirm refresh keeps local game state.
5. Put phone in airplane mode and confirm the app still opens after first visit.
