export const scenarios=[
 {id:'access',name:'I cannot sign in',urgency:'URGENT',next:'Go to https://accounts.google.com/signin/recovery from a familiar device and network. Try previously configured recovery methods. Never share verification codes.'},
 {id:'lost-2fa',name:'I lost my second factor',urgency:'URGENT',next:'At Google sign-in choose Try another way. Look for backup codes, another signed-in device, backup security key, passkey or recovery options. If none work, use Google Account Recovery.'},
 {id:'suspicious',name:'I see unfamiliar account activity',urgency:'URGENT',next:'On a trusted, malware-free device, open https://myaccount.google.com/security-checkup. Review events and devices, secure your password and recovery methods, and revoke unrecognized access.'},
 {id:'forwarding',name:'Gmail filters or forwarding look suspicious',urgency:'REVIEW',next:'First check Google Account security. If you can authorize Gmail Doctor, run gmail-doctor scan --all, inspect filters, and only delete rules you confirm are unauthorized.'},
 {id:'prevent',name:'I want to prevent lockout',urgency:'PREVENT',next:'Visit https://myaccount.google.com/security-checkup. Enable strong sign-in protection, verify recovery email and phone, store backup codes safely, add an independent backup method and review devices.'}
];
export function triageText(){
 return ['GMAIL DOCTOR  |  Start here','', 'Choose the situation that matches yours:','',...scenarios.flatMap((s,i)=>[`${i+1}. [${s.urgency}] ${s.name}`,`   ${s.next}`,'']),
 'IMPORTANT: Gmail Doctor cannot bypass 2FA, restore a locked account, or certify that an account is safe.',
 'Official recovery: https://accounts.google.com/signin/recovery',
 'Official security checkup: https://myaccount.google.com/security-checkup',
 'No Gmail settings are changed by this guide.'].join('\n');
}
