const cards=[...document.querySelectorAll('.media-card:not(.static-card)')];
const shareButton=document.getElementById('shareProfile');
const shareStatus=document.getElementById('shareStatus');
const positions=new WeakMap();
let active=null;
let settleTimer=null;
function playlist(card){return(card.dataset.playlist||'').split(',').filter(Boolean)}
function stop(card){
  if(!card)return;
  const iframe=card.querySelector('iframe.media-embed');
  if(iframe){iframe.onload=null;iframe.style.visibility='hidden';iframe.removeAttribute('src');}
  card.classList.remove('loading','media-loaded','playing');
}
function load(card,advance=false){
  const list=playlist(card);
  if(!list.length)return;
  let index=positions.get(card)||0;
  if(advance)index=(index+1)%list.length;
  positions.set(card,index);
  const counter=card.querySelector('.video-counter');
  if(counter)counter.textContent=String(index+1).padStart(2,'0')+' / '+String(list.length).padStart(2,'0');
  const iframe=card.querySelector('iframe.media-embed');
  if(!iframe)return;
  iframe.style.visibility='hidden';
  card.classList.add('loading','playing');
  card.classList.remove('media-loaded');
  iframe.onload=()=>{if(active===card&&card.classList.contains('playing')){iframe.style.visibility='visible';card.classList.remove('loading');card.classList.add('media-loaded')}};
  if(card.dataset.source==='tiktok'){
    const id=list[index];
    const url='https://www.tiktok.com/@bennyp1010/video/'+id;
    card.querySelectorAll('.tiktok-watch').forEach(a=>a.href=url);
    const episode=card.querySelector('.tiktok-episode');
    if(episode)episode.textContent='Episode '+(index+1)+' of '+list.length;
    iframe.src='https://www.tiktok.com/player/v1/'+id+'?autoplay=1&muted=1&controls=1&description=0&music_info=0';
  }else{
    const videoUrl='https://www.youtube.com/watch?v='+encodeURIComponent(list[index]);
    card.querySelectorAll('.visit-button').forEach(a=>a.href=videoUrl);
    iframe.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(list[index])+'?autoplay=1&mute=1&playsinline=1&controls=1&rel=0';
  }
}
function select(card){
  if(card===active)return;
  stop(active);
  active=card;
  if(active){load(active);}
}
function visibleFraction(card){
  // Measure the actual video window, not the whole card including text and buttons.
  const target=card.querySelector('.preview-frame')||card;
  const rect=target.getBoundingClientRect();
  const view=window.visualViewport;
  const top=view?view.offsetTop:0;
  const bottom=top+(view?view.height:window.innerHeight);
  const visible=Math.max(0,Math.min(rect.bottom,bottom)-Math.max(rect.top,top));
  return visible/Math.max(Math.min(rect.height,bottom-top),1);
}
// Start when the preview enters the viewing area, and switch to the next visible preview.
let scrollTimer;
function checkPlaybackVisibility(){
  if(!active)return;
  if(document.hidden||visibleFraction(active)<.08){stop(active);active=null;}
}
function schedule(){clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{checkPlaybackVisibility();chooseAutoplay()},130)}
function chooseAutoplay(){
  if(document.hidden)return;
  let best=null,score=0;
  cards.forEach(card=>{const n=visibleFraction(card);if(n>score){best=card;score=n}});
  if(!best||score<.30)return;
  if(active===best)return;
  if(active&&visibleFraction(active)>.38&&score<visibleFraction(active)+.18)return;
  select(best);
}
cards.forEach(card=>{
  const play=card.querySelector('.preview-play');
  play?.addEventListener('click',()=>{if(active===card)return;select(card)});
  const counter=card.querySelector('.video-counter');
  const list=playlist(card);
  if(counter)counter.textContent='01 / '+String(list.length).padStart(2,'0');
  card.querySelector('.next-video')?.addEventListener('click',()=>{
    if(active!==card){select(card);return;}
    stop(card);load(card,true);
  });
});
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',schedule,{passive:true});
if(window.visualViewport){window.visualViewport.addEventListener('resize',schedule,{passive:true});window.visualViewport.addEventListener('scroll',schedule,{passive:true})}
document.addEventListener('visibilitychange',()=>{checkPlaybackVisibility();if(!document.hidden)schedule()});
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
