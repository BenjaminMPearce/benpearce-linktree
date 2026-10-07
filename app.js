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

function updateActiveCard(){
  ticking=false;

  const visible=cards.filter(card=>!card.hidden);
  if(!visible.length){setActive(null);return;}

  const mobile=window.matchMedia('(max-width:680px)').matches;
  const target=window.innerHeight*(mobile?0.66:0.58);
  const band=mobile?92:118;

  let best=null;
  let distance=Infinity;

  for(const card of visible){
    const rect=card.getBoundingClientRect();
    const center=rect.top+Math.min(rect.height,mobile?92:102)/2;
    const d=Math.abs(center-target);
    if(d<distance){distance=d;best=card;}
  }

  setActive(distance<=band?best:null);
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
