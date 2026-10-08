const cards=[...document.querySelectorAll('.media-card:not(.static-card)')];
const allCards=[...document.querySelectorAll('.media-card')];
const shareButton=document.getElementById('shareProfile');
const shareStatus=document.getElementById('shareStatus');
const mobileDock=document.querySelector('.mobile-dock');

let activeCard=null;
let ticking=false;
let manualLockUntil=0;
let settledScrollY=0;
let lastUserScrollY=0;
let repositioning=false;
const COMPACT_HEIGHT=90;
const CARD_GAP=10;
let baseline=[];
let feedOrigin=0;
const playlistPositions=new WeakMap();

function setCardSizes(){
  const available=Math.max(220,window.innerHeight-128);
  allCards.forEach(card=>card.style.setProperty('--square-size',Math.min(Math.round(card.getBoundingClientRect().width),available)+'px'));
}
function loadMedia(card){
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
function centerExpanded(card){
  if(!card)return;
  requestAnimationFrame(()=>{
    const rect=card.getBoundingClientRect();
    const size=parseFloat(getComputedStyle(card).getPropertyValue('--square-size'))||rect.width;
    const desired=Math.max(12,(window.innerHeight-size)/2-12);
    const target=Math.max(0,window.scrollY+rect.top-desired);
    repositioning=true;
    window.scrollTo({top:target,behavior:'instant'});
    settledScrollY=target;
    lastUserScrollY=target;
    requestAnimationFrame(()=>{repositioning=false});
  });
}
function setActive(card){
  if(activeCard===card)return;
  const previous=activeCard;
  if(previous){previous.classList.remove('active');stopMedia(previous)}
  activeCard=card||null;
  if(activeCard){activeCard.classList.add('active');loadMedia(activeCard);centerExpanded(activeCard);manualLockUntil=performance.now()+500}
  syncExpandedState();
}
function measureFeed(){
  // The compact layout is our source of truth; expansion never changes thresholds.
  const feed=document.getElementById('mediaFeed');
  if(!feed)return;
  const first=allCards[0];
  if(!first)return;
  feedOrigin=feed.getBoundingClientRect().top+window.scrollY;
  const activeExtra=activeCard?Math.max(0,activeCard.getBoundingClientRect().height-COMPACT_HEIGHT):0;
  if(activeCard && allCards.indexOf(activeCard)<allCards.indexOf(first))feedOrigin-=activeExtra;
  baseline=allCards.map((card,index)=>index*(COMPACT_HEIGHT+CARD_GAP));
}
function updateActiveCard(){
  ticking=false;
  if(repositioning||performance.now()<manualLockUntil)return;
  const center=window.innerHeight/2;
  if(!activeCard){
    const candidate=cards.find(card=>card.getBoundingClientRect().top+COMPACT_HEIGHT/2<=center);
    if(candidate)setActive(candidate);
    return;
  }
  const index=cards.indexOf(activeCard);
  const next=cards[index+1];
  const previous=cards[index-1];
  // Advance only when the next compact card reaches the fixed center line.
  if(next&&next.getBoundingClientRect().top+COMPACT_HEIGHT/2<=center){setActive(next);return}
  // Reverse only after the current card's top has crossed below the same line.
  if(activeCard.getBoundingClientRect().top>center){
    setActive(previous||null);
  }
}
function schedule(){
  if(repositioning)return;
  lastUserScrollY=window.scrollY;
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
setCardSizes();syncExpandedState();measureFeed();
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',()=>{setCardSizes();measureFeed();schedule()},{passive:true});
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
