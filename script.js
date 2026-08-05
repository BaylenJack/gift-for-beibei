/* =========================================
   致贝贝 · 入场动效 · 开箱 · 名字雨 · 灯箱 · 彩蛋
   ========================================= */

// 0. 性能检测
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                 || (window.innerWidth < 768);
const isLowPerf = isMobile || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);

// 1. 滚动入场
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

const targets = document.querySelectorAll(
  '.cover-title, .cover-sub, .cover-quote, .cover-meta, .scroll-hint, ' +
  '.toc-list li, .page-text, .page-img, .page-side, ' +
  '.hero-title, .hero-sub, .hero-art, .hero-desc, ' +
  '.letter-title, .letter-body p, .footer-stamp, .footer-text, .footer-end, .footer-secret'
);
targets.forEach(t=>t.classList.add('reveal'));
targets.forEach(t=>io.observe(t));

// 2. 顶部进度条(GPU 加速)
const bar = document.getElementById('bar');
let ticking = false;
function updateBar(){
  const h = document.documentElement;
  const sc = h.scrollTop || document.body.scrollTop;
  const max = (h.scrollHeight - h.clientHeight) || 1;
  bar.style.transform = `scaleX(${sc / max})`;
  ticking = false;
}
window.addEventListener('scroll', ()=>{
  if(!ticking){
    requestAnimationFrame(updateBar);
    ticking = true;
  }
}, { passive:true });

// 3. 520 计数
const numEl = document.querySelector('.bigcount .num');
let counted = false;
const cIo = new IntersectionObserver((es)=>{
  es.forEach(e=>{
    if(e.isIntersecting && !counted){
      counted = true;
      const target = 520;
      const dur = 2200;
      const start = performance.now();
      const tick = (now)=>{
        const t = Math.min((now - start)/dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        numEl.textContent = Math.round(target * eased);
        if(t < 1) requestAnimationFrame(tick);
        else numEl.textContent = target;
      };
      requestAnimationFrame(tick);
      cIo.disconnect();
    }
  });
}, { threshold: 0.4 });
if(numEl) cIo.observe(numEl);

// 4. 拍立得视差(桌面端)
const polaroids = document.querySelectorAll('.polaroid');
if(!isMobile){
  polaroids.forEach(p=>{
    const tilt = parseFloat(p.dataset.tilt || 0);
    p.style.transform = `rotate(${tilt}deg)`;
    p.addEventListener('mousemove', (e)=>{
      const r = p.getBoundingClientRect();
      const cx = e.clientX - (r.left + r.width/2);
      const cy = e.clientY - (r.top + r.height/2);
      const max = 6;
      const rx = Math.max(-max, Math.min(max, -cy/20));
      const ry = Math.max(-max, Math.min(max, cx/20));
      p.style.transform = `rotate(${tilt}deg) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    p.addEventListener('mouseleave', ()=>{
      p.style.transform = `rotate(${tilt}deg)`;
    });
  });
}

// 5. 浮动粒子(移动端彻底关闭)
(function sprinkle(){
  if(isLowPerf) return;
  const colors = ['#b14233','#b08a3e','#7a93b3','#d77e6e'];
  const layer = document.createElement('div');
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1499;overflow:hidden';
  document.body.appendChild(layer);
  function spawn(){
    const el = document.createElement('div');
    const isHeart = Math.random() < .25;
    el.textContent = isHeart ? '♥' : '·';
    const size = isHeart ? 12 + Math.random()*8 : 14 + Math.random()*10;
    const color = colors[(Math.random()*colors.length)|0];
    const left = Math.random()*100;
    const dur = 14 + Math.random()*10;
    const delay = Math.random()*2;
    el.style.cssText = `
      position:absolute;
      left:${left}vw;bottom:-30px;
      color:${color};
      font-size:${size}px;
      opacity:0;
      font-family:'Ma Shan Zheng','KaiTi',serif;
      animation:floatUp ${dur}s linear ${delay}s forwards;
      will-change:transform,opacity;
    `;
    layer.appendChild(el);
    setTimeout(()=>el.remove(), (dur+delay+1)*1000);
  }
  if(!document.getElementById('floatKeyframes')){
    const s = document.createElement('style');
    s.id = 'floatKeyframes';
    s.textContent = `
      @keyframes floatUp{
        0%   { transform:translateY(0) rotate(0deg); opacity:0 }
        8%   { opacity:.7 }
        50%  { transform:translateY(-55vh) rotate(180deg); opacity:.5 }
        100% { transform:translateY(-110vh) rotate(360deg); opacity:0 }
      }
    `;
    document.head.appendChild(s);
  }
  setInterval(spawn, 1600);
  for(let i=0;i<3;i++) setTimeout(spawn, i*500);
})();

// 6. 开箱 + 浮信(修复 1.2 依赖 CSS overflow:hidden 裁剪)
(function opening(){
  const box = document.getElementById('box');
  const hint = document.getElementById('openHint');
  const letter = document.getElementById('openingLetter');

  let opened = false;
  let userScrolled = false;

  // 监听滚动:如果用户在 8s 前已离开首屏,不强制开箱
  const onScroll = ()=>{ if(window.scrollY > window.innerHeight * 0.5) userScrolled = true; };
  window.addEventListener('scroll', onScroll, { passive:true });

  function open(){
    if(opened) return;
    opened = true;
    box.classList.add('opened');
    hint.classList.add('hide');
    setTimeout(()=>{ letter.classList.add('show'); }, 900);
  }

  box.addEventListener('click', open);
  box.addEventListener('touchstart', open, {passive:true});
  document.addEventListener('keydown', (e)=>{
    if((e.code === 'Space' || e.code === 'Enter') && !opened) open();
  });
  // 修复:仅当用户仍停留在首屏时,8s 后才自动开箱
  setTimeout(()=>{
    if(!opened && !userScrolled) open();
  }, 8000);
})();

// 7. 目录点击跳转(scroll-margin-top 8px 让位给 fixed 进度条)
document.querySelectorAll('.toc-list li[data-go]').forEach(li=>{
  li.addEventListener('click', ()=>{
    const id = li.getAttribute('data-go');
    const t = document.getElementById(id);
    if(t) t.scrollIntoView({behavior:'smooth', block:'start'});
  });
});

// 8. 全屏灯箱
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lightboxImg');
const lbWebp = document.getElementById('lightboxWebp');
const lbCap = document.getElementById('lightboxCap');
const lbClose = document.getElementById('lightboxClose');

document.querySelectorAll('.btn-view').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    e.preventDefault();
    const jpg = btn.dataset.img;
    const webp = btn.dataset.imgWebp;
    lbImg.src = jpg;
    if(webp){ lbWebp.srcset = webp; }
    lbCap.textContent = btn.dataset.caption || '';
    lb.classList.add('show');
    document.body.style.overflow = 'hidden';
  });
});
function closeLb(){
  lb.classList.remove('show');
  lbImg.src = '';
  lbWebp.srcset = '';
  document.body.style.overflow = '';
}
lbClose.addEventListener('click', closeLb);
lb.addEventListener('click', (e)=>{ if(e.target === lb) closeLb(); });
document.addEventListener('keydown', (e)=>{ if(e.code === 'Escape') closeLb(); });

// 9. 彩蛋
const easter = document.getElementById('easter');
const easterClose = document.getElementById('easterClose');
const secret = document.getElementById('footerSecret');

function showEaster(){ easter.classList.add('show'); document.body.style.overflow='hidden'; }
function hideEaster(){ easter.classList.remove('show'); document.body.style.overflow=''; }
easterClose.addEventListener('click', hideEaster);
easter.addEventListener('click', (e)=>{ if(e.target === easter) hideEaster(); });

let clicks = 0, clickTimer;
secret.addEventListener('click', ()=>{
  clicks++;
  clearTimeout(clickTimer);
  clickTimer = setTimeout(()=>clicks = 0, 1500);
  if(clicks >= 5){ showEaster(); clicks = 0; }
});
let globalClicks = 0, gTimer;
document.addEventListener('click', (e)=>{
  if(e.target.closest('.lightbox') || e.target.closest('.easter') || e.target.closest('.box')) return;
  globalClicks++;
  clearTimeout(gTimer);
  gTimer = setTimeout(()=>globalClicks = 0, 1800);
  if(globalClicks >= 7){ showEaster(); globalClicks = 0; }
});

// 10. 名字雨 canvas(移动端降密度)
const canvas = document.getElementById('nameRain');
if(canvas){
  const ctx = canvas.getContext('2d');
  let drops = [];
  let running = false;
  let lastW = 0, lastH = 0;
  const MAX_DROPS = isMobile ? 18 : 60;
  const SPAWN_RATE = isMobile ? 0.18 : 0.4;

  function resize(){
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    lastW = rect.width; lastH = rect.height;
  }
  resize();
  let resizeTimer;
  window.addEventListener('resize', ()=>{
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  function spawn(){
    return {
      x: Math.random() * lastW,
      y: -20 - Math.random() * 100,
      v: .6 + Math.random() * 1.4,
      size: isMobile ? 12 + Math.random() * 6 : 14 + Math.random() * 10,
      alpha: .2 + Math.random() * .5,
      rot: (Math.random()-.5) * 30,
      vrot: (Math.random()-.5) * .6,
      tone: Math.random()
    };
  }

  function step(){
    if(!running) return;
    ctx.clearRect(0,0,lastW,lastH);
    if(drops.length < MAX_DROPS && Math.random() < SPAWN_RATE) drops.push(spawn());
    drops = drops.filter(d => d.y < lastH + 30);
    drops.forEach(d=>{
      d.y += d.v;
      d.rot += d.vrot;
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rot * Math.PI / 180);
      ctx.font = `${d.size}px "Ma Shan Zheng","KaiTi",serif`;
      ctx.fillStyle = d.tone < .25 ? `rgba(177,66,51,${d.alpha})` : `rgba(43,38,32,${d.alpha*.4})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('韩天宇 ♥', 0, 0);
      ctx.restore();
    });
    requestAnimationFrame(step);
  }

  const heroObserver = new IntersectionObserver((es)=>{
    es.forEach(e=>{
      if(e.isIntersecting && !running){
        running = true;
        resize();
        step();
      } else if(!e.isIntersecting && e.boundingClientRect.top < 0){
        running = false;
        drops = [];
      }
    });
  }, { threshold: 0.05 });
  heroObserver.observe(canvas.parentElement);
}