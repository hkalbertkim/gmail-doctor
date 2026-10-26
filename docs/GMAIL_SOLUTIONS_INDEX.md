# Gmail problem-solving index

> **Find the right solution before installing anything.** This is a curated list of official recovery guidance and open-source tools, grouped by the problem you actually have. It is not a promise that any tool can recover a compromised Google account.
>
> Maintained alongside [Gmail Doctor](../README.md). Last reviewed: 2026-10-27. Open a [GitHub issue](https://github.com/hkalbertkim/gmail-doctor/issues) if a link is outdated or a useful tool is missing.

## Start with your situation

| Problem | First stop | Can you use it when locked out? |
| --- | --- | --- |
| Password or recovery details changed; cannot log in | [Google Account Recovery](https://accounts.google.com/signin/recovery) · [official instructions](https://support.google.com/accounts/answer/7682439) | **Yes.** Google's account ownership verification is required. |
| Someone may have accessed your account | [Secure a hacked or compromised Google Account](https://support.google.com/accounts/answer/6294825) | Partly: use official recovery if you cannot sign in. |
| Lost phone, key, passkey or 2FA method | [Fix 2-Step Verification problems](https://support.google.com/accounts/answer/185834) | **Yes**, for guidance and supported alternatives; account recovery may still be required. |
| Unknown devices, changed recovery details, suspicious connected apps | [Google Security Checkup](https://myaccount.google.com/security-checkup) | **No**, sign-in is usually needed. |
| Unexpected Gmail forwarding or forwarding notices | [Google's Gmail forwarding guidance](https://support.google.com/mail/answer/10957) | **No**, access to Gmail settings is needed. |
| Want to avoid losing access later | [2-Step Verification](https://support.google.com/accounts/answer/185839) · [official recovery guide](https://support.google.com/accounts/answer/7682439) | Set up while signed in. |
| Back up Gmail messages | [Got Your Back (GYB)](https://github.com/GAM-team/got-your-back) | **No**, Gmail authorization required. |

## Open-source tools and useful projects

**These are not interchangeable products.** Check their prerequisites and permissions before installing. We do not claim to have security-audited their source.

| Project | Best suited to | Access required | What it **cannot** do |
| --- | --- | --- | --- |
| [gmailctl](https://github.com/mbrt/gmailctl) | Declarative, code-managed Gmail filter maintenance | Gmail API authorization | Recover a locked account or inspect Google login sessions |
| [GAMADV-XTD3](https://github.com/taers232c/GAMADV-XTD3) | Advanced administration of Google Workspace, including Gmail configurations | Typically Workspace administrator permissions | Recover an ordinary consumer Gmail account from takeover |
| [Got Your Back (GYB)](https://github.com/GAM-team/got-your-back) | Download Gmail message backups to a local computer | Gmail API authorization; different modes request different scopes | Bypass Google ownership checks, recover sign-in, or investigate an attacker |
| [Gmail Doctor](https://github.com/hkalbertkim/gmail-doctor) | Emergency guidance, multiple-account settings scans, filter/forwarding review and change baseline | **No sign-in for emergency guidance**; self-configured OAuth needed for live settings audits | Bypass 2FA, recover lost access, check sessions or automatically restore deleted rules |

### Understand the scope

- **Account recovery** is controlled by Google. No project listed here can bypass Google's identity verification or guarantee a recovery outcome.
- **Account safety** is broader than Gmail settings. An empty list of suspicious filters does not rule out a stolen session, compromised device or malicious third-party grant.
- **Protect your information:** do not post passwords, OAuth refresh tokens, security keys, backup codes or recovery email details in issues or public threads.
- **Backup tools have different OAuth scopes:** a message-backup app may require message access, unlike a settings-only auditor. Always inspect the requested permissions.
- **Do not run unknown one-line installers blindly:** inspect their source and releases first.

## Why Gmail Doctor exists

We noticed repeated public discussions about account takeovers, lost 2FA methods and forwarding-rule surprises. There are already capable official and open-source solutions, but they address **different problems**, require **different levels of access**, and can be difficult to discover during an emergency.

We collected the routes here first. We also built **Gmail Doctor**, a small local-first CLI for the narrower gap of reviewing multiple Gmail settings configurations and guiding owners to official security pages. **The index is useful even if you never install our tool.**

If this page helped, tell us [which scenario](https://github.com/hkalbertkim/gmail-doctor/issues) you encountered. If another trustworthy project belongs here—or you need a Gmail Doctor feature—open an issue or pull request with the problem, link and reason. We will review it; this is not a promise to implement every request.

## How to submit a resource

Include the project URL, exact problem solved, whether it works without account access, whether it is designed for personal Gmail or Workspace, the permission or OAuth scopes it needs, and a link to its official documentation. No affiliate links, unverified recovery services or requests for account credentials.

Gmail Doctor is independent and not endorsed by Google or these third-party projects.
