export function assess(settings) {
  const findings = [];
  const actions = [];
  const forward = settings.autoForwarding || {};
  if (forward.enabled) {
    findings.push({ severity: 'warning', id: 'automatic-forwarding', detail: 'Automatic forwarding enabled to ' + (forward.emailAddress || '(unknown)') });
    // Consumer OAuth cannot update automatic forwarding; Google requires Workspace domain-wide delegated service accounts.
  }
  for (const filter of (settings.filters || [])) {
    const a = filter.action || {};
    const criteria = filter.criteria || {};
    const effects = [];
    if (a.forward) effects.push('forwards to ' + a.forward);
    if (a.addLabelIds?.includes('TRASH')) effects.push('sends messages to Trash');
    if (a.removeLabelIds?.includes('INBOX')) effects.push('skips Inbox');
    if (a.markRead) effects.push('marks messages read');
    if (!effects.length) continue;
    const sensitive = /security|google|account|verify|verification|password|2fa|otp|login/i.test(JSON.stringify(criteria));
    const severity = (a.forward || a.addLabelIds?.includes('TRASH') || sensitive) ? 'warning' : 'review';
    findings.push({ severity, id: 'filter:' + filter.id, detail: 'Filter ' + filter.id + ': ' + effects.join(', ') + '; matching ' + JSON.stringify(criteria) });
    actions.push({ kind: 'delete-filter', id: filter.id, label: 'Delete filter ' + filter.id + ' (' + effects.join(', ') + ')' });
  }
  for (const alias of (settings.sendAs || [])) {
    if (!alias.isPrimary) findings.push({ severity: 'review', id: 'alias:' + alias.sendAsEmail, detail: 'Additional send-as identity: ' + alias.sendAsEmail + ' (manual review)' });
  }
  if (settings.pop?.accessWindow && settings.pop.accessWindow !== 'disabled') {
    findings.push({ severity: 'review', id: 'pop', detail: 'POP is enabled (' + settings.pop.accessWindow + '); verify expected use' });
  }
  if (settings.imap?.enabled) findings.push({ severity: 'info', id: 'imap', detail: 'IMAP is enabled; not evidence of compromise' });
  if ((settings.forwardingAddresses || []).length)
    findings.push({ severity: 'info', id: 'forwarding-addresses', detail: settings.forwardingAddresses.length + ' configured forwarding destination(s); check against known addresses' });
  return { findings, actions };
}
export async function readSettings(api) {
  const endpoints = {
    autoForwarding: 'settings/autoForwarding',
    filters: 'settings/filters',
    sendAs: 'settings/sendAs',
    pop: 'settings/pop',
    imap: 'settings/imap',
    forwardingAddresses: 'settings/forwardingAddresses'
  };
  const result = {}; const errors = [];
  await Promise.all(Object.entries(endpoints).map(async ([name, path]) => {
    try {
      const v = await api('GET', path);
      result[name] = name === 'filters' ? (v.filter || []) : name === 'sendAs' ? (v.sendAs || []) : name === 'forwardingAddresses' ? (v.forwardingAddresses || []) : v;
    } catch (e) { errors.push(name + ': ' + e.message); }
  }));
  return { settings: result, errors };
}
export async function applyAction(api, action) {
  if (action.kind === 'delete-filter') {
    return api('DELETE', 'settings/filters/' + encodeURIComponent(action.id));
  }
  throw new Error('Unsupported repair action');
}
