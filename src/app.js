/* Garber Guard — browser behavior. Pages arrive pre-built; this adds the menus, the home picker and the get-started flow. Relies on globals from site.js. */
(function(){
const path=location.pathname.replace(/\/+$/,'')||'/';
const isFlow=path==='/get-started';
const app=document.getElementById('app');
captureAttr();

/* Old #links (e.g. /#tire-wheel) go to the matching page */
const legacy=(location.hash||'').slice(1);
if(legacy&&PATHS[legacy]&&PATHS[legacy]!==path){location.replace(PATHS[legacy]);return;}

/* ---------- mobile menu ---------- */
const menuBtn=document.getElementById('menuBtn'),nav=document.getElementById('nav');
const mnav=document.getElementById('mnav');
if(menuBtn&&mnav){
  const panel=mnav.querySelector('.mnav-panel');let closeT=null;
  const here=location.pathname.replace(/\/+$/,'')||'/';
  mnav.querySelectorAll('a[href]').forEach(a=>{if(a.getAttribute('href')===here)a.setAttribute('aria-current','page');});
  const tabsEls=[...mnav.querySelectorAll('[data-mtab]')];
  const showTab=i=>{tabsEls.forEach((t,j)=>{t.setAttribute('aria-selected',String(i===j));t.tabIndex=i===j?0:-1;document.getElementById('mp-'+j).hidden=i!==j;});};
  const cur=mnav.querySelector('.mnav-list a[aria-current="page"]');showTab(cur?+cur.closest('.mnav-list').id.slice(3):0);
  tabsEls.forEach((t,i)=>{t.addEventListener('click',()=>showTab(i));t.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const n=(i+(e.key==='ArrowRight'?1:-1)+tabsEls.length)%tabsEls.length;showTab(n);tabsEls[n].focus();}});});
  const open=()=>{clearTimeout(closeT);mnav.hidden=false;void mnav.offsetWidth;mnav.classList.add('open');document.body.classList.add('mnav-lock');menuBtn.setAttribute('aria-expanded','true');setTimeout(()=>panel.focus({preventScroll:true}),60);};
  const close=(refocus=true)=>{if(mnav.hidden)return;mnav.classList.remove('open');document.body.classList.remove('mnav-lock');menuBtn.setAttribute('aria-expanded','false');closeT=setTimeout(()=>{mnav.hidden=true;},430);if(refocus)menuBtn.focus({preventScroll:true});};
  menuBtn.addEventListener('click',open);
  mnav.addEventListener('click',e=>{if(e.target.closest('[data-mclose]'))close();else if(e.target.closest('a[href]'))close(false);});
  document.addEventListener('keydown',e=>{if(mnav.hidden)return;if(e.key==='Escape'){close();return;}
    if(e.key==='Tab'){const f=[...panel.querySelectorAll('a[href],button:not([disabled])')].filter(el=>el.offsetParent!==null);if(!f.length)return;const first=f[0],last=f[f.length-1];
      if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel)){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
  matchMedia('(min-width:961px)').addEventListener('change',m=>{if(m.matches)close(false);});
  let sx=null;panel.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;},{passive:true});
  panel.addEventListener('touchend',e=>{if(sx!==null&&e.changedTouches[0].clientX-sx>70)close();sx=null;},{passive:true});
}

/* ---------- plans dropdown ---------- */
const ddBtn=document.getElementById('plansBtn'),ddPanel=document.getElementById('plansMenu'),dd=document.getElementById('plansDD');
if(dd){
  let ddHoverAt=0,ddTimer=null;
  const ddIsDesktop=()=>matchMedia('(min-width:961px)').matches;
  const ddSet=open=>{ddPanel.hidden=!open;ddBtn.setAttribute('aria-expanded',String(open));};
  ddBtn.addEventListener('click',()=>{const open=ddPanel.hidden;if(!open&&Date.now()-ddHoverAt<400)return;ddSet(open);});
  dd.addEventListener('pointerenter',e=>{if(e.pointerType!=='mouse'||!ddIsDesktop())return;clearTimeout(ddTimer);if(ddPanel.hidden){ddSet(true);ddHoverAt=Date.now();}});
  dd.addEventListener('pointerleave',e=>{if(e.pointerType!=='mouse'||!ddIsDesktop())return;ddTimer=setTimeout(()=>ddSet(false),180);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!ddPanel.hidden){ddSet(false);ddBtn.focus();}});
  document.addEventListener('click',e=>{if(!ddPanel.hidden&&ddIsDesktop()&&!dd.contains(e.target))ddSet(false);});
  dd.addEventListener('focusout',e=>{if(ddIsDesktop()&&!dd.contains(e.relatedTarget))ddSet(false);});
}

/* ---------- get-started flow ---------- */
function renderFlow(toTop){
  app.innerHTML=[null,vStep1,vStep2,vStep3,vStep4][Q.step]();
  if(toTop!==false)window.scrollTo(0,0);
  if(Q.step===4){const h=document.getElementById('doneH');h&&h.focus({preventScroll:true});}
}
function rerenderKeep(id){const y=scrollY;renderFlow(false);scrollTo(0,y);const el=id&&document.getElementById(id);el&&el.focus({preventScroll:true});}
const syncPicks=()=>document.querySelectorAll('[data-pick]').forEach(c=>c.checked=Q.products.includes(c.dataset.pick));

if(isFlow)renderFlow(false);else syncPicks();

/* ---------- events ---------- */
document.addEventListener('click',e=>{
  const st=e.target.closest('[data-start]');
  if(st){const id=st.dataset.start;
    if(id&&P[id]&&!Q.products.includes(id))startWith(Q.products.concat([id]).filter(x=>x!=='unsure'));else startWith();
    errs={};
    if(isFlow){e.preventDefault();renderFlow();}
    return;}
  if(e.target.closest('[data-back]')){Q.step=Math.max(1,Q.step-1);errs={};save();renderFlow();return;}
  if(e.target.closest('[data-addcombo]')){if(!Q.products.includes('combo'))Q.products.push('combo');save();rerenderKeep();return;}
  if(e.target.closest('[data-reset]')){Q=blank();save();}
});
document.addEventListener('change',e=>{const t=e.target;
  if(t.dataset.pick){const id=t.dataset.pick;let L=Q.products.filter(x=>x!==id);
    if(t.checked){if(id==='unsure')L=[];else L=L.filter(x=>x!=='unsure');L.push(id);}
    Q.products=L;save();
    if(isFlow){delete errs.products;rerenderKeep(t.id);}else syncPicks();
    return;}
  if(t.dataset.f){Q[t.dataset.f]=t.type==='checkbox'?t.checked:t.value;save();
    if(t.dataset.f==='where'||t.dataset.f==='year')rerenderKeep(t.id);}
});
document.addEventListener('input',e=>{const t=e.target;if(t.dataset.f&&t.type!=='checkbox'&&t.type!=='radio'){Q[t.dataset.f]=t.value;save();}});
let sending=false;
document.addEventListener('submit',async e=>{
  if(e.target.id==='pickerForm'){e.preventDefault();startWith();location.href='/get-started';return;}
  if(e.target.id==='qform'){e.preventDefault();
    if(!validate(Q.step)){renderFlow(false);const f=document.querySelector('[aria-invalid="true"]')||document.querySelector('.err');f&&f.focus&&f.focus();f&&f.scrollIntoView({block:'center'});return;}
    if(Q.step===3){
      if(sending)return;sending=true;
      if(!Q.ref)Q.ref='GG-'+Math.random().toString(36).slice(2,8).toUpperCase();save();
      const b=document.getElementById('q-send');if(b){b.disabled=true;b.textContent='Sending…';}
      const ok=await sendLead();sending=false;
      if(!ok){errs={submit:'We couldn\'t send your request. Please try again, or call '+PHONE+'.'};renderFlow(false);const m=document.getElementById('e-submit');m&&m.scrollIntoView({block:'center'});return;}
    }
    Q.step++;save();renderFlow();}
});
})();
