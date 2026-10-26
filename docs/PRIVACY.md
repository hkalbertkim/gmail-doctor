# Gmail Doctor — Privacy Policy

Last updated: October 26, 2026

Gmail Doctor is an independent open-source, local-first command-line application. It is not affiliated with Google.

## What the application accesses
With your consent, Gmail Doctor uses the Gmail API's `gmail.settings.basic` permission to inspect your Gmail forwarding settings, filters, sender aliases and POP/IMAP settings. It uses Google's standard identity permissions to identify your selected Google account. This permission can change Gmail settings, although the app requires approval before supported repair operations.

Gmail Doctor does not request Gmail message-body or attachment access. It does not independently inspect your login devices, password, recovery methods or Family Link status.

## Where information is stored
Gmail Doctor operates on your device. Authorized refresh tokens are saved to macOS Keychain; account email identifiers are saved locally under `~/.gmail-doctor/accounts.json`. Before an approved repair, the application stores a local snapshot of mailbox settings in `~/.gmail-doctor/backups/`. The OAuth client configuration is stored locally in `~/.gmail-doctor/oauth-client.json`.

The app does not operate a hosted Gmail Doctor backend or upload Gmail settings or mailbox content to an operator-controlled server. Google OAuth and Gmail API requests communicate directly with Google's services. The application does not include third-party analytics.

## Controls and deletion
You choose which accounts to connect and which supported filter deletions to approve. Use `gmail-doctor logout --account EMAIL` to remove local refresh-token credentials for an account; revoke app authorization separately through your [Google Account connections](https://myaccount.google.com/connections). Local account listings, OAuth configuration, and backups may require manual deletion from the application data directory.

## Security
The application is provided as a developer preview; no tool can guarantee that an account is uncompromised. Keep local backups and OAuth client configuration private. Do not share credentials or mailbox settings in public issues.

## Google data policy
Use of information received from Google APIs is governed by the applicable Google API Services User Data Policy, including Limited Use requirements. Gmail Doctor uses requested Google data to provide the user-requested local account inspection and repair functions, not for advertising or data brokerage.

## Changes and contact
Changes to this policy are published in this repository. For privacy questions, open a GitHub issue without personal information: https://github.com/hkalbertkim/gmail-doctor/issues .
