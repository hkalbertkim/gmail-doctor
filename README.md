<div align="center">

<img src="assets/readme-hero.svg" alt="Gmail Doctor — Audit Gmail settings. Keep your inbox yours." width="100%" />

# Gmail Doctor

**Audit Gmail settings. Keep your inbox yours.**

[![Release](https://img.shields.io/github/v/release/hkalbertkim/gmail-doctor)](https://github.com/hkalbertkim/gmail-doctor/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Status](https://img.shields.io/badge/status-developer%20preview-orange)

A local-first, open-source terminal tool for reviewing Gmail forwarding rules, potentially risky filters, and settings across multiple Google accounts.

[Quick start](#quick-start) · [Connect Gmail](#connect-your-google-account) · [Safety](#security-and-limitations) · [Privacy](docs/PRIVACY.md) · [Terms](docs/TERMS.md)

</div>

> **Developer Preview.** Google OAuth verification is pending. Connecting your own account currently requires a Google Cloud **Desktop OAuth client** and approved test access. No public one-click sign-in yet.

## What it does

| Capability | Supported today |
| --- | --- |
| Scan multiple connected Gmail accounts | Yes |
| Identify mail-forwarding filters and filters that trash or hide messages | Yes |
| Review sender aliases, POP/IMAP, and configured forwarding addresses | Yes |
| Keyboard-driven interactive terminal dashboard | Yes |
| Delete **selected** Gmail filters after explicit approval | Yes |
| Save a local settings backup before deletion | Yes |
| Restore filters automatically from backup | **Not yet** |
| Detect stolen logins, unknown sessions, Family Link or compromised recovery info | **No** |

**A warning is not proof of hacking.** Legitimate forwarding rules can be flagged. Confirm who created a rule before removing it. Gmail Doctor cannot recover a locked-out Google account.

## Quick start

Node.js 20+ is required. The current credential store uses **macOS Keychain**.

```bash
git clone https://github.com/hkalbertkim/gmail-doctor.git
cd gmail-doctor
npm ci
npm link

# Run without connecting to Gmail
gmail-doctor scan --demo

# Open the interactive terminal dashboard
gmail-doctor
```

The demo uses fictional settings; it never logs into Google or modifies an account.

## Connect your Google account

Until Google approves the public OAuth application:

1. Create/select a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Gmail API** and configure the OAuth consent screen (External / Testing for your test accounts).
3. Register your email as an approved **Test user**.
4. Create a **Desktop app** OAuth client and download its JSON **outside** this repository.
5. Configure the CLI once:

```bash
gmail-doctor setup --client ~/Downloads/your-desktop-oauth.json
gmail-doctor account add --account you@gmail.com
gmail-doctor account list
gmail-doctor scan --all
```

To add more accounts, register them as permitted OAuth test users, then repeat `gmail-doctor account add --account other@example.com`. Google opens the browser for consent; **never enter your Google password in Gmail Doctor**.

## Interactive scanning and repair

Run `gmail-doctor` for an interactive dashboard. Arrow keys navigate, Space selects checkboxes, Enter advances.

The repair flow is deliberately explicit:

1. Choose an account and review the findings.
2. Select only filters **you intend to delete**.
3. Inspect the repair plan; type `REPAIR` to confirm.
4. The CLI rechecks the selected filters, saves a local settings backup, applies authorized deletions, and rescans.

You can inspect a repair plan without making changes:

```bash
gmail-doctor repair --account you@gmail.com --dry-run
```

**Warning:** Deleting a filter can disrupt expected workflows. Gmail Doctor currently **cannot automatically restore a deleted filter**. A settings backup does not mean rollback is available. Do not select rules you recognize and need.

## CLI reference

```text
gmail-doctor                                    Interactive dashboard
gmail-doctor scan --demo                        Safe sample scan
gmail-doctor account add --account EMAIL        Connect another account
gmail-doctor account list                       List registered accounts
gmail-doctor scan --all                         Scan all connected accounts
gmail-doctor scan --account EMAIL               Scan one account
gmail-doctor scan --account EMAIL --json        Structured output
gmail-doctor repair --account EMAIL --dry-run   Review, no writes
gmail-doctor repair --account EMAIL             Explicitly approve changes
gmail-doctor logout --account EMAIL             Remove local token
```

## Security and limitations

- Reads Gmail **settings**, not message bodies or attachments.
- Uses Google's OAuth sign-in; never collects Gmail passwords.
- Stores refresh tokens in macOS Keychain; account IDs and settings backups remain on the local machine.
- Sends no mailbox content to a Gmail Doctor backend; network requests to Google are necessary for OAuth and Gmail API.
- OAuth scope `gmail.settings.basic` can **modify** Gmail settings; it is **not a read-only scope**.
- Does not scan sign-in sessions, stolen cookies, recovery options, Google Family Link or third-party OAuth grants.
- A clean scan of available settings **does not prove the account is safe**.
- Some setting changes require manual action in [Gmail Settings](https://mail.google.com/mail/u/0/#settings/general) or [Google Security Checkup](https://myaccount.google.com/security-checkup).

Security concerns: open a [GitHub issue](https://github.com/hkalbertkim/gmail-doctor/issues) without posting email addresses, OAuth tokens, or personal mailbox data.

## Privacy, terms and contributing

[Privacy Policy](docs/PRIVACY.md) · [Terms of Use](docs/TERMS.md) · [MIT License](LICENSE)

Run the checks before contributing:

```bash
npm ci
npm test
npm run check
```

This project is **independent**, and is not affiliated with, sponsored by, or endorsed by Google. Gmail and the Gmail logo are trademarks of Google LLC.
