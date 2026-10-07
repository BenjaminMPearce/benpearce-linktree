const cards=[...document.querySelectorAll('.media-card:not(.static-card)')];
const filters=[...document.querySelectorAll('.filter')];

let activeCard=null;
let ticking=false;

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

  const viewportCenter=window.innerHeight*0.5;
  let best=null;
  let bestDistance=Infinity;

  for(const card of visible){
    const rect=card.getBoundingClientRect();
    if(rect.bottom<0||rect.top>window.innerHeight)continue;
    const cardCenter=rect.top+Math.min(rect.height,180)*0.5;
    const distance=Math.abs(cardCenter-viewportCenter);
    if(distance<bestDistance){
      bestDistance=distance;
      best=card;
    }
  }

  if(best)setActive(best);
}

function scheduleActiveCard(){
  if(ticking)return;
  ticking=true;
  requestAnimationFrame(chooseActiveCard);
}

addEventListener('scroll',scheduleActiveCard,{passive:true});
addEventListener('resize',scheduleActiveCard,{passive:true});

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
    scheduleActiveCard();
  });
});

requestAnimationFrame(chooseActiveCard);

if('serviceWorker' in navigator){
  addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
