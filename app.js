const cards=[...document.querySelectorAll('.media-card:not(.static-card)')];
const allCards=[...document.querySelectorAll('.media-card')];
const filters=[...document.querySelectorAll('.filter')];
const shareButton=document.getElementById('shareProfile');
const shareStatus=document.getElementById('shareStatus');
const resultCount=document.getElementById('resultCount');
const emptyState=document.getElementById('emptyState');
const mobileDock=document.querySelector('.mobile-dock');
const feedHint=document.getElementById('feedHint');

let activeCard=null;
let ticking=false;
let feedHintDismissed=false;
let manualLockUntil=0;

function setCardSizes(){
  allCards.forEach(card=>card.style.setProperty('--square-size',Math.round(card.getBoundingClientRect().width)+'px'));
}
function updateResultCount(){
  const visible=allCards.filter(card=>!card.hidden).length;
  if(resultCount)resultCount.textContent=visible+` link${visible===1?'':'s'}`;
  if(emptyState)emptyState.hidden=visible!==0;
}
function loadMedia(card){
  const iframe=card?.querySelector('iframe[data-src]');
  if(!iframe||iframe.src)return;
  card.classList.add('loading');
  iframe.src=iframe.dataset.src;
  const done=()=>{card.classList.remove('loading');card.classList.add('media-loaded')};
  iframe.addEventListener('load',done,{once:true});
  setTimeout(()=>card.classList.remove('loading'),5000);
}
function stopMedia(card){
  const iframe=card?.querySelector('iframe.media-embed');
  if(!iframe||!iframe.src)return;
  const src=iframe.dataset.src;
  iframe.removeAttribute('src');
  card.classList.remove('loading','media-loaded');
  requestAnimationFrame(()=>iframe.dataset.src=src);
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
  if(activeCard){activeCard.classList.add('active');loadMedia(activeCard)}
  syncExpandedState();
}
function updateActiveCard(){
  ticking=false;
  if(performance.now()<manualLockUntil)return;
  const visible=cards.filter(card=>!card.hidden);
  if(!visible.length){setActive(null);return}
  const line=window.innerHeight*.5;
  let candidate=null;
  for(const card of visible){
    const rect=card.getBoundingClientRect();
    // Stable crossing: the compact card's top edge owns the midpoint until the next card crosses it.
    if(rect.top<=line)candidate=card;
    else break;
  }
  setActive(candidate);
}
function schedule(){
  if(!feedHintDismissed&&window.scrollY>120){feedHintDismissed=true;feedHint?.classList.add('hidden')}
  if(ticking)return;
  ticking=true;
  requestAnimationFrame(updateActiveCard);
}
cards.forEach(card=>{
  const compact=card.querySelector('.card-compact[role="button"]');
  if(!compact)return;
  const toggle=()=>{
    manualLockUntil=performance.now()+700;
    setActive(activeCard===card?null:card);
  };
  compact.addEventListener('click',toggle);
  compact.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){event.preventDefault();toggle()}
  });
});
setCardSizes();syncExpandedState();updateResultCount();
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',()=>{setCardSizes();schedule()},{passive:true});
filters.forEach(button=>button.addEventListener('click',()=>{
  const filter=button.dataset.filter;
  filters.forEach(item=>item.classList.toggle('active',item===button));
  allCards.forEach(card=>{
    const categories=(card.dataset.categories||'').split(' ');
    const universal=card.classList.contains('static-card');
    card.hidden=filter!=='all'&&!universal&&!categories.includes(filter);
    if(card.hidden)card.classList.remove('active');
  });
  if(activeCard?.hidden)activeCard=null;
  updateResultCount();
  manualLockUntil=performance.now()+250;
  requestAnimationFrame(()=>{setCardSizes();updateActiveCard()});
}));
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
  if(button.dataset.dock==='browse')document.querySelector('.filter-label-row')?.scrollIntoView({behavior:'smooth',block:'start'});
  if(button.dataset.dock==='share')shareButton?.click();
});
requestAnimationFrame(updateActiveCard);
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
