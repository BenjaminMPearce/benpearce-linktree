const cards=[...document.querySelectorAll('.media-card:not(.static-card)')];
const filters=[...document.querySelectorAll('.filter')];

let activeCard=null;

function setActive(card){
  if(activeCard===card)return;
  cards.forEach(c=>c.classList.toggle('active',c===card));
  activeCard=card;
}

const observer=new IntersectionObserver(entries=>{
  const visible=entries
    .filter(entry=>entry.isIntersecting && !entry.target.hidden)
    .sort((a,b)=>b.intersectionRatio-a.intersectionRatio);
  if(visible[0] && visible[0].intersectionRatio>=0.5)setActive(visible[0].target);
},{
  root:null,
  threshold:[0.25,0.5,0.65,0.8],
  rootMargin:'-18% 0px -18% 0px'
});

cards.forEach(card=>observer.observe(card));

filters.forEach(button=>{
  button.addEventListener('click',()=>{
    const filter=button.dataset.filter;
    filters.forEach(b=>b.classList.toggle('active',b===button));

    document.querySelectorAll('.media-card').forEach(card=>{
      const categories=(card.dataset.categories||'').split(' ');
      card.hidden=filter!=='all' && !categories.includes(filter);
      if(card.hidden)card.classList.remove('active');
    });

    activeCard=null;
    const firstVisible=cards.find(card=>!card.hidden);
    if(firstVisible)setTimeout(()=>setActive(firstVisible),60);
  });
});

const firstVisible=cards.find(card=>!card.hidden);
if(firstVisible)setTimeout(()=>setActive(firstVisible),250);

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
