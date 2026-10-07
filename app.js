const cards=[...document.querySelectorAll('.media-card:not(.static-card)')];
const filters=[...document.querySelectorAll('.filter')];

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
}

function updateActiveCard(){
  ticking=false;
  const visible=cards.filter(card=>!card.hidden);
  if(!visible.length){setActive(null);return;}

  const line=window.innerHeight*0.50;
  let candidate=null;

  // The card opens exactly when its TOP edge reaches the screen midpoint.
  // Using the top edge keeps the trigger stable even while the card changes height.
  for(const card of visible){
    const top=card.getBoundingClientRect().top;
    if(top<=line) candidate=card;
    else break;
  }

  setActive(candidate);
}

function schedule(){
  if(ticking)return;
  ticking=true;
  requestAnimationFrame(updateActiveCard);
}

setCardSizes();
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
    requestAnimationFrame(()=>{setCardSizes();updateActiveCard()});
  });
});

requestAnimationFrame(updateActiveCard);

if('serviceWorker' in navigator){
  addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
