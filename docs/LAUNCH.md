# Launch draft — approval and community-context required

## HN Show HN
Title: Show HN: Gmail Doctor — inspect suspicious forwarding and filter rules from your terminal

Body:
I built Gmail Doctor, an open-source local-first CLI for detecting risky Gmail forwarding and filter settings, and repairing selected settings with explicit confirmation.

The initial version reads Gmail settings through Google's API. It flags auto-forwarding and filters that silently delete or forward mail. It can disable forwarding and delete a user-approved filter, keeping a local settings backup. It does not read message contents.

It cannot detect stolen sessions, Family Link takeovers, or recover an account after lockout. Google OAuth setup currently requires testers to configure their own Desktop OAuth client; I am validating the install flow before claiming consumer-ready onboarding.

The GitHub repo has a no-auth demo that runs instantly. I'd appreciate feedback on which settings should be checked next and whether the output is actionable.

https://github.com/hkalbertkim/gmail-doctor

## Reddit — only where project posts are allowed
Title: I built a local Gmail settings scanner after reading account-takeover posts — what would you want checked?

Body:
I've been reading Gmail takeover reports and built a small open-source CLI focused on the parts of Gmail settings users can actually inspect or repair: forwarding and mail filters.

It is not an account recovery bypass and doesn't claim to detect all compromises. It has a demo mode without Google login. Real scan needs your own Google Desktop OAuth client for now, so this is an early technical release.

I'm looking for feedback on missing high-value checks, confusing output, and whether the manual repair flow is safe. Repo: https://github.com/hkalbertkim/gmail-doctor

## LinkedIn
Gmail account takeover stories are everywhere. But checking whether someone quietly changed your mail forwarding and filters is still tedious.

I built Gmail Doctor: a local-first open-source CLI that audits those settings and offers explicit, user-approved repairs. No email bodies, no central server.

It's an early developer release: OAuth setup is manual, and it cannot restore access to a locked-out account.

Repo and no-login demo: https://github.com/hkalbertkim/gmail-doctor

What Gmail security checks would you prioritize next?
