let d = 'SUNDAY, 24TH MAY';
let c = d.replace(/(\d+)(st|nd|rd|th)/i, '$1');
c = c.replace(/monday|tuesday|wednesday|thursday|friday|saturday|sunday/gi, '');
c = c.replace(/,/g, '').trim();
console.log(c);
console.log(new Date(c + ' ' + new Date().getFullYear()));
