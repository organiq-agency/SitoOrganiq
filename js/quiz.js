/* Eight questions, a contextual priority and two supporting suggestions. */
(function(){
 'use strict';
 var model=window.OrganiqCheckup;
 if(!model)return;
 var QUESTIONS=model.questions, current=0, answers=[], customTexts={}, lastResult;
 var $=function(id){return document.getElementById(id);};
 var quizBox=$('quizBox'),result=$('result'),options=$('options'),back=$('backBtn');
 function render(){
  var q=QUESTIONS[current];quizBox.hidden=false;result.hidden=true;
  $('progressBar').style.width=(current/QUESTIONS.length*100)+'%';$('progress').setAttribute('aria-valuenow',String(Math.round(current/QUESTIONS.length*100)));
  $('stepLabel').textContent='Domanda '+(current+1)+' di '+QUESTIONS.length;
  $('questionText').textContent=q.q;$('questionHint').textContent=q.hint;back.hidden=current===0;
  quizBox.querySelector('.quiz-offer').hidden=current>0;
  options.replaceChildren();
  q.options.forEach(function(opt,i){
   var btn=document.createElement('button');btn.type='button';btn.className='quiz-opt';
   var key=document.createElement('span');key.className='opt-key';key.textContent='ABCDEF'[i];
   var label=document.createElement('span');label.textContent=opt.label;btn.append(key,label);
   if(answers[current]===i)btn.setAttribute('aria-pressed','true');
   btn.addEventListener('click',function(){if(opt.custom){customInput(i);return;}answers[current]=i;delete customTexts[current];advance();});options.append(btn);
  });
  if(current>0){$('questionText').setAttribute('tabindex','-1');$('questionText').focus({preventScroll:true});}
  quizBox.classList.remove('quiz-fade');void quizBox.offsetWidth;quizBox.classList.add('quiz-fade');
  window.scrollTo({top:0,behavior:'instant'});
 }
 function advance(){if(current<QUESTIONS.length-1){current++;render();}else showResult();}
 function customInput(i){
  options.innerHTML='<div class="quiz-custom"><label for="customInput">Come descriveresti la tua attività?</label><input type="text" id="customInput" maxlength="80" autocomplete="off" placeholder="Es. palestra, studio legale, agriturismo"><div class="quiz-custom-actions"><button type="button" class="btn btn-primary" id="customGo" disabled>Continua</button><button type="button" class="quiz-back" id="customCancel">Torna alle opzioni</button></div></div>';
  var input=$('customInput'),go=$('customGo');input.value=customTexts[current]||'';go.disabled=input.value.trim().length<2;input.focus();
  input.addEventListener('input',function(){go.disabled=input.value.trim().length<2;});
  input.addEventListener('keydown',function(e){if(e.key==='Enter'&&!go.disabled){e.preventDefault();go.click();}});
  go.addEventListener('click',function(){answers[current]=i;customTexts[current]=input.value.trim();advance();});
  $('customCancel').addEventListener('click',render);
 }
 function showResult(){
  lastResult=model.derive(answers,customTexts);quizBox.hidden=true;result.hidden=false;
  $('progressBar').style.width='100%';$('progress').setAttribute('aria-valuenow','100');
  $('profileBadge').textContent=lastResult.profile.badge;$('profileTitle').textContent=lastResult.profile.title;
  $('profileDesc').textContent='La tua priorità: '+lastResult.goal.toLowerCase()+'. '+lastResult.profile.desc;
  var list=$('tipsList');list.replaceChildren();
  lastResult.tips.forEach(function(t){var row=document.createElement('div');row.className='tip';var content=document.createElement('div');
   var eyebrow=document.createElement('span');eyebrow.className='tip-label';eyebrow.textContent=t.label;
   var title=document.createElement('strong');title.textContent=t.title;var text=document.createElement('p');text.textContent=t.text;
   content.append(eyebrow,title,text);row.append(content);list.append(row);
  });
  var review=$('answerReview');review.replaceChildren();lastResult.summary.forEach(function(a){var li=document.createElement('li');var title=document.createElement('strong');title.textContent=a.question;var text=document.createElement('span');text.textContent=a.answer;li.append(title,text);review.append(li);});
  $('fProfile').value=lastResult.profile.badge;$('fAnswers').value=lastResult.summary.map(function(a){return a.question+' → '+a.answer;}).join(' | ');
  $('fAdvice').value=summaryText();
  var box=$('leadBox');box.querySelector('h3').textContent=lastResult.alternative?'Guardiamo insieme i tuoi canali attuali.':'Vuoi anche il parere del nostro team?';
  box.querySelector('p').textContent='Il risultato automatico è già qui sopra. Se vuoi un confronto sul tuo profilo, lasciaci i contatti e, se disponibile, il link. Ti rispondiamo entro due giorni lavorativi per organizzare l’analisi gratuita.';
  $('copyFeedback').textContent='';$('copyFallback').hidden=true;window.scrollTo({top:0,behavior:'instant'});
  $('profileTitle').setAttribute('tabindex','-1');$('profileTitle').focus({preventScroll:true});
 }
 function summaryText(){return 'CHECK-UP SOCIAL ORGANIQ\n'+lastResult.profile.title+'\nObiettivo: '+lastResult.goal+'\n\n'+lastResult.tips.map(function(t){return t.label.toUpperCase()+'\n'+t.title+'\n'+t.text;}).join('\n\n')+'\n\nIndicazioni basate sulle risposte al questionario. Il test non visita i tuoi profili.\nhttps://organiq-agency.it/';}
 back.addEventListener('click',function(){if(current>0){current--;render();}});
 $('restartBtn').addEventListener('click',function(){current=0;answers=[];customTexts={};render();});
 $('copyTips').addEventListener('click',async function(){
  try{await navigator.clipboard.writeText(summaryText());$('copyFeedback').textContent='Consigli copiati. Puoi incollarli dove preferisci.';}
  catch(_){var field=$('copyFallback');field.hidden=false;field.value=summaryText();field.focus();field.select();$('copyFeedback').textContent='Seleziona e copia il testo qui sotto.';}
 });
 $('downloadTips').addEventListener('click',function(){
  var url=URL.createObjectURL(new Blob([summaryText()],{type:'text/plain;charset=utf-8'}));var a=document.createElement('a');a.href=url;a.download='organiq-consigli-social.txt';document.body.append(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);$('copyFeedback').textContent='Il file con i consigli è pronto per essere salvato.';
 });
 render();
})();
