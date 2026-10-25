// Annual US theme windows, evaluated in the same Eastern time zone as daily puzzles.
export const themeSchedule=[
 {id:'newyear',label:'New Year',window:'Dec 27 – Jan 3',start:1227,end:103},
 {id:'valentine',label:'Valentine’s Day',window:'Feb 7 – 15',start:207,end:215},
 {id:'july4',label:'July 4th',window:'Jun 27 – Jul 7',start:627,end:707},
 {id:'halloween',label:'Halloween',window:'Oct 18 – Nov 1',start:1018,end:1101},
 {id:'christmas',label:'Christmas',window:'Dec 10 – 26',start:1210,end:1226},
 {id:'spring',label:'Spring',window:'Mar 1 – May 31',start:301,end:531},
 {id:'summer',label:'Summer',window:'Jun 1 – Aug 31',start:601,end:831}
];
export function themeForDate(date=new Date()){
 if(!Number.isFinite(date.getTime()))return 'generic';
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',month:'numeric',day:'numeric'}).formatToParts(date);
 const md=Number(parts.find(p=>p.type==='month').value)*100+Number(parts.find(p=>p.type==='day').value);
 return themeSchedule.find(t=>t.start>t.end?md>=t.start||md<=t.end:md>=t.start&&md<=t.end)?.id||'generic';
}
export const themes={
 generic:{label:'Everyday puzzles',title:'Piece by piece.',subtitle:'A little pause. A world of possibilities.',bg:'#f4f1e8',ink:'#243e35',muted:'#65776a',accent:'#718b6c',tiles:['#264e42','#52755a','#b7bd86','#e4ce87','#86a581','#3b6e5b','#739176','#d5bd74','#365c4e']},
 halloween:{label:'Halloween',title:'A little mystery.',subtitle:'Good puzzles. A little mischief.',bg:'#201c2c',ink:'#fff0db',muted:'#c6b4d3',accent:'#eaa056',tiles:['#51354e','#7a4a53','#b07756','#a8623a','#5f405d','#c58b59','#352e4c','#976047','#70516d']},
 christmas:{label:'Christmas',title:'A moment of wonder.',subtitle:'Unwrap a little joy, one piece at a time.',bg:'#173d34',ink:'#fff4df',muted:'#bcd0b8',accent:'#d3b67b',tiles:['#34614f','#b14e46','#6a8566','#a8854d','#345648','#c7ac71','#9d574a','#52745c','#325747']},
 newyear:{label:'New Year',title:'Fresh possibilities.',subtitle:'New beginnings. One piece at a time.',bg:'#182539',ink:'#fff4dc',muted:'#b2c2d4',accent:'#e0bd78',tiles:['#2b4058','#496279','#a78f61','#b9a57b','#354b60','#546e83','#46627a','#a08961','#304458']},
 spring:{label:'Spring',title:'Let curiosity bloom.',subtitle:'Fresh ideas are taking shape.',bg:'#edf2e5',ink:'#354a3c',muted:'#657a60',accent:'#73885a',tiles:['#bdd1a3','#e5b3b3','#91b7a0','#c4d4a7','#e8cb9a','#b7c991','#d4a6ad','#8eac91','#e4c1ba']},
 summer:{label:'Summer',title:'A brighter kind of play.',subtitle:'Slow down. Soak up a little wordplay.',bg:'#edf4f0',ink:'#234e58',muted:'#647f80',accent:'#b5934f',tiles:['#7eb2b1','#e7c97e','#a7cebd','#e0b96c','#72a8b1','#bbd6c4','#8ab8b4','#e8d49d','#5a98a5']},
 july4:{label:'July 4th',title:'A spark of discovery.',subtitle:'Stars, stripes, and small celebrations.',bg:'#f5f1e9',ink:'#283f59',muted:'#718094',accent:'#b66358',tiles:['#b86258','#526e8b','#d4b8a0','#e3cdb2','#9e514c','#67819b','#45627e','#c27565','#b0bbc0']},
 valentine:{label:'Valentine’s Day',title:'A perfect little match.',subtitle:'Made for the love of a good puzzle.',bg:'#f8eceb',ink:'#6b3548',muted:'#967180',accent:'#ba6b82',tiles:['#ca8a9b','#e2b2b5','#ad697f','#eac8ba','#b77a8e','#d49fa5','#c9939b','#a9667d','#e7bfb5']}
};
export function piecePath(row,col){
 const size=100,x=col*size,y=row*size,sign=(row+col)%2?1:-1;
 const edges=[[x,y,1,0,row>0],[x+size,y,0,1,col<2],[x+size,y+size,-1,0,row<2],[x,y+size,0,-1,col>0]];
 let path=`M ${x} ${y}`;
 for(const [sx,sy,dx,dy,tab] of edges){
  const pt=(t,n=0)=>`${sx+dx*t+dy*n*sign} ${sy+dy*t-dx*n*sign}`;
  if(tab)path+=` L ${pt(38)} C ${pt(45)} ${pt(35,18)} ${pt(50,18)} C ${pt(65,18)} ${pt(55)} ${pt(62)} L ${pt(100)}`;
  else path+=` L ${pt(100)}`;
 }
 return path+' Z';
}
const star=(x,y,r=13,fill='#fff2cf')=>`<path d="M ${x} ${y-r} L ${x+r*.29} ${y-r*.3} L ${x+r} ${y-r*.3} L ${x+r*.47} ${y+r*.13} L ${x+r*.62} ${y+r*.88} L ${x} ${y+r*.45} L ${x-r*.62} ${y+r*.88} L ${x-r*.47} ${y+r*.13} L ${x-r} ${y-r*.3} L ${x-r*.29} ${y-r*.3} Z" fill="${fill}"/>`;
function motif(id){
 const smallStars=star(47,51,8)+star(250,230,9)+star(257,66,6)+star(48,253,6);
 switch(id){
 case 'halloween':return `${smallStars}<path d="M150 108 Q139 79 160 69" fill="none" stroke="#d9c497" stroke-width="13" stroke-linecap="round"/><ellipse cx="118" cy="173" rx="48" ry="63" fill="#efaa50"/><ellipse cx="181" cy="173" rx="48" ry="63" fill="#efaa50"/><ellipse cx="150" cy="173" rx="50" ry="66" fill="#f5b95f" stroke="#db8b3d" stroke-width="3"/><path d="M105 160 L125 142 L133 167 Z M169 167 L177 142 L197 160 Z M118 191 Q150 219 183 191 L171 214 L137 216 Z" fill="#463048"/>`;
 case 'christmas':return `${smallStars}<rect x="138" y="214" width="24" height="31" rx="4" fill="#e3bc7a"/><path d="M150 66 L207 143 H184 L227 208 H73 L116 143 H93 Z" fill="#e9ead1"/>${star(150,63,19,'#f7cf7b')}<path d="M117 141 Q151 164 182 144 M100 183 Q151 204 204 185" fill="none" stroke="#bb6656" stroke-width="7" stroke-linecap="round"/><circle cx="144" cy="122" r="6" fill="#c99850"/><circle cx="167" cy="175" r="7" fill="#bb6656"/>`;
 case 'newyear':return `${smallStars}<circle cx="150" cy="152" r="73" fill="#e9d7b1"/><circle cx="150" cy="152" r="62" fill="#273f58" stroke="#fff0cb" stroke-width="2"/>${Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return `<circle cx="${150+Math.sin(a)*52}" cy="${152-Math.cos(a)*52}" r="2.5" fill="#f4d28c"/>`;}).join('')}<path d="M150 152 V111 M150 152 L141 119" stroke="#f4d28c" stroke-width="6" stroke-linecap="round"/><circle cx="150" cy="152" r="5" fill="#f4d28c"/><path d="M47 111 L47 85 M34 98 H60 M231 46 V28 M222 37 H240 M253 172 V151 M243 161 H263" stroke="#efd396" stroke-width="3" stroke-linecap="round"/>`;
 case 'spring':return `<path d="M153 146 Q142 185 155 246" fill="none" stroke="#4f7960" stroke-width="8" stroke-linecap="round"/><path d="M151 215 Q103 211 98 180 Q142 175 151 215 M151 191 Q194 190 210 157 Q169 152 151 191" fill="#638c64"/>${Array.from({length:6},(_,i)=>`<ellipse cx="150" cy="101" rx="23" ry="40" fill="${i%2?'#f6e6cf':'#f5d1cf'}" transform="rotate(${i*60} 150 131)"/>`).join('')}<circle cx="150" cy="131" r="23" fill="#cd9a52"/>${star(50,65,7,'#faf4df')}${star(245,227,9,'#faf4df')}`;
 case 'summer':return `<circle cx="181" cy="100" r="42" fill="#fff0b1"/><g stroke="#fff0b1" stroke-width="5" stroke-linecap="round">${Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return `<path d="M${181+Math.cos(a)*52} ${100+Math.sin(a)*52} L${181+Math.cos(a)*65} ${100+Math.sin(a)*65}"/>`;}).join('')}</g><path d="M35 180 Q75 154 115 180 T195 180 T275 180 V250 H35 Z" fill="#407d89"/><path d="M35 202 Q75 178 115 202 T195 202 T275 202" fill="none" stroke="#e1edda" stroke-width="9"/><path d="M35 227 Q75 203 115 227 T195 227 T275 227" fill="none" stroke="#99c5bc" stroke-width="8"/>`;
 case 'july4':return `<path d="M68 114 H241 V221 H68 Z" fill="#fff0d6"/><path d="M68 143 H241 M68 181 H241 M68 215 H241" stroke="#b85851" stroke-width="15"/><path d="M68 114 H153 V179 H68 Z" fill="#294f73"/>${star(96,136,8)+star(127,158,8)+star(128,131,6)+star(96,160,5)}<path d="M207 83 V50 M190 66 H224 M63 71 V43 M49 57 H77 M241 258 V239 M232 249 H250" fill="none" stroke="#fff1d8" stroke-width="4" stroke-linecap="round"/>`;
 case 'valentine':return `${smallStars}<path d="M150 233 C122 212 64 167 64 125 C64 79 122 64 150 104 C178 64 236 79 236 125 C236 167 178 212 150 233 Z" fill="#fff0df"/><path d="M150 207 C126 188 91 157 91 128 C91 99 126 95 150 126 C174 95 209 99 209 128 C209 157 174 188 150 207 Z" fill="#ba667e"/>`;
 default:return `${smallStars}<circle cx="150" cy="150" r="70" fill="#f6e9c9"/><path d="M109 150 L139 179 L195 119" fill="none" stroke="#3d6953" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><circle cx="245" cy="133" r="7" fill="#f6e9c9"/><circle cx="65" cy="201" r="5" fill="#f6e9c9"/>`;
 }
}
export function puzzleArtwork(id='generic',prefix='splash'){
 const t=themes[id]||themes.generic,art=motif(id),paths=Array.from({length:9},(_,i)=>piecePath(Math.floor(i/3),i%3));
 const defs=paths.map((d,i)=>`<clipPath id="${prefix}-${i}"><path d="${d}"/></clipPath>`).join('');
 const delays=[80,320,140,430,0,510,210,590,370];
 return `<svg xmlns="http://www.w3.org/2000/svg" class="splash-board" viewBox="-60 -60 420 420" aria-hidden="true" focusable="false"><defs>${defs}</defs>${paths.map((d,i)=>{const x=(i%3-1)*86,y=(Math.floor(i/3)-1)*86;return `<g class="jigsaw-piece" style="--dx:${x||25}px;--dy:${y||-25}px;--turn:${i%2?14:-12}deg;--delay:${delays[i]}ms"><path d="${d}" fill="${t.tiles[i]}"/><g clip-path="url(#${prefix}-${i})">${art}</g><path d="${d}" fill="none" stroke="${t.bg}" stroke-width="2.5" stroke-linejoin="round"/></g>`;}).join('')}</svg>`;
}
