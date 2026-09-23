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
        { label: 'Google e ricerche online', pts: 10, tags: [] },
        { label: 'Già dai social', pts: 8, tags: [] },
        { label: 'Pubblicità a pagamento', pts: 10, tags: ['paid'] },
        { label: 'Sinceramente? Non lo so', pts: 13, tags: ['single-channel'] }
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

  /* ---------- Profili ---------- */
  var PROFILES = {
    fertile: {
      badge: '🌱 Terreno fertile',
      title: 'Hai un potenziale enorme, ancora tutto da coltivare.',
      desc: 'Il tuo business ha le carte in regola per crescere sui social, ma oggi quel potenziale è fermo. Ogni settimana senza una presenza vera è una settimana in cui i tuoi clienti trovano qualcun altro.'
    },
    stuck: {
      badge: '🔧 Fai-da-te bloccato',
      title: 'L’impegno c’è. Quello che manca è il metodo.',
      desc: 'Stai già investendo tempo ed energie, e questo è il passo più difficile. Ma senza una strategia chiara i contenuti non si trasformano in clienti: serve struttura, non più fatica.'
    },
    scale: {
      badge: '🚀 Pronto a scalare',
      title: 'La base funziona. Ora si può fare sul serio.',
      desc: 'Hai già una presenza che dà segnali positivi: sei nella situazione perfetta per passare dal "funziona" al "cresce ogni mese". Con una strategia professionale, questi numeri si moltiplicano.'
    },
    secondary: {
      badge: '🧭 Social di supporto',
      title: 'Onestamente? I social per te non sono la priorità n°1.',
      desc: 'Per il tuo tipo di business i social funzionano meglio come vetrina di fiducia che come motore principale di clienti. Ha più senso partire da basi solide — sito, posizionamento, reputazione — e usare i social come supporto. Sì, te lo stiamo dicendo anche se siamo una social agency.'
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
    return Math.min(100, Math.round((pts / MAX_PTS) * 100));
  }

  function pickProfile(score, tags) {
    var has = function (t) { return tags.indexOf(t) !== -1; };
    /* Social secondari: B2B, poco visivo e social mai usati →
       la priorità onesta è un'altra (sito, posizionamento, reputazione) */
    if (has('low-visual') && has('linkedin') && has('starter')) return 'secondary';
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
      platWhy = 'Il tuo pubblico decide in ambito professionale: LinkedIn per l’autorevolezza, Instagram per il lato umano del brand.';
    } else if (has('ig-fb')) {
      platforms = 'Instagram + Facebook';
      platWhy = 'Famiglie e adulti vivono qui: Instagram per farti scoprire, Facebook per la community locale e le recensioni.';
    } else {
      platforms = 'Instagram + TikTok';
      platWhy = 'Il tuo pubblico scopre nuove attività scorrendo i feed: servono formati brevi, nativi e riconoscibili.';
    }
    tips.push({
      icon: 'M2 2h20v20H2z M7 7h10 M7 12h10 M7 17h6',
      title: 'Le tue piattaforme: ' + platforms,
      text: platWhy
    });

    /* 2. Formato contenuti */
    if (has('high-visual')) {
      tips.push({
        title: 'Il tuo formato: video brevi e foto "vere"',
        text: 'Vendi con gli occhi: reels e contenuti visivi di qualità sono il tuo asset più potente. È esattamente il tipo di contenuto che genera visite e ordini.'
      });
    } else if (has('low-visual')) {
      tips.push({
        title: 'Il tuo formato: contenuti che dimostrano competenza',
        text: 'Per chi vende fiducia funzionano consigli pratici, casi risolti e volto in camera: il cliente deve pensare "questa persona sa quello che fa" prima ancora di chiamarti.'
      });
    } else {
      tips.push({
        title: 'Il tuo formato: storytelling + prova sociale',
        text: 'Mostra il dietro le quinte, le persone e i risultati: è il mix che trasforma un profilo in un motivo per sceglierti.'
      });
    }

    /* 3. Terza tip in base al contesto */
    if (has('single-channel')) {
      tips.push({
        title: 'Attenzione: dipendi da un solo canale',
        text: 'Oggi i clienti arrivano da una fonte che non controlli. I social sono il modo più rapido per costruire un canale tuo, misurabile e scalabile.'
      });
    } else if (has('urgency')) {
      tips.push({
        title: 'I tuoi competitor sono già avanti',
        text: 'Chi presidia i social nella tua nicchia sta raccogliendo i clienti che cercano proprio quello che fai tu. Il secondo momento migliore per iniziare è adesso.'
      });
    } else if (has('opportunity')) {
      tips.push({
        title: 'Hai un vantaggio raro: i competitor dormono',
        text: 'Nella tua nicchia c’è spazio libero: chi si muove per primo con contenuti professionali si prende la quota di attenzione più grande, al costo più basso.'
      });
    } else if (has('delegate')) {
      tips.push({
        title: 'Il tuo tempo è la risorsa più scarsa',
        text: 'Con il tempo che hai, il fai-da-te produce poco e logora molto. La leva giusta è delegare la parte operativa e tenere per te solo ciò che sai fare meglio: il tuo lavoro.'
      });
    } else if (profileKey === 'secondary') {
      tips.push({
        title: 'Prima il fondamento: sito e reputazione',
        text: 'Per il tuo business conviene partire da un sito professionale e da una reputazione online solida; i social diventano la conferma di fiducia per chi ti sta già valutando.'
      });
    } else {
      tips.push({
        title: 'La costanza batte la perfezione',
        text: 'Meglio 3 contenuti a settimana per 6 mesi che 30 in un mese e poi il silenzio. È la costanza, non il colpo di fortuna, a costruire risultati.'
      });
    }

    return tips;
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
    $('profileDesc').textContent = profile.desc;

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
    if (profileKey === 'secondary') {
      var box = $('leadBox');
      box.querySelector('h3').innerHTML = 'Ti serve prima una base solida? <span class="accent">Partiamo da lì.</span>';
      box.querySelector('p').textContent = 'Progettiamo anche siti web e piattaforme online. Prenota un’analisi gratuita: ti diciamo da dove ha senso iniziare davvero, senza venderti quello che non ti serve.';
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
