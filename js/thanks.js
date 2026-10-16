(() => {
 let sent=0;
 try {sent=Number(sessionStorage.getItem('organiq-request-sent'));}catch(_){}
 if(!Number.isFinite(sent)||sent<=0||Date.now()-sent>3600000)return;
 document.title='Richiesta inoltrata | Organiq';
 document.getElementById('thanksLabel').textContent='Richiesta inoltrata';
 document.getElementById('thanksTitle').textContent='Grazie! Ti rispondiamo entro due giorni lavorativi.';
 document.getElementById('thanksText').textContent='La richiesta è stata inoltrata. Leggeremo le informazioni che hai inviato e ti risponderemo via email.';
})();
