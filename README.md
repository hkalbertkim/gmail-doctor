<div align="center">

<img src="assets/readme-hero.svg" alt="Gmail Doctor" width="560" />

# Gmail Doctor

**Find practical help for Gmail problems — and check your settings if you still have access.**

[![Release](https://img.shields.io/github/v/release/hkalbertkim/gmail-doctor)](https://github.com/hkalbertkim/gmail-doctor/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Status](https://img.shields.io/badge/status-developer%20preview-orange)

</div>

## Find what you need

- 🔴 **[Account hacked or locked out?](#emergency-help)** — **Start here.**
- **[Lost your 2FA device?](#lost-access-to-2fa)** — Find other ways to sign in.
- **[Suspicious account activity?](https://myaccount.google.com/security-checkup)** — Check recent activity and devices.
- **[Prevent account lockout](#prevent-lockout)** — Secure your recovery options ahead of time.
- **[Browse Gmail solutions](docs/GMAIL_SOLUTIONS_INDEX.md)** — Compare official help and open-source tools.
- **[Use Gmail Doctor](#try-gmail-doctor)** — Check Gmail settings on your Mac.
- **[Suggest a solution or feature](#help-us-improve)** — Help improve this project.

## Why we made this

Gmail problems can be stressful, and useful answers are scattered across Google's help pages and open-source projects. We collected [a problem-based list of existing solutions](docs/GMAIL_SOLUTIONS_INDEX.md). We also built **Gmail Doctor** to help people review Gmail settings when they can still sign in.

You can use the guides **without installing anything**.

## Emergency Help

**Can't sign in, or think someone took over your account?**

1. Go to **[Google Account Recovery](https://accounts.google.com/signin/recovery)**.
2. Use a device and location you've signed in from before. Follow Google's instructions.
3. If you still have another signed-in device or backup sign-in method, try it.

**Gmail Doctor cannot unlock accounts, bypass 2FA, or guarantee recovery.** Avoid anyone asking for your password or verification codes to “recover” your account.

### Lost access to 2FA

If your phone or verification device is lost, select **“Try another way”** during Google sign-in. Google may accept an existing backup code, another signed-in phone, a registered security key or a passkey on another device.

If nothing works, use [Google Account Recovery](https://accounts.google.com/signin/recovery). A recovery attempt can take time and might not succeed.

**Official Google guides:** [Account recovery](https://support.google.com/accounts/answer/7682439) · [Compromised account](https://support.google.com/accounts/answer/6294825) · [2FA problems](https://support.google.com/accounts/answer/185834)

## Prevent lockout

Do these **before** losing access:

- [ ] **Set up 2-Step Verification** and a second independent way to sign in.
- [ ] **Save backup codes** somewhere safe, outside Gmail. Never share them.
- [ ] **Confirm your recovery email and phone** are still yours.
- [ ] **Review recent activity and signed-in devices** using [Google Security Checkup](https://myaccount.google.com/security-checkup).
- [ ] **Check Gmail forwarding and filters** for changes you did not make.
- [ ] **Protect your devices** against malware and suspicious browser extensions.

[Open Google Security Checkup](https://myaccount.google.com/security-checkup) · [Learn about backup codes](https://support.google.com/accounts/answer/1187538)

## Try Gmail Doctor

Gmail Doctor is a free, local-first command-line tool that helps you review settings in Gmail accounts you **can still access**.

- **Emergency Help** — explains where to go for account problems, no Google connection needed.
- **Gmail settings scan** — checks filters, forwarding and other available settings.
- **Review before changes** — you choose any filters to delete and must explicitly confirm.

It **cannot** check your Google sign-in sessions or 2FA status automatically. A clean Gmail settings scan does **not** mean your entire Google account is safe.

### Install and use

**Requirements:** Mac with Node.js 20 or newer. No Google login is needed to read Emergency Help.

```bash
git clone https://github.com/hkalbertkim/gmail-doctor.git
cd gmail-doctor
npm ci
npm link

# Start interactive Gmail Doctor; select Emergency Help from the menu:
gmail-doctor

# Try a safe synthetic Gmail settings scan:
gmail-doctor scan --demo

# Optional: print Emergency Help directly without connecting an account:
gmail-doctor triage
```

<details>
<summary>Advanced: connect a real Gmail account (developer preview)</summary>

### Connect an account (developer preview)

**Public Google OAuth verification is pending.** There is currently **no one-click public sign-in**. To use Gmail Doctor with a real account you need your own Google Cloud Desktop OAuth client, Gmail API enabled and approved test-user access.

1. Open [Google Cloud Console](https://console.cloud.google.com/) and create or choose a project.
2. Enable the **Gmail API**; configure OAuth consent and register yourself as a test user if in Testing mode.
3. Create a **Desktop app** OAuth client. Save its downloaded JSON outside this repository.
4. In your own terminal, run:

```bash
gmail-doctor setup --client ~/Downloads/your-desktop-oauth.json
gmail-doctor account add --account you@gmail.com
gmail-doctor scan --all
```

Google handles sign-in and consent. **Do not enter your Google password, backup codes or recovery codes into Gmail Doctor.**

### Commands

```text
gmail-doctor                          Current interactive menu
gmail-doctor triage                   Emergency guidance (also inside the app)
gmail-doctor scan --demo              Offline fictional demo
gmail-doctor scan --all               Scan connected Gmail accounts
gmail-doctor scan --account EMAIL     Scan a specific account
gmail-doctor scan --account EMAIL --json  Machine-readable scan
gmail-doctor account add --account EMAIL  Connect an account
gmail-doctor account list             List accounts
gmail-doctor repair --account EMAIL --dry-run  Preview possible changes
gmail-doctor repair --account EMAIL   Interactive, explicitly approved deletion
gmail-doctor baseline save --account EMAIL  Save reviewed trusted filter baseline
gmail-doctor baseline check --account EMAIL  Check filter configuration drift
gmail-doctor logout --account EMAIL   Remove local token
```

</details>

## What it can and cannot do

| Feature | Available? |
| --- | --- |
| Explain official recovery and prevention pathways | **Yes — guidance** |
| Audit Gmail filters, forwarding rules, aliases and available settings | **Yes — with account authorization** |
| Audit multiple connected accounts | **Yes** |
| Detect changes against a previously reviewed filter baseline | **Yes** |
| Preview filter deletions and save a local settings backup | **Yes** |
| Delete **individually selected** filters | **Yes — only after typing `REPAIR`** |
| Automatically undo deleted filters | **No** |
| Read Google login sessions, 2FA or recovery configuration through Gmail API | **No** |
| Recover locked accounts, bypass 2FA or prove an account is safe | **No** |

**Scans are not proof of compromise.** Legitimate rules may look unusual. Conversely, a clean Gmail settings scan does not rule out account takeover.

### Before deleting a filter

The tool only deletes explicitly selected Gmail filters after review and confirmation. It rescans before deleting and saves a local settings backup. **Backups do not currently provide automatic rollback.** Do not delete an unfamiliar rule until you understand its purpose.

The requested Gmail OAuth scope is `gmail.settings.basic`, which can change settings; it is **not read-only**. Normal scans do not intentionally change Gmail settings.

<details>
<summary>Developer notes: terminal interface</summary>

### Development and terminal UX

The current default interactive experience is a menu-based CLI with Emergency Help available from its main menu. Work on a Codex-inspired Rust terminal UI is isolated under [experiments/codex-tui-spike](experiments/codex-tui-spike) and is **not yet production-ready**. We will not claim Codex visual or behavioral parity until real macOS Terminal testing succeeds. Scanning and repair logic are preserved during this work.

For technical context see [TUI acceptance gates](docs/CODEX_TUI_SPIKE.md) and [real user problem reports](docs/REDDIT_USER_REPORTS.md).

</details>

## Help us improve

**Did the index help you find the right next step?** If a useful official page or trustworthy open-source project is missing, or Gmail Doctor lacks a feature you need, [open an issue](https://github.com/hkalbertkim/gmail-doctor/issues). Include the situation and the resource or feature you are suggesting, **not** your email address, login details, recovery codes or tokens.

Corrections and pull requests are welcome. We review suggestions but cannot guarantee recovery outcomes or commit to implementing every request.

## Privacy and project information

- Gmail message bodies and attachments are **not read**; this is a settings auditor.
- Sign-in occurs through Google OAuth, not through Gmail Doctor's own password form.
- OAuth refresh tokens are stored locally in **macOS Keychain**. Local configuration, account identifiers, baselines and backups remain on the device.
- No Gmail Doctor-hosted mailbox backend is required, though Google's OAuth and Gmail API endpoints are contacted.
- Do not post personal account data, tokens or backup codes in [public issues](https://github.com/hkalbertkim/gmail-doctor/issues).

[Privacy Policy](docs/PRIVACY.md) · [Terms of Use](docs/TERMS.md) · [MIT License](LICENSE)

```bash
npm test
npm run check
```

This independent project is not affiliated with, sponsored by, or endorsed by Google. Gmail is a trademark of Google LLC.
