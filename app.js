const cards=[...document.querySelectorAll('.media-card:not(.static-card)')];
const shareButton=document.getElementById('shareProfile');
const shareStatus=document.getElementById('shareStatus');
const positions=new WeakMap();
const visited=new WeakSet();
let active=null;
let settleTimer=null;
const ratios=new Map();
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
function playlist(card){return(card.dataset.playlist||'').split(',').filter(Boolean)}
function stop(card){
  if(!card)return;
  const iframe=card.querySelector('iframe.media-embed');
  if(iframe)iframe.removeAttribute('src');
  card.classList.remove('loading','media-loaded','playing');
}
function load(card,advance=false){
  const list=playlist(card);
  if(!list.length)return;
  let index=positions.get(card)||0;
  if(advance)index=(index+1)%list.length;
  positions.set(card,index);
  const iframe=card.querySelector('iframe.media-embed');
  if(!iframe)return;
  card.classList.add('loading','playing');
  card.classList.remove('media-loaded');
  iframe.onload=()=>{card.classList.remove('loading');card.classList.add('media-loaded')};
  if(card.dataset.source==='tiktok'){
    const id=list[index];
    const url='https://www.tiktok.com/@bennyp1010/video/'+id;
    card.querySelectorAll('.tiktok-watch').forEach(a=>a.href=url);
    const episode=card.querySelector('.tiktok-episode');
    if(episode)episode.textContent='Episode '+(index+1)+' of '+list.length;
    iframe.src='https://www.tiktok.com/player/v1/'+id+'?autoplay=1&muted=1&controls=1&description=0&music_info=0';
  }else{
    iframe.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(list[index])+'?autoplay=1&mute=1&playsinline=1&controls=1&rel=0';
  }
}
function select(card){
  if(card===active)return;
  stop(active);
  active=card;
  if(active){
    const advance=visited.has(active);
    visited.add(active);
    load(active,advance);
  }
}
function visibleFraction(card){
  const rect=card.getBoundingClientRect();
  const view=window.visualViewport;
  const top=view?view.offsetTop:0;
  const bottom=top+(view?view.height:window.innerHeight);
  return Math.max(0,Math.min(rect.bottom,bottom)-Math.max(rect.top,top))/Math.max(rect.height,1);
}
function choose(){
  if(document.hidden){select(null);return}
  let best=null,bestRatio=0;
  cards.forEach(card=>{
    const ratio=visibleFraction(card);
    if(ratio>bestRatio){bestRatio=ratio;best=card}
  });
  if(bestRatio<.55){select(null);return}
  // Avoid switching for tiny changes in visibility.
  if(active&&visibleFraction(active)>.46&&best!==active&&bestRatio-visibleFraction(active)<.16)return;
  select(best);
}
function schedule(){clearTimeout(settleTimer);settleTimer=setTimeout(choose,260)}
const observer=new IntersectionObserver(schedule,{threshold:[0,.25,.45,.55,.7,.85,1]});
cards.forEach(card=>{
  observer.observe(card);
  card.querySelector('.next-video')?.addEventListener('click',()=>{
    if(active!==card){select(card)}else{stop(card);load(card,true)}
  });
});
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',schedule,{passive:true});
if(window.visualViewport){
  window.visualViewport.addEventListener('resize',schedule,{passive:true});
  window.visualViewport.addEventListener('scroll',schedule,{passive:true});
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)select(null);else schedule()});
requestAnimationFrame(schedule);
if(shareButton)shareButton.addEventListener('click',async()=>{
  const shareData={title:'Benjamin Pearce',text:'Benjamin Pearce — films, reviews, sketches and production work.',url:location.href};
  try{
    if(navigator.share)await navigator.share(shareData);
    else{await navigator.clipboard.writeText(location.href);if(shareStatus)shareStatus.textContent='Link copied.'}
  }catch(error){if(error?.name!=='AbortError'&&shareStatus)shareStatus.textContent='Could not share this link.'}
  setTimeout(()=>{if(shareStatus)shareStatus.textContent=''},1800);
});
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
