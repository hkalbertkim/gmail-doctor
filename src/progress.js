export function progress(stage,index,total,email='') {
  const stages=[
    ['1/3','CONNECTED ACCOUNTS','completed'],
    ['2/3','GMAIL SETTINGS SCAN','active'],
    ['3/3','GOOGLE SECURITY REVIEW','pending']
  ];
  if(stage==='start') return [
    'GMAIL DOCTOR  ·  SECURITY WORKFLOW',
    '──────────────────────────────────────────────────────',
    '[1/3] Connected accounts: '+total,
    '[2/3] Gmail settings scan: starting',
    '[3/3] Google security review: pending'
  ].join('\n');
  if(stage==='scanning') return '[2/3] SCANNING '+(index+1)+'/'+total+' · '+email+' (Gmail API)';
  if(stage==='manual') return '[3/3] GOOGLE SECURITY REVIEW · NOT VERIFIED (manual)';
  if(stage==='done') return 'WORKFLOW SUMMARY · Gmail scanning complete · Google security review pending';
  throw new Error('Unknown progress stage');
}
