const cards=[...document.querySelectorAll('.media-card:not(.static-card)')];
const filters=[...document.querySelectorAll('.filter')];

let activeCard=null;
let ticking=false;
let lastY=window.scrollY;
let direction=1;

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
  const y=window.scrollY;
  direction=y>=lastY?1:-1;
  lastY=y;

  const visible=cards.filter(card=>!card.hidden);
  if(!visible.length){setActive(null);return;}

  const trigger=window.innerHeight*0.46;
  const hysteresis=56;

  if(activeCard&&!activeCard.hidden){
    const index=visible.indexOf(activeCard);
    const current=activeCard.getBoundingClientRect();

    if(direction>0){
      const next=visible[index+1];
      if(next&&next.getBoundingClientRect().top<=trigger-hysteresis){setActive(next);return;}
      if(current.bottom>trigger+hysteresis)return;
    }else{
      const prev=visible[index-1];
      if(prev&&prev.getBoundingClientRect().bottom>=trigger+hysteresis){setActive(prev);return;}
      if(current.top<trigger-hysteresis)return;
    }
  }

  let best=visible[0];
  let bestDistance=Infinity;
  for(const card of visible){
    const rect=card.getBoundingClientRect();
    const compactCenter=rect.top+Math.min(rect.height,108)/2;
    const distance=Math.abs(compactCenter-trigger);
    if(distance<bestDistance){bestDistance=distance;best=card;}
  }
  setActive(best);
}

function schedule(){
  if(ticking)return;
  ticking=true;
  requestAnimationFrame(chooseActiveCard);
}

setCardSizes();
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',()=>{setCardSizes();schedule()},{passive:true});

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
    requestAnimationFrame(()=>{setCardSizes();chooseActiveCard()});
  });
});

requestAnimationFrame(chooseActiveCard);

if('serviceWorker' in navigator){
  addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
