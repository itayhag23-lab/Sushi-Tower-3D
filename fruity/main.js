/* ---------- flavors ---------- */
const FLAVORS = [
  { name:'Kiwi',       price:'$98',  core:'#9fbc58', edge:'#33501c', img:'kiwi',       deco:'kiwi',
    blurb:'Sharp kiwi blended cold, cut with coconut flakes and toasted oats for a finish that stays bright.' },
  { name:'Pineapple',  price:'$112', core:'#e3bb4e', edge:'#6d5010', img:'pineapple',  deco:'pineapple',
    blurb:'Sun-ripe pineapple, chopped thick and stirred slow, with a whisper of sea salt over the grains.' },
  { name:'Orange',     price:'$120', core:'#e0994e', edge:'#75360c', img:'orange',     deco:'orange',
    blurb:'Cold-pressed orange and whole segments, layered over crunchy granola on a silky smooth base.' },
  { name:'Strawberry', price:'$135', core:'#d4788a', edge:'#6b1c2c', img:'strawberry', deco:'strawberry',
    blurb:'Field strawberries halved by hand, piled over coconut and oats until the colour turns deep red.' },
];

/* ---------- decorative fruit: every flavor gets its own ---------- */
let uid = 0;
const gid = () => `g${++uid}`;

const kiwiSvg = () => {
  const id = gid();
  return `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#b7d06b"/><circle cx="50" cy="50" r="42" fill="#8fbd4d"/>
${Array.from({length:34},(_,i)=>{const a=i/34*Math.PI*2;return `<line x1="${50+Math.cos(a)*13}" y1="${50+Math.sin(a)*13}" x2="${50+Math.cos(a)*39}" y2="${50+Math.sin(a)*39}" stroke="#28401a" stroke-width="1.4" stroke-linecap="round" opacity=".55"/>`}).join('')}
${Array.from({length:14},(_,i)=>{const a=i/14*Math.PI*2;const x=50+Math.cos(a)*27,y=50+Math.sin(a)*27;return `<ellipse cx="${x}" cy="${y}" rx="2" ry="3.4" fill="#1d2f12" transform="rotate(${a*57.3+90} ${x} ${y})"/>`}).join('')}
<ellipse cx="50" cy="50" rx="13" ry="12" fill="#f4f3dd"/><!--${id}--></svg>`;
};

const limeSvg = () => {
  const id = gid();
  return `<svg viewBox="0 0 100 100"><defs><clipPath id="${id}"><path d="M50 96C23 96 4 76 4 50S23 4 50 4Z"/></clipPath></defs>
<path d="M50 98C23 98 2 77 2 50S23 2 50 2Z" fill="#eef3cd"/>
<g clip-path="url(#${id})"><circle cx="50" cy="50" r="41" fill="#d5e88f"/>
${Array.from({length:8},(_,i)=>{const a=Math.PI/2+(i+.5)/8*Math.PI,b=Math.PI/2+(i+1.5)/8*Math.PI;
  return `<path d="M50 50 L${50+Math.cos(a)*40} ${50+Math.sin(a)*40} A40 40 0 0 1 ${50+Math.cos(b)*40} ${50+Math.sin(b)*40} Z" fill="#b9dc5c" stroke="#f2f7dc" stroke-width="2.6"/>`}).join('')}
<circle cx="50" cy="50" r="6" fill="#eef3cd"/></g></svg>`;
};

/* citrus wheel — used for the orange flavor */
const orangeSvg = () => {
  const id = gid();
  return `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#f6a63a"/><circle cx="50" cy="50" r="43" fill="#fde3b8"/>
<g>${Array.from({length:9},(_,i)=>{const a=i/9*Math.PI*2,b=(i+1)/9*Math.PI*2;
  return `<path d="M50 50 L${50+Math.cos(a+.06)*38} ${50+Math.sin(a+.06)*38} A38 38 0 0 1 ${50+Math.cos(b-.06)*38} ${50+Math.sin(b-.06)*38} Z" fill="#f9862a"/>`}).join('')}</g>
<circle cx="50" cy="50" r="6.5" fill="#fdead0"/><!--${id}--></svg>`;
};

const orangeWedgeSvg = () => `<svg viewBox="0 0 100 100"><path d="M50 96C23 96 4 76 4 50S23 4 50 4Z" fill="#fde3b8"/>
<path d="M48 90C26 88 10 72 10 50S26 14 48 12Z" fill="#f9862a"/>
${Array.from({length:5},(_,i)=>{const a=Math.PI/2+(i+.5)/5*Math.PI;return `<path d="M48 51 L${48+Math.cos(a)*40} ${51+Math.sin(a)*40}" stroke="#fdead0" stroke-width="2.6" stroke-linecap="round"/>`}).join('')}</svg>`;

/* pineapple — ring and whole fruit */
const pineRingSvg = () => `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#e8c552"/><circle cx="50" cy="50" r="42" fill="#f7d967"/>
${Array.from({length:24},(_,i)=>{const a=i/24*Math.PI*2;const x=50+Math.cos(a)*31,y=50+Math.sin(a)*31;
  return `<rect x="${x-4}" y="${y-4}" width="8" height="8" rx="2" fill="#e0b53c" transform="rotate(${a*57.3} ${x} ${y})"/>`}).join('')}
<circle cx="50" cy="50" r="13" fill="#fbeaa8"/><circle cx="50" cy="50" r="9" fill="none" stroke="#e0b53c" stroke-width="2"/></svg>`;

const pineWholeSvg = () => `<svg viewBox="0 0 100 100">
<path d="M50 8 L38 2 44 14 30 10 40 20 26 22 40 28Z" fill="#5f9c3b"/>
<path d="M50 8 L62 2 56 14 70 10 60 20 74 22 60 28Z" fill="#74b84a"/>
<ellipse cx="50" cy="62" rx="30" ry="34" fill="#e9c04a"/>
<ellipse cx="44" cy="58" rx="20" ry="24" fill="#f5d666"/>
${Array.from({length:5},(_,r)=>Array.from({length:5},(_,c)=>{const x=26+c*12+(r%2?6:0),y=38+r*11;
  return x>72?'':`<rect x="${x-4}" y="${y-4}" width="8.5" height="8.5" rx="2.4" fill="none" stroke="#c79a2c" stroke-width="1.5" transform="rotate(45 ${x} ${y})"/>`}).join('')).join('')}</svg>`;

/* strawberry — whole and halved */
const strawSvg = () => `<svg viewBox="0 0 100 100">
<path d="M50 96C30 96 14 78 14 56c0-14 16-22 36-22s36 8 36 22c0 22-16 40-36 40Z" fill="#d81e3c"/>
<path d="M50 92C34 92 20 76 20 56c0-11 13-18 30-18Z" fill="#ec3b52"/>
<path d="M50 34c-14 0-24-4-28-10 6-4 14-5 20-3-3-5-3-10-1-14 5 3 8 8 9 13 2-5 6-9 11-11 2 4 2 9-1 14 6-2 14-1 20 3-4 6-16 8-30 8Z" fill="#4f9a33"/>
${Array.from({length:11},(_,i)=>{const x=28+(i%4)*15+(i>7?8:0),y=48+Math.floor(i/4)*15;
  return `<ellipse cx="${x}" cy="${y}" rx="2.1" ry="3" fill="#ffe58a" transform="rotate(${i*24} ${x} ${y})"/>`}).join('')}</svg>`;

const strawHalfSvg = () => `<svg viewBox="0 0 100 100">
<path d="M50 96C30 96 14 78 14 56c0-14 16-22 36-22s36 8 36 22c0 22-16 40-36 40Z" fill="#e02742"/>
<path d="M50 88C34 88 22 74 22 56c0-10 12-16 28-16s28 6 28 16c0 18-12 32-28 32Z" fill="#f7b9bd"/>
<path d="M50 82C38 82 30 71 30 57c0-7 9-11 20-11Z" fill="#ef6076" opacity=".75"/>
<path d="M50 40v44" stroke="#fadcdf" stroke-width="3" stroke-linecap="round"/>
<path d="M50 30c-10 0-18-3-22-8 6-3 12-3 17-1-2-4-2-8 0-11 4 2 6 6 7 10 1-4 4-8 8-10 2 3 2 7 0 11 5-2 11-2 17 1-4 5-17 8-27 8Z" fill="#4f9a33"/></svg>`;

const mintSvg = () => `<svg viewBox="0 0 100 100"><path d="M50 6c26 10 40 30 38 52-2 22-20 36-38 36S14 80 12 58C10 36 24 16 50 6Z" fill="#5c9b3a"/>
<path d="M50 10c22 10 34 28 33 47-1 19-16 31-33 31Z" fill="#74b84a"/>
<path d="M50 12v80" stroke="#3d6d26" stroke-width="2.2" stroke-linecap="round"/>
${Array.from({length:6},(_,i)=>{const y=24+i*11;return `<path d="M50 ${y} L${28-i} ${y+11} M50 ${y} L${72+i} ${y+11}" stroke="#3d6d26" stroke-width="1.5" opacity=".6" fill="none"/>`}).join('')}</svg>`;

/* slot layout is shared; only the artwork changes per flavor */
const SLOTS = [
  { x:'27%', y:'15%', s:'clamp(52px,6.2vw,96px)', rot:'-14deg', amp:'26px', dur:'7s',   d:'0s',   depth:34, op:1,   soft:0 },
  { x:'82%', y:'84%', s:'clamp(44px,5.2vw,78px)', rot:'12deg',  amp:'22px', dur:'8.5s', d:'.8s',  depth:26, op:.95, soft:0 },
  { x:'67%', y:'12%', s:'clamp(46px,5.6vw,86px)', rot:'18deg',  amp:'20px', dur:'6.5s', d:'.3s',  depth:40, op:1,   soft:0 },
  { x:'2%',  y:'88%', s:'clamp(52px,7vw,104px)',  rot:'-32deg', amp:'24px', dur:'9s',   d:'1.2s', depth:18, op:.75, soft:2 },
  { x:'89%', y:'7%',  s:'clamp(34px,4vw,62px)',   rot:'34deg',  amp:'18px', dur:'7.5s', d:'.6s',  depth:48, op:1,   soft:0 },
  { x:'62%', y:'76%', s:'clamp(28px,3.4vw,50px)', rot:'-24deg', amp:'16px', dur:'6.8s', d:'1.5s', depth:44, op:1,   soft:0 },
  { x:'14%', y:'8%',  s:'clamp(38px,4.4vw,66px)', rot:'-48deg', amp:'20px', dur:'8.2s', d:'.2s',  depth:30, op:.9,  soft:1 },
  { x:'33%', y:'95%', s:'clamp(24px,2.8vw,44px)', rot:'6deg',   amp:'14px', dur:'7.2s', d:'1s',   depth:52, op:1,   soft:0 },
];

/* which artwork fills each slot, per flavor */
const DECOR = {
  kiwi:       [kiwiSvg, kiwiSvg, limeSvg, limeSvg, mintSvg, mintSvg, mintSvg, kiwiSvg],
  pineapple:  [pineRingSvg, pineRingSvg, pineWholeSvg, pineWholeSvg, mintSvg, mintSvg, pineRingSvg, pineRingSvg],
  orange:     [orangeSvg, orangeSvg, orangeWedgeSvg, orangeWedgeSvg, mintSvg, mintSvg, orangeSvg, orangeSvg],
  strawberry: [strawSvg, strawHalfSvg, strawHalfSvg, strawSvg, mintSvg, mintSvg, strawSvg, strawHalfSvg],
};

const orchard = document.querySelector('.orchard');

function paintOrchard(key){
  const art = DECOR[key];
  orchard.innerHTML = SLOTS.map((b, i) =>
    `<div class="bit" style="left:${b.x};top:${b.y};--s:${b.s};--rot:${b.rot};--amp:${b.amp};--dur:${b.dur};--delay:${b.d};--op:${b.op};--soft:${b.soft}px" data-depth="${b.depth}">${art[i]()}</div>`
  ).join('');
  bits = [...orchard.querySelectorAll('.bit')];
}
let bits = [];
paintOrchard(FLAVORS[0].deco);

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

/* keep the wordmark edge-to-edge but never clipped.
   the size variable belongs on the h1 - the span inside it only measures the text */
const wordBox = document.querySelector('.wordmark');
function fitWord(){
  wordBox.style.setProperty('--word-size', '');
  const probe = parseFloat(getComputedStyle(wordBox).fontSize);
  const w = wordEl.getBoundingClientRect().width;
  if (!w || !probe) return;
  const target = innerWidth * (innerWidth < 900 ? .94 : .92);
  // short words need bigger type or the bowl swallows them whole
  const cap = innerWidth < 900 ? 150 : Math.min(innerWidth * 0.235, innerHeight * 0.44);
  wordBox.style.setProperty('--word-size', `${Math.min(probe * (target / w), cap)}px`);
}
addEventListener('resize', fitWord);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitWord);
requestAnimationFrame(fitWord);

function apply(f){
  hero.style.setProperty('--bg-core', f.core);
  hero.style.setProperty('--bg-edge', f.edge);
  bowl.src = `/fruity/${f.img}.webp`;
  paintOrchard(f.deco);
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
