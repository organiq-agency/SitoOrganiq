/* ============================================================
   Organiq — Test del Potenziale
   Motore quiz: 8 domande → punteggio 0-100 + profilo + consigli
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Dati ----------
     Ogni opzione ha: label, pts (contributo al punteggio), tags
     (usati per profilo e consigli personalizzati). */
  var QUESTIONS = [
    {
      id: 'business',
      q: 'Di cosa si occupa la tua attività?',
      hint: 'Ci serve per calibrare tutti i consigli successivi.',
      options: [
        { label: 'Ristorazione o food', pts: 14, tags: ['visual-biz', 'local'] },
        { label: 'Negozio o attività locale', pts: 12, tags: ['local'] },
        { label: 'E-commerce o prodotti online', pts: 14, tags: ['online'] },
        { label: 'Servizi o libera professione', pts: 10, tags: ['services'] },
        { label: 'Personal brand o creator', pts: 15, tags: ['creator'] },
        { label: 'Altro (scrivilo tu)', pts: 11, tags: [], custom: true }
      ]
    },
    {
      id: 'audience',
      q: 'Chi è il tuo cliente tipo?',
      hint: 'Da qui capiamo su quali piattaforme ha senso investire.',
      options: [
        { label: 'Giovani (18–35)', pts: 15, tags: ['ig-tiktok'] },
        { label: 'Famiglie e adulti', pts: 12, tags: ['ig-fb'] },
        { label: 'Professionisti e aziende', pts: 10, tags: ['linkedin'] },
        { label: 'Un po’ di tutto', pts: 12, tags: ['ig-tiktok'] }
      ]
    },
    {
      id: 'current',
      q: 'Oggi i social per la tua attività li usi?',
      hint: 'Sii sincero: è un check-up, non un esame.',
      options: [
        { label: 'No, o quasi mai', pts: 8, tags: ['starter'] },
        { label: 'Sì, ma quando mi ricordo', pts: 10, tags: ['diy'] },
        { label: 'Sì, con costanza, ma con pochi risultati', pts: 12, tags: ['diy-stuck'] },
        { label: 'Sì, e funzionano già', pts: 15, tags: ['advanced'] }
      ]
    },
    {
      id: 'visual',
      q: 'Quanto conta l’aspetto visivo in ciò che vendi?',
      hint: 'Cibo, prodotti, ambienti… o pura competenza?',
      options: [
        { label: 'È tutto: si vende con gli occhi', pts: 15, tags: ['high-visual'] },
        { label: 'Conta abbastanza', pts: 10, tags: ['mid-visual'] },
        { label: 'Poco: vendo competenza e fiducia', pts: 6, tags: ['low-visual'] }
      ]
    },
    {
      id: 'channel',
      q: 'Oggi come ti trovano i clienti nuovi?',
      hint: 'Il canale principale, quello che porta più lavoro.',
      options: [
        { label: 'Passaparola', pts: 12, tags: ['single-channel'] },
        { label: 'Google e ricerche online', pts: 10, tags: ['search'] },
        { label: 'Già dai social', pts: 8, tags: [] },
        { label: 'Pubblicità a pagamento', pts: 10, tags: ['paid'] },
        { label: 'Sinceramente? Non lo so', pts: 13, tags: ['unknown-source'] }
      ]
    },
    {
      id: 'time',
      q: 'Quanto tempo puoi dedicare ai social ogni settimana?',
      hint: 'Tra creare contenuti, pubblicare e rispondere.',
      options: [
        { label: 'Praticamente zero', pts: 10, tags: ['delegate'] },
        { label: '1–2 ore', pts: 10, tags: ['delegate'] },
        { label: 'Mezza giornata', pts: 8, tags: [] },
        { label: 'C’è una persona che se ne occupa', pts: 7, tags: ['has-team'] }
      ]
    },
    {
      id: 'competitors',
      q: 'E i tuoi concorrenti, sui social come stanno messi?',
      hint: 'Vale anche un’impressione a occhio.',
      options: [
        { label: 'Meglio di me, e si vede', pts: 12, tags: ['urgency'] },
        { label: 'Più o meno come me', pts: 9, tags: [] },
        { label: 'Peggio di me', pts: 11, tags: ['opportunity'] },
        { label: 'Non li ho mai guardati', pts: 9, tags: [] }
      ]
    },
    {
      id: 'goal',
      q: 'Qual è il tuo obiettivo principale nei prossimi 6 mesi?',
      hint: 'Quello che conta davvero, non tutti insieme.',
      options: [
        { label: 'Più clienti, il prima possibile', pts: 8, tags: ['goal-clients'] },
        { label: 'Farmi conoscere nella mia zona / nicchia', pts: 8, tags: ['goal-brand'] },
        { label: 'Fidelizzare chi già mi conosce', pts: 8, tags: ['goal-loyalty'] },
        { label: 'Lanciare qualcosa di nuovo', pts: 8, tags: ['goal-launch'] }
      ]
    }
  ];

  var MAX_PTS = QUESTIONS.reduce(function (sum, q) {
    return sum + Math.max.apply(null, q.options.map(function (o) { return o.pts; }));
  }, 0);
  var MIN_PTS = QUESTIONS.reduce(function (sum, q) {
    return sum + Math.min.apply(null, q.options.map(function (o) { return o.pts; }));
  }, 0);

  /* ---------- Profili ---------- */
  var PROFILES = {
    fertile: {
      badge: '🌱 Da impostare',
      title: 'C’è una base da costruire.',
      desc: 'Partirei da un obiettivo preciso, un pubblico e pochi contenuti che riesci a produrre con continuità.'
    },
    stuck: {
      badge: '🔧 Da rivedere',
      title: 'Stai pubblicando: guardiamo cosa succede.',
      desc: 'Prima di aumentare la frequenza, guarda gli ultimi 10 contenuti: quali temi hanno generato conversazioni e quali sono passati inosservati?'
    },
    scale: {
      badge: '↗ Già avviato',
      title: 'Hai già qualcosa che funziona.',
      desc: 'Individua i contenuti che ricevono risposte utili, poi prova a ripetere quei formati. La crescita non è automatica: va osservata nel tempo.'
    },
    secondary: {
      badge: '🧭 Social di supporto',
      title: 'I social potrebbero non essere la prima priorità.',
      desc: 'Dalle tue risposte conviene valutare prima come le persone ti trovano oggi e che cosa vedono quando cercano la tua attività. Il sito e la reputazione possono contare più di nuovi video.'
    }
  };

  /* ---------- Stato ---------- */
  var current = 0;
  var answers = [];      // indice opzione scelta per ogni domanda
  var customTexts = {};  // testo libero per le opzioni "Altro" (per domanda)

  /* ---------- Elementi ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var intro = $('intro'), quizBox = $('quizBox'), result = $('result');
  var progress = $('progress'), progressBar = $('progressBar');
  var stepLabel = $('stepLabel'), questionText = $('questionText'),
      questionHint = $('questionHint'), options = $('options'), backBtn = $('backBtn');

  /* ---------- Flusso ---------- */
  function startQuiz() {
    if (intro) intro.hidden = true;
    quizBox.hidden = false;
    renderQuestion();
  }
  var startBtn = $('startBtn');
  if (startBtn) startBtn.addEventListener('click', startQuiz);
  /* Nessun intermezzo: si parte subito dalla prima domanda */
  startQuiz();

  backBtn.addEventListener('click', function () {
    if (current > 0) {
      current--;
      answers.length = current;
      renderQuestion();
    }
  });

  $('restartBtn').addEventListener('click', function () {
    current = 0;
    answers = [];
    customTexts = {};
    result.hidden = true;
    quizBox.hidden = false;
    renderQuestion();
    window.scrollTo({ top: 0 });
  });

  function setProgress(pct) {
    progressBar.style.width = pct + '%';
    progress.setAttribute('aria-valuenow', String(Math.round(pct)));
  }

  function renderQuestion() {
    var q = QUESTIONS[current];
    setProgress((current / QUESTIONS.length) * 100);
    stepLabel.textContent = 'Domanda ' + (current + 1) + ' di ' + QUESTIONS.length;
    questionText.textContent = q.q;
    questionHint.textContent = q.hint;
    backBtn.hidden = current === 0;

    options.innerHTML = '';
    var letters = 'ABCDEF';
    q.options.forEach(function (opt, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-opt';
      btn.innerHTML = '<span class="opt-key">' + letters[i] + '</span><span>' + opt.label + '</span>';
      btn.addEventListener('click', function () { choose(i); });
      options.appendChild(btn);
    });

    /* animazione di ingresso */
    quizBox.classList.remove('quiz-fade');
    void quizBox.offsetWidth;
    quizBox.classList.add('quiz-fade');
    questionText.focus && questionText.setAttribute('tabindex', '-1');
  }

  function choose(i) {
    var opt = QUESTIONS[current].options[i];
    if (opt.custom) {
      showCustomInput(i);
      return;
    }
    answers[current] = i;
    delete customTexts[current];
    advance();
  }

  function advance() {
    if (current < QUESTIONS.length - 1) {
      current++;
      renderQuestion();
    } else {
      showResult();
    }
  }

  /* Campo libero per l'opzione "Altro" */
  function showCustomInput(i) {
    options.innerHTML = '';
    var wrap = document.createElement('div');
    wrap.className = 'quiz-custom quiz-fade';
    wrap.innerHTML =
      '<label for="customInput">Raccontacelo in due parole:</label>' +
      '<input type="text" id="customInput" maxlength="80" autocomplete="off" ' +
      'placeholder="Es. palestra, studio legale, agriturismo, artigianato…">' +
      '<div class="quiz-custom-actions">' +
      '<button type="button" class="btn btn-primary" id="customGo" disabled>Continua</button>' +
      '<button type="button" class="quiz-back" id="customCancel" style="margin:0">Torna alle opzioni</button>' +
      '</div>';
    options.appendChild(wrap);

    var input = wrap.querySelector('#customInput');
    var go = wrap.querySelector('#customGo');
    input.focus();

    input.addEventListener('input', function () {
      go.disabled = input.value.trim().length < 2;
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !go.disabled) go.click();
    });
    go.addEventListener('click', function () {
      answers[current] = i;
      customTexts[current] = input.value.trim();
      advance();
    });
    wrap.querySelector('#customCancel').addEventListener('click', function () {
      renderQuestion();
    });
  }

  /* ---------- Calcolo risultato ---------- */
  function collectTags() {
    var tags = [];
    answers.forEach(function (ai, qi) {
      tags = tags.concat(QUESTIONS[qi].options[ai].tags);
    });
    return tags;
  }

  function computeScore() {
    var pts = 0;
    answers.forEach(function (ai, qi) {
      pts += QUESTIONS[qi].options[ai].pts;
    });
    return Math.max(0, Math.min(100, Math.round(((pts - MIN_PTS) / (MAX_PTS - MIN_PTS)) * 100)));
  }

  function pickProfile(score, tags) {
    var has = function (t) { return tags.indexOf(t) !== -1; };
    /* Se il contesto è poco visivo e la ricerca o il B2B sono centrali,
       valutiamo prima i canali già usati dall'attività. */
    if (!has('advanced') && has('low-visual') && (has('linkedin') || has('search'))) return 'secondary';
    if (has('advanced')) return 'scale';
    if (has('diy') || has('diy-stuck')) return 'stuck';
    return 'fertile';
  }

  function buildTips(tags, profileKey) {
    var has = function (t) { return tags.indexOf(t) !== -1; };
    var tips = [];

    /* 1. Piattaforme */
    var platforms, platWhy;
    if (has('linkedin')) {
      platforms = 'LinkedIn + Instagram';
      platWhy = 'Hai indicato professionisti e aziende: valuta LinkedIn prima di aggiungere altri canali. Instagram può mostrare persone, progetti e attività quotidiana.';
    } else if (has('ig-fb')) {
      platforms = 'Instagram + Facebook';
      platWhy = 'Hai indicato famiglie e adulti: confronta dove si trovano davvero i tuoi clienti prima di scegliere fra Instagram e Facebook.';
    } else {
      platforms = 'Instagram + TikTok';
      platWhy = 'Instagram e TikTok sono due canali da valutare. Per scegliere, guarda dove sono già attivi i tuoi clienti e quanto tempo puoi dedicare ai contenuti.';
    }
    tips.push({
      icon: 'M2 2h20v20H2z M7 7h10 M7 12h10 M7 17h6',
      title: 'Canali da valutare: ' + platforms,
      text: platWhy
    });

    /* 2. Formato contenuti */
    if (has('high-visual')) {
      tips.push({
        title: 'Mostra ciò che vendi',
        text: 'Hai detto che l’aspetto visivo conta molto. Prova video brevi e foto che mostrino prodotto, ambiente o lavorazione, poi verifica quali domande arrivano.'
      });
    } else if (has('low-visual')) {
      tips.push({
        title: 'Rispondi alle domande dei clienti',
        text: 'Hai detto che vendi competenza più che immagini. Parti dalle domande che ricevi più spesso e mostra come lavori, anche senza comparire in video.'
      });
    } else {
      tips.push({
        title: 'Scegli due o tre temi ricorrenti',
        text: 'Alterna quello che fai, le persone coinvolte e le domande che ricevi. Dopo qualche settimana controlla quali temi interessano di più.'
      });
    }

    /* 3. Terza tip in base al contesto */
    if (profileKey === 'secondary') {
      tips.push({
        title: 'Prima verifica sito e reputazione',
        text: 'Dalle tue risposte i clienti potrebbero cercarti altrove. Controlla che trovino servizi, contatti e informazioni aggiornate prima di investire in nuovi contenuti.'
      });
    } else if (has('unknown-source')) {
      tips.push({
        title: 'Scopri da dove arrivano i contatti',
        text: 'Hai detto che non sai come ti trovano i nuovi clienti. Chiederlo a ogni nuovo contatto, e annotare la risposta, è il primo passo prima di scegliere altri canali.'
      });
    } else if (has('single-channel')) {
      tips.push({
        title: 'Oggi ti trovano soprattutto tramite passaparola',
        text: 'Hai indicato un canale principale. Prima di aprirne altri, chiedi ai nuovi clienti come ti hanno scoperto e annota le risposte.'
      });
    } else if (has('urgency')) {
      tips.push({
        title: 'Guarda cosa fanno i concorrenti',
        text: 'Hai notato concorrenti più attivi. Confronta argomenti, frequenza e risposte del pubblico: può aiutarti a scegliere dove essere più chiaro o diverso.'
      });
    } else if (has('opportunity')) {
      tips.push({
        title: 'Metti alla prova la tua impressione',
        text: 'Hai indicato concorrenti meno attivi. Guarda i loro ultimi contenuti e le domande del pubblico prima di decidere che cosa pubblicare.'
      });
    } else if (has('delegate')) {
      tips.push({
        title: 'Pianifica per il tempo che hai',
        text: 'Hai poco tempo per i social: un calendario sostenibile conta più di una frequenza che non puoi mantenere. Decidi quali attività gestire e quali delegare.'
      });
    } else {
      tips.push({
        title: 'Inizia da una verifica semplice',
        text: 'Scegli un obiettivo per il prossimo mese, pubblica con regolarità e annota quali contenuti ottengono risposte utili.'
      });
    }

    return tips;
  }

  function answerSummary() {
    var current = [
      'Oggi pubblichi poco o niente.',
      'Oggi pubblichi quando riesci.',
      'Pubblichi con costanza, ma i risultati ti sembrano pochi.',
      'Hai detto che i tuoi social stanno già funzionando.'
    ];
    var goals = [
      'Nei prossimi sei mesi cerchi più clienti.',
      'Nei prossimi sei mesi vuoi farti conoscere nella tua zona o nicchia.',
      'Nei prossimi sei mesi vuoi seguire meglio chi già ti conosce.',
      'Nei prossimi sei mesi vuoi lanciare qualcosa di nuovo.'
    ];
    return current[answers[2]] + ' ' + goals[answers[7]] + ' ';
  }

  /* ---------- Render risultato ---------- */
  var TIP_ICONS = [
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.6 3H8.4A5.4 5.4 0 003 8.4v7.2A5.4 5.4 0 008.4 21h7.2a5.4 5.4 0 005.4-5.4V8.4A5.4 5.4 0 0015.6 3z"/><path d="M10 9.5l5 2.5-5 2.5v-5z" fill="currentColor" stroke="none"/></svg>',
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>'
  ];

  function showResult() {
    setProgress(100);
    quizBox.hidden = true;
    result.hidden = false;
    window.scrollTo({ top: 0 });

    var score = computeScore();
    var tags = collectTags();
    var profileKey = pickProfile(score, tags);
    var profile = PROFILES[profileKey];

    $('profileBadge').textContent = profile.badge;
    $('profileTitle').textContent = profile.title;
    $('profileDesc').textContent = answerSummary() + profile.desc;

    /* Tips */
    var tips = buildTips(tags, profileKey);
    var list = $('tipsList');
    list.innerHTML = '';
    tips.forEach(function (t, i) {
      var div = document.createElement('div');
      div.className = 'tip';
      div.innerHTML = '<div class="tip-icon">' + TIP_ICONS[i % TIP_ICONS.length] + '</div>' +
        '<div><strong>' + t.title + '</strong><p>' + t.text + '</p></div>';
      list.appendChild(div);
    });

    /* CTA personalizzata per il profilo "secondary" */
    var box = $('leadBox');
    if (profileKey === 'secondary') {
      box.querySelector('h3').innerHTML = 'Prima dei social, <span class="accent">guardiamo le basi.</span>';
      box.querySelector('p').textContent = 'Se vuoi, possiamo rivedere insieme sito, informazioni e canali attuali prima di proporti nuovi contenuti.';
    } else {
      box.querySelector('h3').innerHTML = 'Hai visto un primo orientamento. <span class="accent">Ora guardiamo il tuo profilo.</span>';
      box.querySelector('p').textContent = 'Se vuoi un parere sui contenuti che pubblichi oggi, lasciaci i tuoi contatti: esamineremo il profilo e ti diremo da cosa partire.';
    }

    /* Campi nascosti per l'email del lead */
    $('fProfile').value = profile.badge.replace(/^\S+\s/, '');
    $('fScore').value = score + '/100';
    $('fAnswers').value = QUESTIONS.map(function (q, i) {
      var label = q.options[answers[i]].label;
      if (customTexts[i]) label = 'Altro: ' + customTexts[i];
      return q.q + ' → ' + label;
    }).join(' | ');

    /* Gauge + contatore */
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var circumference = 527.8;
    var target = circumference * (1 - score / 100);
    var gauge = $('gaugeFill');
    var num = $('scoreNum');

    if (reduceMotion) {
      gauge.style.strokeDashoffset = target;
      num.textContent = score;
      return;
    }
    requestAnimationFrame(function () {
      gauge.style.strokeDashoffset = target;
    });
    var start = null, dur = 1400;
    var step = function (ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      num.textContent = Math.round(score * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- Submit feedback ---------- */
  var leadForm = $('leadForm');
  if (leadForm) {
    leadForm.addEventListener('submit', function () {
      var btn = $('leadSubmit');
      btn.disabled = true;
      btn.style.opacity = '.6';
      btn.textContent = 'Invio in corso…';
    });
  }
})();
