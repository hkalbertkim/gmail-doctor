# Why Gmail Doctor exists: real account-takeover reports

The following publicly posted accounts influenced our priorities. They are **self-reported experiences, not independently verified forensic findings**. We link to the original discussions for transparency. Gmail Doctor is not affiliated with these Reddit users, and no endorsement is implied.

| Date (2026) | Public report | Reported problem | What Gmail Doctor can do |
| --- | --- | --- | --- |
| Oct 20 | [Gmail got hacked](https://www.reddit.com/r/GMail/comments/1xb1r3v/gmail_got_hacked/) | A stranger's device was reportedly receiving sign-in approvals, leaving the user locked out despite knowing the password. | Guide users to verify 2-Step Verification, recovery options and devices through Google. **Cannot inspect or remove login sessions automatically.** |
| Oct 25 | [Lost access to Gmail due to hacker](https://www.reddit.com/r/GMail/comments/1xeusc1/lost_access_to_gmail_due_to_hacker/) | The author reports unauthorized Family Link supervision and loss of access. | Explain the limits of Gmail APIs and link to Google's official account recovery. **Cannot remove Family Link supervision.** |
| Sep 8 | [Is there any chance to recover my Gmail account?](https://www.reddit.com/r/GMail/comments/1waxd9g/is_there_any_chance_to_recover_my_gmail_account/) | The author reports an attacker changed the 2FA phone, blocking sign-in. | Proactively encourage 2FA and recovery checks. **Cannot change a locked account's recovery details.** |
| Oct 22 | [Gmail Got hacked](https://www.reddit.com/r/GoogleSupport/comments/1xcagqo/gmail_got_hacked/) | A user reports a changed password and recovery phone/email. | Direct the affected user to official Google recovery; inspect Gmail settings only if the owner can authorize the tool. |

**Product scope:** Gmail Doctor can automatically inspect some Gmail settings and, after explicit approval, delete chosen Gmail filters. It cannot determine whether Google account login or recovery credentials were hijacked from the Gmail API alone. Account Takeover Check is a guided review that links to official Google security pages; the answers are user reported, not Google-verified.

To reduce account takeover risk, check whether 2-Step Verification is enabled on [Google's official settings page](https://myaccount.google.com/signinoptions/two-step-verification), review recovery information, and use phishing-resistant authentication such as passkeys or security keys where available. 2-Step Verification does not eliminate every compromise method (e.g. malware stealing active sessions).
