/* Shared, deterministic content model: no prediction or numerical score. */
(function (root, factory) {
  var model = factory();
  if (typeof module === 'object' && module.exports) module.exports = model;
  else root.OrganiqCheckup = model;
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';
  var questions = [
    {id:'business', q:'Di cosa si occupa la tua attività?', hint:'Ci aiuta a capire il contesto in cui lavori.', options:[
      {label:'Ristorazione e alimentazione',tag:'food'}, {label:'Negozio o attività locale',tag:'local'},
      {label:'Vendita di prodotti online',tag:'shop'}, {label:'Servizi o libera professione',tag:'services'},
      {label:'Personal brand o creator',tag:'creator'}, {label:'Altro (scrivilo tu)',tag:'other',custom:true}]},
    {id:'audience',q:'A chi vuoi rivolgerti soprattutto?',hint:'Pensa al pubblico principale del tuo prossimo progetto.',options:[
      {label:'Privati della mia zona',tag:'local-public'}, {label:'Privati, anche fuori dalla mia zona',tag:'broad-public'},
      {label:'Aziende e professionisti',tag:'b2b'}, {label:'Un pubblico ancora da definire',tag:'undefined-public'}]},
    {id:'current',q:'Come pubblichi oggi sui social?',hint:'Scegli la situazione che ti descrive meglio.',options:[
      {label:'Non ho ancora iniziato, o pubblico molto poco',tag:'starter'}, {label:'Pubblico quando riesco',tag:'irregular'},
      {label:'Pubblico con regolarità, ma non so cosa funziona',tag:'unclear'}, {label:'Ho già contenuti che danno risposte utili',tag:'working'}]},
    {id:'visual',q:'Come puoi far capire il valore di ciò che offri?',hint:'Non serve scegliere tra immagini e competenza: possono lavorare insieme.',options:[
      {label:'Mostrando prodotti, ambienti o lavorazioni',tag:'show'}, {label:'Spiegando il lavoro e rispondendo alle domande',tag:'explain'},
      {label:'In entrambi i modi',tag:'both'}]},
    {id:'channel',q:'Come ti trovano soprattutto i nuovi clienti?',hint:'Se non lo sai ancora, è un buon punto da cui partire.',options:[
      {label:'Passaparola',tag:'word-of-mouth'}, {label:'Google e ricerche online',tag:'search'},
      {label:'Social',tag:'social'}, {label:'Pubblicità a pagamento',tag:'paid'}, {label:'Non lo so ancora',tag:'unknown-source'}]},
    {id:'time',q:'Quanto tempo puoi dedicare ai social ogni settimana?',hint:'Considera idee, riprese, approvazioni e risposte ai messaggi.',options:[
      {label:'Quasi nessuno',tag:'no-time'}, {label:'Una o due ore',tag:'little-time'},
      {label:'Circa mezza giornata',tag:'some-time'}, {label:'C’è già una persona dedicata',tag:'team'}]},
    {id:'competitors',q:'Hai osservato cosa pubblicano i tuoi concorrenti?',hint:'Conta ciò che hai visto nei contenuti, senza stimare il loro fatturato.',options:[
      {label:'Pubblicano più spesso di noi',tag:'more-active'}, {label:'Pubblicano con una frequenza simile',tag:'similar'},
      {label:'Pubblicano meno spesso di noi',tag:'less-active'}, {label:'Non li ho ancora osservati',tag:'not-observed'}]},
    {id:'goal',q:'Qual è la tua priorità per i prossimi mesi?',hint:'Scegline una: il primo consiglio partirà da questo obiettivo.',options:[
      {label:'Ricevere più richieste da potenziali clienti',tag:'enquiries'}, {label:'Farmi conoscere nella mia zona o nicchia',tag:'awareness'},
      {label:'Restare in contatto con chi mi conosce già',tag:'loyalty'}, {label:'Lanciare un nuovo prodotto o servizio',tag:'launch'}]}
  ];
  function derive(answers, custom) {
    custom = custom || {};
    if (!Array.isArray(answers) || answers.length !== questions.length || questions.some(function(q,i){return !Number.isInteger(answers[i]) || !q.options[answers[i]];})) throw new Error('Complete answers are required');
    var selected = questions.map(function(q,i){return q.options[answers[i]];});
    var context = {};
    questions.forEach(function(q,i){context[q.id] = selected[i].tag;});
    var business = selected[0].custom ? (custom[0] || 'la tua attività') : selected[0].label;
    var goal = selected[7].label;
    var profile;
    var alternative = context.channel === 'search' && context.time === 'no-time' && context.current !== 'working';
    if (alternative) profile = {badge:'Parti dai canali attuali',title:'Prima verifica come ti trovano oggi.',desc:'Hai indicato le ricerche online come fonte principale e poco tempo disponibile. Controlla sito, informazioni e contatti prima di aggiungere un impegno sui social.'};
    else if (context.current === 'working') profile = {badge:'Un percorso già avviato',title:'Usa ciò che funziona per il prossimo obiettivo.',desc:'Hai già contenuti che ricevono risposte utili. Puoi partire da quelli per scegliere che cosa continuare, adattare o interrompere.'};
    else if (context.current === 'starter') profile = {badge:'Una base da costruire',title:'Scegli una priorità e un ritmo sostenibile.',desc:'Non serve aprire tutti i canali insieme. Parti da un pubblico, un obiettivo e contenuti che riesci a preparare con continuità.'};
    else profile = {badge:'Un percorso da mettere a fuoco',title:'Prima di pubblicare di più, scegli cosa osservare.',desc:'Hai già iniziato. Il passo utile è collegare temi, calendario e risposte del pubblico all’obiettivo che hai scelto.'};
    var priority;
    if (context.audience === 'undefined-public') priority = {title:'Definisci il pubblico prima del calendario',text:'Hai indicato un pubblico ancora da definire. Per lavorare sull’obiettivo “'+goal.toLowerCase()+'”, descrivi a chi vuoi parlare, quale problema affronta e perché dovrebbe scegliere la tua offerta.'};
    else if (alternative) priority = {title:'Rendi semplice contattarti dai canali attuali',text:'Hai poco tempo e i nuovi clienti arrivano soprattutto dalla ricerca. Controlla che trovino servizi aggiornati, contatti funzionanti e una strada chiara per chiedere informazioni. I social possono essere un supporto, senza diventare subito la priorità.'};
    else if (context.goal === 'launch') priority = {title:'Prepara il percorso verso il lancio',text:'Prima di pubblicare l’annuncio, chiarisci destinatari, offerta, data e modo per chiedere informazioni. Organizza poi una sequenza di contenuti che presenti il bisogno, mostri il prodotto o servizio e risponda alle domande.'};
    else if (context.goal === 'loyalty') priority = {title:'Riparti dalle domande di chi ti conosce',text:'Hai scelto di restare in contatto con il pubblico attuale. Raccogli le domande e le novità utili dopo il primo acquisto o contatto, poi trasformale in appuntamenti ricorrenti. Osserva le conversazioni e i ritorni, non solo le visualizzazioni.'};
    else if (context.goal === 'awareness') priority = {title:context.audience === 'local-public'?'Fai riconoscere la tua attività nella zona':'Scegli un tema per cui farti riconoscere',text:'Hai scelto di farti conoscere. Parti da un tema legato alla tua offerta e ripetilo con esempi diversi. '+(context.audience === 'local-public'?'Mostra anche luogo, persone e informazioni pratiche per chi può raggiungerti.':'Scegli esempi che parlino al pubblico indicato, invece di inseguire ogni tendenza.')};
    else if (context.channel === 'unknown-source') priority = {title:'Inizia a registrare da dove arrivano le richieste',text:'Vuoi più richieste ma non sai ancora come ti trovano. Chiedi a ogni nuovo contatto dove ti ha scoperto e annota la risposta. È il punto di partenza per collegare il lavoro sui contenuti alle conversazioni commerciali.'};
    else priority = {title:'Collega i contenuti a una richiesta precisa',text:'Hai scelto di ricevere più richieste. Controlla che sia chiaro cosa offri, a chi e come contattarti. Usa un invito coerente nei contenuti e annota da dove arrivano i nuovi contatti, prima di attribuirli ai social.'};
    var channels;
    if (context.audience === 'undefined-public') channels = {title:'Scegli il pubblico prima di aggiungere canali',text:'La scelta della piattaforma resta aperta finché non sai chi vuoi raggiungere. Osserva dove il pubblico cerca informazioni e fa domande; poi confronta quel contesto con il tempo che hai a disposizione.'};
    else if (context.audience === 'b2b') channels = {title:'Valuta LinkedIn e i canali che usi già',text:'Hai indicato aziende e professionisti. LinkedIn è un’ipotesi da confrontare con i canali attuali; Instagram può mostrare persone e progetti. Non serve aprire entrambi: verifica dove avvengono conversazioni pertinenti alla tua offerta.'};
    else if (context.audience === 'local-public') channels = {title:'Valuta Instagram e Facebook per il pubblico locale',text:'Per chi può raggiungere la tua attività, confronta Instagram e Facebook con i canali da cui arrivano già i contatti. Tieni aggiornate anche le informazioni che le persone trovano cercandoti online.'};
    else channels = {title:'Valuta Instagram e TikTok con un test sostenibile',text:'Hai indicato un pubblico che non dipende solo dalla zona. Confronta Instagram e TikTok guardando contenuti e domande del tuo settore. Parti da un canale e verifica la risposta del pubblico prima di aggiungere il secondo.'};
    var sectorFormats = {
      food:'Mostra una preparazione, spiega una scelta del menu e rispondi a una domanda frequente sul locale.',
      local:'Mostra un prodotto o un servizio in uso e rispondi alle domande che ricevi in negozio o in sede.',
      shop:'Mostra il prodotto in uso, chiarisci a chi serve e rispondi ai dubbi che precedono un acquisto.',
      services:'Spiega una domanda frequente con un esempio di come lavori, senza attribuirgli risultati che non puoi documentare.',
      creator:'Scegli una serie riconoscibile legata al tuo tema, alternando esperienza personale e domande del pubblico.',
      other:'Per “'+business+'”, parti da una domanda che ricevi spesso e mostra come affronti quel problema nel tuo lavoro.'
    };
    var formats = sectorFormats[context.business];
    if (context.visual === 'explain') formats += ' Puoi usare una spiegazione, una dimostrazione o un testo illustrato: non è obbligatorio comparire in video.';
    if (context.visual === 'show') formats += ' Usa immagini che rendano visibili passaggi, materiali o dettagli, insieme alle informazioni necessarie per capirli.';
    if (context.goal === 'launch') formats += ' Per il lancio, collega questi esempi alla nuova offerta e alla data in cui sarà disponibile.';
    if (context.goal === 'loyalty') formats += ' Per il pubblico attuale, privilegia aggiornamenti e risposte che siano utili anche dopo il primo contatto.';
    if (context.time === 'no-time' || context.time === 'little-time') formats += ' Dato il tempo limitato, prepara pochi contenuti in un’unica sessione e scegli cosa delegare.';
    if (context.time === 'team') formats += ' Con la persona già dedicata, chiarisci chi prepara, chi approva e chi risponde ai messaggi.';
    if (context.competitors === 'not-observed') formats += ' Prima di fissare la serie, osserva alcuni contenuti di attività simili per capire cosa è già comune.';
    else if (context.competitors === 'more-active') formats += ' Una frequenza più alta dei concorrenti non è un obiettivo da copiare: scegli un ritmo che puoi mantenere.';
    return {profile:profile,goal:goal,business:business,alternative:alternative,tips:[
      {label:'Il primo passo',title:priority.title,text:priority.text},
      {label:'Canali da valutare',title:channels.title,text:channels.text},
      {label:'Contenuti da provare',title:'Parti da esempi vicini alla tua attività',text:formats}
    ],summary:questions.map(function(q,i){return {question:q.q,answer:selected[i].custom?business:selected[i].label};})};
  }
  return {questions:questions,derive:derive};
});
