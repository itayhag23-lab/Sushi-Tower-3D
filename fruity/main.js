/* ---------- flavors ---------- */
const FLAVORS = [
  { name:'Peachberry', price:'$120', core:'#c9a06a', edge:'#5a3a1c', img:'peachberry', deco:'-58deg',
    blurb:'Sweet, sun-ripened peach slices paired with crunchy toasted almonds on a silky smooth base.' },
  { name:'Kiwi Lime',  price:'$98',  core:'#9fbc58', edge:'#33501c', img:'kiwilime',   deco:'0deg',
    blurb:'Sharp kiwi and cold-pressed lime, cut with coconut flakes for a finish that stays bright.' },
  { name:'Mango Sun',  price:'$135', core:'#e0ae4e', edge:'#6d4413', img:'mango',      deco:'-42deg',
    blurb:'Alphonso mango blended thick, layered over toasted oats and a whisper of sea salt.' },
  { name:'Berry Dusk', price:'$112', core:'#a8749f', edge:'#432046', img:'berry',      deco:'188deg',
    blurb:'Wild blueberry and raspberry, stirred slow until the colour turns to deep evening purple.' },
];

/* ---------- decorative fruit ---------- */
const kiwi = c => `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#b7d06b"/><circle cx="50" cy="50" r="42" fill="${c}"/>
${Array.from({length:34},(_,i)=>{const a=i/34*Math.PI*2;return `<line x1="${50+Math.cos(a)*13}" y1="${50+Math.sin(a)*13}" x2="${50+Math.cos(a)*39}" y2="${50+Math.sin(a)*39}" stroke="#28401a" stroke-width="1.4" stroke-linecap="round" opacity=".55"/>`}).join('')}
${Array.from({length:14},(_,i)=>{const a=i/14*Math.PI*2;return `<ellipse cx="${50+Math.cos(a)*27}" cy="${50+Math.sin(a)*27}" rx="2" ry="3.4" fill="#1d2f12" transform="rotate(${a*57.3+90} ${50+Math.cos(a)*27} ${50+Math.sin(a)*27})"/>`}).join('')}
<ellipse cx="50" cy="50" rx="13" ry="12" fill="#f4f3dd"/></svg>`;

let limeId = 0;
const lime = () => { const id = `lw${++limeId}`; return `<svg viewBox="0 0 100 100"><defs><clipPath id="${id}"><path d="M50 96C23 96 4 76 4 50S23 4 50 4Z"/></clipPath></defs>
<path d="M50 98C23 98 2 77 2 50S23 2 50 2Z" fill="#eef3cd"/>
<g clip-path="url(#${id})"><circle cx="50" cy="50" r="41" fill="#d5e88f"/>
${Array.from({length:8},(_,i)=>{const a=Math.PI/2+ (i+.5)/8*Math.PI;const b=Math.PI/2+(i+1.5)/8*Math.PI;
  return `<path d="M50 50 L${50+Math.cos(a)*40} ${50+Math.sin(a)*40} A40 40 0 0 1 ${50+Math.cos(b)*40} ${50+Math.sin(b)*40} Z" fill="#b9dc5c" stroke="#f2f7dc" stroke-width="2.6"/>`}).join('')}
<circle cx="50" cy="50" r="6" fill="#eef3cd"/></g></svg>`; };

const mint = `<svg viewBox="0 0 100 100"><path d="M50 6c26 10 40 30 38 52-2 22-20 36-38 36S14 80 12 58C10 36 24 16 50 6Z" fill="#5c9b3a"/>
<path d="M50 10c22 10 34 28 33 47-1 19-16 31-33 31Z" fill="#74b84a"/>
<path d="M50 12v80" stroke="#3d6d26" stroke-width="2.2" stroke-linecap="round"/>
${Array.from({length:6},(_,i)=>{const y=24+i*11;return `<path d="M50 ${y} L${28-i} ${y+11} M50 ${y} L${72+i} ${y+11}" stroke="#3d6d26" stroke-width="1.5" opacity=".6" fill="none"/>`}).join('')}</svg>`;

const BITS = [
  { html:kiwi('#8fbd4d'), x:'27%', y:'15%', s:'clamp(52px,6.2vw,96px)', rot:'-14deg', amp:'26px', dur:'7s',  d:'0s',   depth:34, op:1,   soft:0 },
  { html:kiwi('#9ccb58'), x:'82%', y:'84%', s:'clamp(44px,5.2vw,78px)', rot:'12deg',  amp:'22px', dur:'8.5s',d:'.8s',  depth:26, op:.95, soft:0 },
  { html:lime(),            x:'67%', y:'12%', s:'clamp(46px,5.6vw,86px)', rot:'18deg',  amp:'20px', dur:'6.5s',d:'.3s',  depth:40, op:1,   soft:0 },
  { html:lime(),            x:'2%',  y:'88%', s:'clamp(52px,7vw,104px)',  rot:'-32deg', amp:'24px', dur:'9s',  d:'1.2s', depth:18, op:.75, soft:2 },
  { html:mint,            x:'89%', y:'7%',  s:'clamp(34px,4vw,62px)',   rot:'34deg',  amp:'18px', dur:'7.5s',d:'.6s',  depth:48, op:1,   soft:0 },
  { html:mint,            x:'62%', y:'76%', s:'clamp(28px,3.4vw,50px)', rot:'-24deg', amp:'16px', dur:'6.8s',d:'1.5s', depth:44, op:1,   soft:0 },
  { html:mint,            x:'14%', y:'8%',  s:'clamp(38px,4.4vw,66px)', rot:'-48deg', amp:'20px', dur:'8.2s',d:'.2s',  depth:30, op:.9,  soft:1 },
  { html:kiwi('#a6cf62'), x:'33%', y:'95%', s:'clamp(24px,2.8vw,44px)', rot:'6deg',   amp:'14px', dur:'7.2s',d:'1s',   depth:52, op:1,   soft:0 },
];

const orchard = document.querySelector('.orchard');
orchard.innerHTML = BITS.map(b => `<div class="bit" style="left:${b.x};top:${b.y};--s:${b.s};--rot:${b.rot};--amp:${b.amp};--dur:${b.dur};--delay:${b.d};--op:${b.op};--soft:${b.soft}px" data-depth="${b.depth}">${b.html}</div>`).join('');

/* ---------- flavor switching ---------- */
const hero   = document.getElementById('hero');
const wordEl = document.querySelector('[data-word]');
const priceEl= document.querySelector('[data-price]');
const blurbEl= document.querySelector('[data-blurb]');
const bowl   = document.querySelector('.bowl');
const dots   = document.querySelector('.dots');
let idx = 0, busy = false;

dots.innerHTML = FLAVORS.map((f,i)=>`<li><button aria-label="${f.name}" aria-current="${i===0}"></button></li>`).join('');
const dotBtns = [...dots.querySelectorAll('button')];
dotBtns.forEach((b,i)=>b.addEventListener('click',()=>go(i)));

function paintWord(name, animate){
  const chars = [...name.toUpperCase()];
  wordEl.innerHTML = chars.map((c,i)=>
    `<span class="ch${animate?' in':''}" style="animation-delay:${i*32}ms">${c===' '?'&nbsp;':c}</span>`).join('');
}
paintWord(FLAVORS[0].name, false);

/* keep the wordmark edge-to-edge but never clipped */
function fitWord(){
  wordEl.style.setProperty('--word-size','');
  const probe = parseFloat(getComputedStyle(wordEl).fontSize);
  const target = innerWidth * (innerWidth < 900 ? .94 : .92);
  const w = wordEl.scrollWidth;
  if (!w) return;
  const size = Math.min(probe * (target / w), innerWidth < 900 ? 132 : 210);
  wordEl.style.setProperty('--word-size', `${size}px`);
}
addEventListener('resize', fitWord);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitWord);
requestAnimationFrame(fitWord);

function apply(f){
  hero.style.setProperty('--bg-core', f.core);
  hero.style.setProperty('--bg-edge', f.edge);
  bowl.src = `/fruity/${f.img}.webp`;
  orchard.style.filter = `hue-rotate(${f.deco})`;
  bowl.alt = `${f.name} smoothie bowl`;
  priceEl.textContent = f.price;
  blurbEl.textContent = f.blurb;
  dotBtns.forEach((b,i)=>b.setAttribute('aria-current', String(i===idx)));
}

function go(next){
  if (busy || next === idx) return;
  busy = true;
  idx = (next + FLAVORS.length) % FLAVORS.length;
  const f = FLAVORS[idx];

  [...wordEl.children].forEach((ch,i)=>{ ch.classList.remove('in'); ch.classList.add('out'); ch.style.animationDelay = `${i*22}ms`; });
  hero.classList.add('swapping');
  bowl.classList.remove('spin'); void bowl.offsetWidth; bowl.classList.add('spin');

  setTimeout(()=>{ paintWord(f.name, true); fitWord(); apply(f); hero.classList.remove('swapping'); }, 340);
  setTimeout(()=>{ busy = false; }, 760);
}
apply(FLAVORS[0]);   // paint the opening flavor's palette on load

document.querySelectorAll('.step').forEach(b =>
  b.addEventListener('click', () => go(idx + Number(b.dataset.dir))));
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') go(idx+1);
  if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  go(idx-1);
});

/* preload every bowl so a flavor swap never flashes */
FLAVORS.forEach(f => { const i = new Image(); i.src = `/fruity/${f.img}.webp`; });

/* ---------- parallax ---------- */
const bits = [...document.querySelectorAll('.bit')];
let px = 0, py = 0, tx = 0, ty = 0;
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && matchMedia('(pointer:fine)').matches){
  window.addEventListener('pointermove', e => {
    tx = (e.clientX / innerWidth  - .5) * 2;
    ty = (e.clientY / innerHeight - .5) * 2;
  });
  (function loop(){
    px += (tx - px) * .06; py += (ty - py) * .06;
    bits.forEach(b => {
      const d = +b.dataset.depth / 10;
      b.style.translate = `${-px*d}px ${-py*d}px`;
    });
    bowl.style.translate = `${px*9}px ${py*9}px`;
    requestAnimationFrame(loop);
  })();
}

/* ---------- dishes ---------- */
const cardsEl = document.querySelector('.cards');
cardsEl.innerHTML = FLAVORS.map((f,i) => `
  <article class="card reveal" data-go="${i}" tabindex="0" role="button" aria-label="Show ${f.name}">
    <img class="thumb" src="/fruity/${f.img}.webp" alt="" aria-hidden="true" loading="lazy" />
    <span class="glow" style="background:radial-gradient(circle,${f.core}88,transparent 70%)"></span>
    <h3>${f.name}</h3><p>${f.blurb}</p>
    <span class="tag">${f.price}</span>
  </article>`).join('');

cardsEl.addEventListener('click', e => {
  const c = e.target.closest('[data-go]'); if (!c) return;
  go(+c.dataset.go);
  document.getElementById('top').scrollIntoView({ behavior:'smooth' });
});
cardsEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.target.click?.(); }
});

/* ---------- reveal ---------- */
document.querySelectorAll('.sec-head, .steps li, .contact-inner').forEach(el => el.classList.add('reveal'));
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting){ e.target.classList.add('seen'); io.unobserve(e.target); }
}), { threshold:.18 });
document.querySelectorAll('.reveal').forEach((el,i) => {
  el.style.transitionDelay = `${(i % 4) * 70}ms`;
  io.observe(el);
});

/* ---------- nav state ---------- */
const links = [...document.querySelectorAll('.menu a')];
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${e.target.id}`));
}), { threshold:.4 });
['top','dishes','recipes','contact'].forEach(id => {
  const el = document.getElementById(id); if (el) spy.observe(el);
});
document.querySelector('.burger').addEventListener('click', () => {
  const m = document.querySelector('.menu');
  const open = m.style.display === 'flex';
  m.style.display = open ? '' : 'flex';
  m.style.position = 'fixed'; m.style.top = '76px'; m.style.left = '50%';
  m.style.transform = 'translateX(-50%)'; m.style.flexDirection = 'column';
  document.querySelector('.burger').setAttribute('aria-expanded', String(!open));
});

/* ---------- form ---------- */
const form = document.querySelector('.signup');
form.addEventListener('submit', e => {
  e.preventDefault();
  const input = form.querySelector('input');
  const note  = document.querySelector('.form-note');
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
  note.textContent = ok ? `Locked in — we'll ping ${input.value.trim()} the moment bowls ship.`
                        : 'That email looks off. Mind checking it?';
  if (ok) input.value = '';
});
