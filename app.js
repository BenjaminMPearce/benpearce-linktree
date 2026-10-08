const cards=[...document.querySelectorAll('.media-card:not(.static-card)')];
const allCards=[...document.querySelectorAll('.media-card')];
const shareButton=document.getElementById('shareProfile');
const shareStatus=document.getElementById('shareStatus');
const mobileDock=document.querySelector('.mobile-dock');

let activeCard=null;
let ticking=false;
let manualLockUntil=0;
let lastScrollY=window.scrollY;
const COMPACT_HEIGHT=90;
const CARD_GAP=10;
const playlistPositions=new WeakMap();

function setCardSizes(){
  const available=Math.max(180,window.innerHeight-128);
  allCards.forEach(card=>card.style.setProperty('--square-size',Math.min(Math.round(card.getBoundingClientRect().width),available)+'px'));
}
function loadMedia(card){
  if(card?.dataset.source==='tiktok'){
    const playlist=(card.dataset.playlist||'').split(',').filter(Boolean);
    if(!playlist.length)return;
    const index=playlistPositions.get(card)||0;
    const url='https://www.tiktok.com/t/'+encodeURIComponent(playlist[index])+'/';
    card.querySelectorAll('.tiktok-media,.tiktok-watch').forEach(link=>link.href=url);
    const episode=card.querySelector('.tiktok-episode');
    if(episode)episode.textContent='Episode '+(index+1)+' of '+playlist.length+' · Tap to watch ↗';
    playlistPositions.set(card,(index+1)%playlist.length);
    return;
  }
  const iframe=card?.querySelector('iframe[data-src]');
  if(!iframe||iframe.src)return;
  const playlist=(card.dataset.playlist||'').split(',').filter(Boolean);
  if(playlist.length){
    const index=playlistPositions.get(card)||0;
    iframe.dataset.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(playlist[index])+'?autoplay=1&mute=1&playsinline=1&controls=1&rel=0';
    playlistPositions.set(card,(index+1)%playlist.length);
  }
  if(!iframe.dataset.src)return;
  card.classList.add('loading');
  iframe.src=iframe.dataset.src;
  const done=()=>{card.classList.remove('loading');card.classList.add('media-loaded')};
  iframe.addEventListener('load',done,{once:true});
  setTimeout(()=>card.classList.remove('loading'),5000);
}
function stopMedia(card){
  const iframe=card?.querySelector('iframe.media-embed');
  if(!iframe||!iframe.src)return;
  iframe.removeAttribute('src');
  card.classList.remove('loading','media-loaded');
}
function syncExpandedState(){
  cards.forEach(card=>{
    const compact=card.querySelector('.card-compact[role="button"]');
    if(compact)compact.setAttribute('aria-expanded',String(card===activeCard));
  });
}
function setActive(card){
  if(activeCard===card)return;
  const previous=activeCard;
  if(previous){previous.classList.remove('active');stopMedia(previous)}
  activeCard=card||null;
  if(activeCard){activeCard.classList.add('active');loadMedia(activeCard);manualLockUntil=performance.now()+180}
  syncExpandedState();
}
function updateActiveCard(){
  ticking=false;
  if(performance.now()<manualLockUntil)return;
  const center=window.innerHeight/2;
  const candidate=[...cards].reverse().find(card=>card.getBoundingClientRect().top+COMPACT_HEIGHT/2<=center)||null;
  setActive(candidate);
}
function schedule(){
  if(ticking)return;
  ticking=true;
  requestAnimationFrame(updateActiveCard);
}
cards.forEach(card=>{
  const compact=card.querySelector('.card-compact[role="button"]');
  if(!compact)return;
  const toggle=()=>{
    manualLockUntil=performance.now()+650;
    setActive(activeCard===card?null:card);
  };
  compact.addEventListener('click',toggle);
  compact.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){event.preventDefault();toggle()}
  });
});
setCardSizes();syncExpandedState();
document.querySelectorAll('.close-preview').forEach(button=>button.addEventListener('click',()=>{manualLockUntil=performance.now()+650;setActive(null)}));
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',()=>{setCardSizes();schedule()},{passive:true});
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
