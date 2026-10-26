const ANSI = /\x1b\[[0-9;]*m/g;
export const displayWidth = value => [...String(value).replace(ANSI,'')].length;
export function wrapText(value, width=68, indent='') {
  const limit=Math.max(30,Math.min(76,Number(width)||68));
  const lines=[];
  for(const original of String(value).split('\n')) {
    if(!original.trim()) {lines.push('');continue;}
    const words=original.trim().split(/\s+/);
    let line=indent;
    for(let word of words) {
      while(displayWidth(word)>limit-indent.length) {
        if(line.trim()){lines.push(line);line=indent;}
        lines.push(indent+word.slice(0,limit-indent.length));
        word=word.slice(limit-indent.length);
      }
      if(!word)continue;
      if(displayWidth(line)+(line.trim()?1:0)+displayWidth(word)>limit) {
        lines.push(line);line=indent+word;
      } else line+=(line.trim()?' ':'')+word;
    }
    if(line.trim()) lines.push(line);
  }
  return lines.join('\n');
}
export const terminalWidth=()=>Math.max(42,Math.min(76,(process.stdout.columns||76)-4));
