const short = value => String(value ?? '').replace(/\s+/g, ' ').slice(0, 130);
const dim = value => String(value ?? '').slice(0, 80);
export function formatFinding(item, index) {
  if (item.id?.startsWith('filter:')) {
    const matched = item.detail.match(/matching (\{.*\})$/);
    let criteria = {};
    try { criteria = matched ? JSON.parse(matched[1]) : {}; } catch {}
    const target = item.detail.match(/forwards to ([^,; ]+)/)?.[1];
    const actions = [];
    if (target) actions.push('Forward to ' + target);
    if (item.detail.includes('Trash')) actions.push('Move to Trash');
    if (item.detail.includes('skips Inbox')) actions.push('Skip Inbox');
    if (item.detail.includes('marks messages read')) actions.push('Mark read');
    return [
      `  ${index}. [${item.severity.toUpperCase()}] Mail filter`,
      `     Matches: ${short(Object.entries(criteria).map(([k,v])=>k+'='+v).join(', ') || 'custom rule')}`,
      `     Action:  ${short(actions.join(' · '))}`,
      '     Review whether you created this rule.'
    ].join('\n');
  }
  return `  ${index}. [${item.severity.toUpperCase()}] ${dim(item.detail)}`;
}
export function renderReport({email, findings, errors, demo=false}) {
  const warnings = findings.filter(x=>x.severity==='warning').length;
  const reviews = findings.filter(x=>x.severity==='review').length;
  const info = findings.filter(x=>x.severity==='info').length;
  const title = demo?'DEMO — fictitious data':'GMAIL SETTINGS AUDIT';
  const risk = errors.length ? 'INCOMPLETE' : warnings ? 'REVIEW NEEDED' : reviews ? 'REVIEW ITEMS' : 'NO FLAGGED RISKS';
  const out = ['', 'Gmail Doctor  |  '+title, '─'.repeat(58), 'Account  '+(email||'Demo account'), 'Status   '+risk, `Findings ${warnings} warning(s) · ${reviews} review(s) · ${info} info`, ''];
  const important = findings.filter(x=>x.severity !== 'info');
  if (important.length) {
    out.push('WHAT NEEDS ATTENTION');
    important.forEach((x,i)=>out.push(formatFinding(x,i+1),''));
  } else out.push('No risky settings flagged in checked categories.','');
  if (errors.length) out.push('INCOMPLETE CHECKS',...errors.map(x=>'  - '+short(x)),'');
  out.push('NEXT STEPS','  Run: gmail-doctor repair --account '+(email||'<email>')+' --dry-run','  Security review: https://myaccount.google.com/security-checkup','');
  out.push('Limits: device sessions, recovery methods, Family Link and OAuth apps are not checked.');
  out.push('A clean settings scan does not prove the account is secure.');
  return out.join('\n');
}
export function renderSummary(rows) {
  const w = Math.max(7,...rows.map(x=>x.email.length));
  const out = ['', 'ALL ACCOUNTS', '─'.repeat(w+31), 'Account'.padEnd(w)+'  Warnings  Incomplete', '─'.repeat(w+31)];
  rows.forEach(x=>out.push(x.email.padEnd(w)+'  '+String(x.warnings??'-').padStart(8)+'  '+String(x.error?'ERROR':x.unchecked??0).padStart(10)));
  out.push('─'.repeat(w+31),'Use --account <email> to inspect or repair one account.');
  return out.join('\n');
}
