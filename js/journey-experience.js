(function(){
  var scenes=document.querySelectorAll('.journey-scene');
  if(!scenes.length)return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window)){
    scenes.forEach(function(scene){scene.classList.add('scene-active')});
    return;
  }
  var observer=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){entry.target.classList.toggle('scene-active',entry.isIntersecting)});
  },{threshold:.22});
  scenes.forEach(function(scene){observer.observe(scene)});
})();
