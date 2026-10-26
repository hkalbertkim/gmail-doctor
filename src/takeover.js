// Guided Google Account takeover review. No privileged account reads or writes.
export const steps = Object.freeze([
 {id:'twoStep',title:'Two-Step Verification (2FA)',url:'https://myaccount.google.com/signinoptions/two-step-verification',help:'Check whether Google shows 2-Step Verification as ON. If OFF, follow Google prompts to turn it on. Prefer phishing-resistant passkeys or security keys when possible. Keep recovery methods and backup codes secure; never share them.'},
 {id:'activity',title:'Recent security events',url:'https://myaccount.google.com/notifications',help:'Check sign-in and security-change alerts. Mark anything you do not recognize.'},
 {id:'devices',title:'Signed-in devices and sessions',url:'https://myaccount.google.com/device-activity',help:'Review unknown devices and sign out through Google. A malware-infected device must be secured separately.'},
 {id:'recovery',title:'Recovery methods and two-step verification',url:'https://myaccount.google.com/security',help:'Verify recovery email, phone, passkeys and 2-step verification. Review backup codes privately; never paste them into this tool.'},
 {id:'connections',title:'Connected third-party apps',url:'https://myaccount.google.com/connections',help:'Revoke unrecognized access using Google controls.'},
 {id:'checkup',title:'Google Security Checkup',url:'https://myaccount.google.com/security-checkup',help:'Complete remaining Google-recommended security checks.'}
]);
export function summary(review) {
 const flagged=Object.values(review).filter(x=>x==='suspicious').length;
 const reviewed=Object.values(review).filter(x=>x==='reviewed').length;
 return {flagged,reviewed,notChecked:steps.length-flagged-reviewed};
}
export function renderReview(review) {
 const c=summary(review);
 return ['ACCOUNT TAKEOVER CHECK — GUIDED REVIEW',
 'Gmail Doctor cannot read your Google 2FA status, login sessions, passkeys or recovery methods through Gmail API.',
 'Use Google pages to check and enable protection. Statuses below are user-reported, not independently verified.',
 ...steps.map((s,i)=>`${i+1}. ${s.title}: ${review[s.id]||'NOT CHECKED'}`),
 `Summary: ${c.flagged} reported concern(s), ${c.reviewed} user-reviewed, ${c.notChecked} not checked.`,
 'Unknown or suspicious activity? Secure the account from a trusted device: https://myaccount.google.com/security-checkup',
 'Already locked out? Official recovery: https://accounts.google.com/signin/recovery'
 ].join('\n');
}
