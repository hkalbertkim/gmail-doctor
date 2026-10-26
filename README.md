# Gmail Doctor

**Detect suspicious Gmail settings. Review fixes. Repair with your explicit approval.**

Local-first, open-source CLI for Gmail accounts you own. No mail content is downloaded, no server is operated by this project, and nothing is changed without per-action confirmation.

> **Early developer release.** This is not a complete compromise detection tool, and cannot recover a locked-out account. It has not yet been validated against a real Gmail account. Google OAuth restricted-scope app verification may affect consumer onboarding.

## Try the safe demo

Requirements: Node.js 20+.

```sh
git clone https://github.com/hkalbertkim/gmail-doctor.git
cd gmail-doctor
npm test
node bin/gmail-doctor.js scan --demo
node bin/gmail-doctor.js repair --demo
```

The demo uses a fictional account and performs **no authentication and no writes**.

## Connect your Gmail (advanced testers)

1. Visit Google Cloud Console and create/select a project.
2. Enable the **Gmail API**.
3. Configure Google Auth Platform OAuth consent screen and add yourself as a test user where required.
4. Create an OAuth Client ID of type **Desktop app**, download its JSON file to a private folder outside the repository.
5. In your terminal run:

```sh
export GMAIL_DOCTOR_OAUTH_CLIENT="$HOME/secure/google-desktop-oauth.json"
node bin/gmail-doctor.js scan
node bin/gmail-doctor.js repair --dry-run
node bin/gmail-doctor.js repair
```

The browser opens Google's actual login page. The requested OAuth scope is `gmail.settings.basic`. Refresh token is stored in macOS Keychain; OAuth client JSON stays only at the path you provide. Settings backups are stored with mode 0600 under `~/.gmail-doctor/backups`. There is **no Gmail password prompt**.

**Permission disclosure:** `gmail.settings.basic` can modify some mailbox settings; the OAuth permission itself is not technically read-only. Treat this CLI as powerful. A limited demo profile requires Google consent-screen tester access; general-use Google OAuth verification is separate.

## What it inspects

- Automatic forwarding enabled to an address.
- Filters that forward, trash, skip inbox, or mark messages read.
- Send-as aliases requiring manual review.
- POP/IMAP status.
- Configured forwarding addresses.

## Repairs

Only two automated operations in v0.1: **disable automatic forwarding** and **delete an individually selected filter**. A local settings snapshot is created before any repairs, but automatic rollback is **not** implemented. Do not approve removal of filters you recognize. Repeat scan after repairs.

**Not checked:** active device sessions, stolen cookies, password changes, recovery email/phone, Family Link, third-party OAuth apps. **Not supported:** reclaiming inaccessible Gmail accounts, automatic send-as alias deletion for consumer accounts, automatic OAuth grant revocation. Use [Google Security Checkup](https://myaccount.google.com/security-checkup) and [Google Account Recovery](https://accounts.google.com/signin/recovery).

## Security and privacy

- Scans account settings only; no Gmail message-body or attachment access.
- Makes no third-party analytics/network requests.
- OAuth authorization talks directly to Google's endpoints.
- No automatic changes. Every repair requires typing `YES`.
- A partial scan disables repairs.
- Never commit OAuth credentials, refresh tokens or local backups.

## Development

```sh
npm test
npm run check
```

MIT Licensed. Contributions welcome for independent tests, threat scenarios, and Google OAuth verification improvements.
