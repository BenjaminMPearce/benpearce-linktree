const cards=[...document.querySelectorAll('.media-card:not(.static-card)')];
const filters=[...document.querySelectorAll('.filter')];

let activeCard=null;
let ticking=false;

function setCardSizes(){
  document.querySelectorAll('.media-card').forEach(card=>{
    card.style.setProperty('--square-size',Math.round(card.getBoundingClientRect().width)+'px');
  });
}

function setActive(card){
  if(activeCard===card)return;
  if(activeCard)activeCard.classList.remove('active');
  if(card)card.classList.add('active');
  activeCard=card||null;
}

function chooseActiveCard(){
  ticking=false;
  const visible=cards.filter(card=>!card.hidden);
  if(!visible.length){setActive(null);return;}

  const trigger=window.innerHeight*0.48;
  let containing=null;
  let nearest=null;
  let nearestDistance=Infinity;

  for(const card of visible){
    const rect=card.getBoundingClientRect();
    if(rect.top<=trigger&&rect.bottom>=trigger){
      containing=card;
      break;
    }
    const distance=Math.min(Math.abs(rect.top-trigger),Math.abs(rect.bottom-trigger));
    if(distance<nearestDistance){
      nearestDistance=distance;
      nearest=card;
    }
  }

  setActive(containing||nearest);
}

function schedule(){
  if(ticking)return;
  ticking=true;
  requestAnimationFrame(chooseActiveCard);
}

setCardSizes();
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',()=>{
  setCardSizes();
  schedule();
},{passive:true});

filters.forEach(button=>{
  button.addEventListener('click',()=>{
    const filter=button.dataset.filter;
    filters.forEach(b=>b.classList.toggle('active',b===button));

    document.querySelectorAll('.media-card').forEach(card=>{
      const categories=(card.dataset.categories||'').split(' ');
      card.hidden=filter!=='all'&&!categories.includes(filter);
      if(card.hidden)card.classList.remove('active');
    });

    activeCard=null;
    requestAnimationFrame(()=>{
      setCardSizes();
      chooseActiveCard();
    });
  });
});

requestAnimationFrame(chooseActiveCard);

if('serviceWorker' in navigator){
  addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
