const cards=[...document.querySelectorAll('.media-card:not(.static-card)')];
const filters=[...document.querySelectorAll('.filter')];
const shareButton=document.getElementById('shareProfile');
const shareStatus=document.getElementById('shareStatus');

let activeCard=null;
let ticking=false;

function setCardSizes(){
  document.querySelectorAll('.media-card').forEach(card=>{
    card.style.setProperty('--square-size',Math.round(card.getBoundingClientRect().width)+'px');
  });
}

function loadMedia(card){
  const iframe=card?.querySelector('iframe[data-src]');
  if(!iframe||iframe.src)return;
  iframe.src=iframe.dataset.src;
  iframe.addEventListener('load',()=>card.classList.add('media-loaded'),{once:true});
}

function stopMedia(card){
  const iframe=card?.querySelector('iframe.media-embed');
  if(!iframe||!iframe.src)return;
  const src=iframe.dataset.src;
  iframe.removeAttribute('src');
  card.classList.remove('media-loaded');
  requestAnimationFrame(()=>{iframe.dataset.src=src});
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
  if(previous){
    previous.classList.remove('active');
    stopMedia(previous);
  }
  activeCard=card||null;
  if(activeCard){
    activeCard.classList.add('active');
    loadMedia(activeCard);
  }
  syncExpandedState();
}

function updateActiveCard(){
  ticking=false;
  const visible=cards.filter(card=>!card.hidden);
  if(!visible.length){setActive(null);return;}

  const line=window.innerHeight*0.50;
  let candidate=null;

  for(const card of visible){
    const top=card.getBoundingClientRect().top;
    if(top<=line)candidate=card;
    else break;
  }

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
    setActive(activeCard===card?null:card);
  };

  compact.addEventListener('click',toggle);
  compact.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){
      event.preventDefault();
      toggle();
    }
  });
});

setCardSizes();
syncExpandedState();
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',()=>{setCardSizes();schedule()},{passive:true});

filters.forEach(button=>{
  button.addEventListener('click',()=>{
    const filter=button.dataset.filter;
    filters.forEach(item=>item.classList.toggle('active',item===button));

    document.querySelectorAll('.media-card').forEach(card=>{
      const categories=(card.dataset.categories||'').split(' ');
      card.hidden=filter!=='all'&&!categories.includes(filter);
      if(card.hidden)card.classList.remove('active');
    });

    activeCard=null;
    syncExpandedState();
    requestAnimationFrame(()=>{setCardSizes();updateActiveCard()});
  });
});

if(shareButton){
  shareButton.addEventListener('click',async()=>{
    const shareData={
      title:'Benjamin Pearce',
      text:"Benjamin Pearce — films, reviews, sketches and production work.",
      url:location.href
    };

    try{
      if(navigator.share){
        await navigator.share(shareData);
        if(shareStatus)shareStatus.textContent='';
      }else{
        await navigator.clipboard.writeText(location.href);
        if(shareStatus)shareStatus.textContent='Link copied.';
        setTimeout(()=>{if(shareStatus)shareStatus.textContent=''},1800);
      }
    }catch(error){
      if(error?.name!=='AbortError'&&shareStatus){
        shareStatus.textContent='Could not share this link.';
        setTimeout(()=>{if(shareStatus)shareStatus.textContent=''},1800);
      }
    }
  });
}

requestAnimationFrame(updateActiveCard);

if('serviceWorker' in navigator){
  addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
