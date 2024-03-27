export const dispKey = (k: string) => {
    let disp = k
    const u = k.toUpperCase()
    if (u === 'ARROWDOWN') disp = '↓'
    if (u === 'ARROWUP') disp = '⇡'
    if (u === 'ARROOWRIGHT') disp = '→'
    if (u === 'ARROOWLEFT') disp = '←'
    return disp
}