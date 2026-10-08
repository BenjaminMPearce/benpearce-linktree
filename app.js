const cards=[...document.querySelectorAll('.media-card:not(.static-card)')];
const shareButton=document.getElementById('shareProfile');
const shareStatus=document.getElementById('shareStatus');
const mobileDock=document.querySelector('.mobile-dock');
const stage=document.getElementById('watchStage');
const content=document.getElementById('watchContent');
const heading=document.getElementById('watchHeading');
const count=document.getElementById('watchCount');
const positions=new WeakMap();
const panels=new Map(cards.map(card=>[card,card.querySelector('.card-expanded')]));
let active=null;
let ticking=false;
let pausedUntil=0;
const midpoint=()=>window.innerHeight*.5;
function unload(card){
  if(!card)return;
  const iframe=panels.get(card)?.querySelector('iframe.media-embed');
  if(iframe)iframe.removeAttribute('src');
  card.classList.remove('loading','media-loaded');
}
function prepare(card){
  const playlist=(card.dataset.playlist||'').split(',').filter(Boolean);
  if(!playlist.length)return;
  const index=positions.get(card)||0;
  positions.set(card,(index+1)%playlist.length);
  count.textContent=(index+1)+' / '+playlist.length;
  if(card.dataset.source==='tiktok'){
    const url='https://www.tiktok.com/t/'+encodeURIComponent(playlist[index])+'/';
    panels.get(card).querySelectorAll('.tiktok-media,.tiktok-watch').forEach(a=>a.href=url);
    const episode=panels.get(card).querySelector('.tiktok-episode');
    if(episode)episode.textContent='Episode '+(index+1)+' of '+playlist.length+' · Tap to watch ↗';
    return;
  }
  const iframe=panels.get(card).querySelector('iframe.media-embed');
  if(!iframe)return;
  card.classList.add('loading');
  iframe.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(playlist[index])+'?autoplay=1&mute=1&playsinline=1&controls=1&rel=0';
  iframe.onload=()=>{card.classList.remove('loading');card.classList.add('media-loaded')};
}
function select(card){
  if(active===card)return;
  if(active){
    unload(active);
    active.classList.remove('active');
    const old=panels.get(active);
    if(old)active.appendChild(old);
  }
  active=card;
  if(!card){
    stage.classList.remove('open');
    stage.setAttribute('aria-hidden','true');
    count.textContent='';
  }else{
    const panel=panels.get(card);
    content.replaceChildren(panel);
    heading.textContent=card.querySelector('h3')?.textContent||'Now playing';
    card.classList.add('active');
    stage.classList.add('open');
    stage.setAttribute('aria-hidden','false');
    prepare(card);
  }
  cards.forEach(item=>item.querySelector('.card-compact')?.setAttribute('aria-expanded',String(item===active)));
}
function update(){
  ticking=false;
  if(performance.now()<pausedUntil)return;
  const feed=document.getElementById('mediaFeed');
  const rect=feed.getBoundingClientRect();
  const line=midpoint();
  if(rect.top>line||rect.bottom<line){select(null);return}
  const chosen=[...cards].reverse().find(card=>card.getBoundingClientRect().top+45<=line)||null;
  select(chosen);
}
function schedule(){
  if(ticking)return;
  ticking=true;
  requestAnimationFrame(update);
}
cards.forEach(card=>{
  const button=card.querySelector('.card-compact[role="button"]');
  const toggle=()=>{pausedUntil=performance.now()+700;select(active===card?null:card)};
  button?.addEventListener('click',toggle);
  button?.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();toggle()}});
});
stage.querySelector('.watch-close').addEventListener('click',()=>{pausedUntil=performance.now()+850;select(null)});
addEventListener('keydown',event=>{if(event.key==='Escape'&&active){pausedUntil=performance.now()+850;select(null)}});
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',schedule,{passive:true});
requestAnimationFrame(update);
if(shareButton)shareButton.addEventListener('click',async()=>{
  const shareData={title:'Benjamin Pearce',text:'Benjamin Pearce — films, reviews, sketches and production work.',url:location.href};
  try{
    if(navigator.share)await navigator.share(shareData);
    else{await navigator.clipboard.writeText(location.href);if(shareStatus)shareStatus.textContent='Link copied.'}
  }catch(error){if(error?.name!=='AbortError'&&shareStatus)shareStatus.textContent='Could not share this link.'}
  setTimeout(()=>{if(shareStatus)shareStatus.textContent=''},1800);
});
if(mobileDock)mobileDock.addEventListener('click',event=>{
  const button=event.target.closest('button[data-dock]');if(!button)return;
  if(button.dataset.dock==='top')window.scrollTo({top:0,behavior:'smooth'});
  if(button.dataset.dock==='browse')document.querySelector('.media-feed')?.scrollIntoView({behavior:'smooth',block:'start'});
  if(button.dataset.dock==='share')shareButton?.click();
});
requestAnimationFrame(updateActiveCard);
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
