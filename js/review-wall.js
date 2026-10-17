(() => {
  const section=document.querySelector('.client-reviews');
  if(!section)return;
  const wall=section.querySelector('.review-wall');
  const plane=section.querySelector('.review-plane');
  const cards=[...plane.querySelectorAll('.review-card')];
  const allButton=section.querySelector('.review-all');
  const dialog=section.querySelector('dialog');
  const dialogTitle=dialog.querySelector('h3');
  const dialogBody=dialog.querySelector('.review-dialog-body');
  const close=dialog.querySelector('.review-dialog-close');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const desktop=matchMedia('(min-width:701px) and (hover:hover) and (pointer:fine)');
  let lastTrigger;
  const records=new Map(cards.map(card=>[card.dataset.reviewId,{name:card.querySelector('.review-author').textContent,text:card.querySelector('blockquote').textContent}]));
  for(let c=0;c<3;c++){
    const col=document.createElement('div');col.className='review-column';
    const track=document.createElement('div');track.className='review-track';
    track.style.setProperty('--review-duration',(56+c*7)+'s');track.style.setProperty('--review-delay',(-c*9-8)+'s');
    const group=document.createElement('div');group.className='review-group';
    cards.filter((_,i)=>i%3===c).forEach(card=>group.append(card));
    const copy=group.cloneNode(true);copy.setAttribute('aria-hidden','true');
    copy.querySelectorAll('button').forEach(button=>button.tabIndex=-1);
    track.append(group,copy);col.append(track);plane.append(col);
  }
  function openReviews(ids,trigger){
    lastTrigger=trigger;dialogBody.replaceChildren();
    dialogTitle.textContent=ids.length===1?records.get(ids[0]).name:'Le parole dei nostri clienti';
    ids.forEach(id=>{
      const record=records.get(id),item=document.createElement('div');item.className='review-dialog-item';
      if(ids.length>1){const author=document.createElement('h4');author.textContent=record.name;item.append(author);}
      const quote=document.createElement('blockquote');quote.textContent=record.text;item.append(quote);dialogBody.append(item);
    });
    wall.classList.add('is-dialog-open');dialog.showModal();close.focus();
  }
  section.addEventListener('click',event=>{
    const button=event.target.closest('.review-read');
    if(button)openReviews([button.closest('.review-card').dataset.reviewId],button);
  });
  allButton.addEventListener('click',()=>openReviews([...records.keys()],allButton));
  close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{wall.classList.remove('is-dialog-open');lastTrigger?.focus({preventScroll:true});});
  wall.addEventListener('pointermove',event=>{
    if(reduced.matches||!desktop.matches)return;
    const r=wall.getBoundingClientRect(),x=(event.clientX-r.left)/r.width-.5,y=(event.clientY-r.top)/r.height-.5;
    plane.style.transform=`translate(-50%,-50%) rotateX(${12-y*3}deg) rotateY(${-9+x*4}deg) translateZ(-50px)`;
  });
  wall.addEventListener('pointerleave',()=>{plane.style.transform='';});
  reduced.addEventListener('change',()=>{plane.style.transform='';});
  new IntersectionObserver(entries=>wall.classList.toggle('is-away',!entries[0].isIntersecting)).observe(wall);
})();
