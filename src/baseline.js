// Gmail filter baseline comparison inspired by gmailctl's declarative/diff workflow.
// Independent implementation. No Gmail writes or message-body access.
import { createHash } from 'node:crypto';

export function normalizedFilter(filter) {
  const sort = object => {
    if (Array.isArray(object)) return object.map(sort).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
    if (object && typeof object === 'object') return Object.fromEntries(
      Object.entries(object).filter(([k])=>k !== 'id').sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,sort(v)])
    );
    return object;
  };
  return sort({criteria:filter.criteria||{},action:filter.action||{}});
}
export function fingerprint(filter) {
  return createHash('sha256').update(JSON.stringify(normalizedFilter(filter))).digest('hex');
}
export function captureBaseline(settings) {
  return {format:1, capturedAt:new Date().toISOString(), filters:(settings.filters||[]).map(fingerprint).sort()};
}
export function compareBaseline(baseline, settings) {
  if (baseline?.format !== 1 || !Array.isArray(baseline.filters)) throw new Error('Invalid baseline format');
  const before=[...baseline.filters], after=(settings.filters||[]).map(fingerprint);
  const added=[], removed=[];
  for(const hash of after) {
    const i=before.indexOf(hash);
    if(i<0) added.push(hash);
    else before.splice(i,1);
  }
  removed.push(...before);
  return {added,removed,changed:added.length>0||removed.length>0};
}
