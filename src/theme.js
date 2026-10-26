const esc='\x1b[';
export function createTheme({color=process.stdout.isTTY && !process.env.NO_COLOR && process.env.TERM!=='dumb'}={}) {
 const wrap=(n,s)=>color?esc+n+'m'+s+esc+'0m':s;
 return {color,cyan:s=>wrap('36',s),green:s=>wrap('32',s),yellow:s=>wrap('33',s),red:s=>wrap('31',s),bold:s=>wrap('1',s),muted:s=>wrap('2',s)};
}
export function layout(text,{color=true}={}) {
 const t=createTheme({color});
 return text.split('\n').map(line=>{
  if(line.startsWith('Gmail Doctor  |')) return t.bold(t.cyan(line));
  if(line.startsWith('Status')) return line.includes('REVIEW NEEDED')?t.yellow(t.bold(line)):line.includes('INCOMPLETE')?t.red(line):t.green(line);
  if(line.includes('[WARNING]'))return t.yellow(line);
  if(line.includes('[REVIEW]'))return t.cyan(line);
  if(line.startsWith('WHAT NEEDS ATTENTION')||line.startsWith('NEXT STEPS')||line.startsWith('ALL ACCOUNTS'))return t.bold(t.cyan(line));
  if(line.startsWith('  Run:'))return t.green(line);
  if(line.startsWith('Limits:')||line.startsWith('A clean'))return t.muted(line);
  return line;
 }).join('\n');
}
export function logo({color=true}={}) {
 const t=createTheme({color});
 return t.cyan(['  ╔═╗╔╦╗╔═╗╦╦   ╔╦╗╔═╗╔═╗╔╦╗╔═╗╦═╗','  ║ ╦║║║╠═╣║║    ║║║ ║║   ║ ║ ║╠╦╝','  ╚═╝╩ ╩╩ ╩╩╩═╝ ═╩╝╚═╝╚═╝ ╩ ╚═╝╩╚═'].join('\n'));
}
