/* FormSubmit AJAX keeps the request visible if sending cannot be confirmed.
   API reference: https://formsubmit.co/ajax-documentation */
(() => {
  document.querySelectorAll('#contactForm, #leadForm').forEach(form => {
    const button=form.querySelector('button[type="submit"]');
    const feedback=form.querySelector('.form-feedback');
    let sending=false;
    form.addEventListener('submit',async event => {
      event.preventDefault();
      if(sending || !form.reportValidity())return;
      const action=new URL(form.action);
      if(action.origin!=='https://formsubmit.co')return;
      const values=Object.fromEntries(new FormData(form));
      const email=form.querySelector('input[type="email"]');
      if(email)values._replyto=email.value;
      delete values._next;
      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),20000);
      const original=button.innerHTML;
      sending=true;button.disabled=true;button.textContent='Invio in corso…';
      form.setAttribute('aria-busy','true');feedback.hidden=false;feedback.classList.remove('is-error');feedback.textContent='Stiamo inviando la richiesta.';
      try {
        const response=await fetch('https://formsubmit.co/ajax'+action.pathname,{
          method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
          body:JSON.stringify(values),signal:controller.signal
        });
        const data=await response.json();
        if(!response.ok || (data.success!==true && data.success!=='true'))throw new Error('Not confirmed');
        feedback.textContent='Richiesta inoltrata. Ti rispondiamo entro due giorni lavorativi.';
        try {sessionStorage.setItem('organiq-request-sent',String(Date.now()));location.assign('grazie.html');}
        catch(_) {button.textContent='Richiesta inoltrata';}
      } catch(_) {
        feedback.classList.add('is-error');feedback.replaceChildren();
        feedback.append('Non siamo riusciti a confermare l’invio. I dati sono ancora qui: puoi riprovare oppure scriverci a ');
        const link=document.createElement('a');link.href='mailto:organiqsocialagency@gmail.com';link.textContent='organiqsocialagency@gmail.com';feedback.append(link,'.');
        button.disabled=false;button.innerHTML=original;sending=false;feedback.focus();
      } finally {clearTimeout(timeout);form.removeAttribute('aria-busy');}
    });
  });
})();
