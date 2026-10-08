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
let settleTimer=null;
let lastScrollPosition=window.scrollY;
let suppressAutoUntilScroll=false;
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
    const id=playlist[index];
    const url='https://www.tiktok.com/@bennyp1010/video/'+id;
    panels.get(card).querySelectorAll('.tiktok-watch').forEach(a=>a.href=url);
    const embed=panels.get(card).querySelector('iframe.tiktok-embed');
    if(embed)embed.src='https://www.tiktok.com/player/v1/'+id+'?autoplay=1&muted=1&controls=1&description=0&music_info=0';
    const episode=panels.get(card).querySelector('.tiktok-episode');
    if(episode)episode.textContent='Episode '+(index+1)+' of '+playlist.length+' · Watch here or on TikTok ↗';
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
function candidateAtRest(){
  const feed=document.getElementById('mediaFeed');
  const bounds=feed.getBoundingClientRect();
  const line=midpoint();
  if(bounds.top>line||bounds.bottom<line)return null;
  // Only select a card genuinely inside the center band, not one long past it.
  return cards.find(card=>{
    const rect=card.getBoundingClientRect();
    const center=rect.top+rect.height/2;
    return Math.abs(center-line)<Math.min(105,window.innerHeight*.16);
  })||null;
}
function update(){
  ticking=false;
  if(performance.now()<pausedUntil||suppressAutoUntilScroll)return;
  const chosen=candidateAtRest();
  // Passing between cards does not dismiss the current video.
  if(chosen&&chosen!==active)select(chosen);
  else if(!chosen){
    const feed=document.getElementById('mediaFeed').getBoundingClientRect();
    if(feed.bottom<midpoint()-120||feed.top>midpoint()+120)select(null);
  }
}
function schedule(){
  if(Math.abs(window.scrollY-lastScrollPosition)>2)suppressAutoUntilScroll=false;
  lastScrollPosition=window.scrollY;
  clearTimeout(settleTimer);
  settleTimer=setTimeout(()=>requestAnimationFrame(update),380);
}
cards.forEach(card=>{
  const button=card.querySelector('.card-compact[role="button"]');
  const toggle=()=>{clearTimeout(settleTimer);pausedUntil=performance.now()+850;suppressAutoUntilScroll=true;select(active===card?null:card)};
  button?.addEventListener('click',toggle);
  button?.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();toggle()}});
});
stage.querySelector('.watch-close').addEventListener('click',()=>{pausedUntil=performance.now()+850;suppressAutoUntilScroll=true;clearTimeout(settleTimer);select(null)});
addEventListener('keydown',event=>{if(event.key==='Escape'&&active){pausedUntil=performance.now()+850;select(null)}});
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',schedule,{passive:true});
/* Start closed; scrolling or tapping a card opens the first preview. */
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
// No automatic player on initial page load.
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
