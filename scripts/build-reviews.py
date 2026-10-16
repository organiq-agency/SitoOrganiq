from pathlib import Path
from html import escape
import json,re
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'data/reviews.json').read_text())
cards=[]
for r in data:
 initials=''.join(w[0] for w in r['name'].split()[:2]).upper()
 icon='<span class="review-quote-mark" aria-hidden="true">“</span>'
 if r['rating'] is not None:
  icon='<div class="review-stars" aria-label="'+str(r['rating'])+' stelle su 5">'+''.join('<svg viewBox="0 0 24 24" aria-hidden="true" class="'+('empty' if i>=r['rating'] else '')+'"><path d="m12 3 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2-5.7-3-5.7 3 1.1-6.2L3 9.6l6.3-.9Z"/></svg>' for i in range(5))+'</div>'
 cards.append('<article class="review-card" data-review-id="'+r['id']+'">'+icon+'<blockquote>'+escape(r['text'])+'</blockquote><div class="review-card-footer"><span class="review-avatar" aria-hidden="true">'+initials+'</span><span class="review-author">'+escape(r['name'])+'</span></div><button type="button" class="review-read" aria-label="Leggi la recensione di '+escape(r['name'],quote=True)+'">Leggi la recensione ↗</button></article>')
section='''<!-- ============ RECENSIONI CLIENTI ============ -->
<section class="section client-reviews" id="recensioni" aria-labelledby="client-reviews-title">
 <div class="container">
  <header class="head head--center"><span class="label mono">Le loro parole</span><h2 id="client-reviews-title">Chi ci ha affidato<br>la propria attività.</h2><p class="sub">Le esperienze raccontate dai nostri clienti.</p></header>
  <div class="review-actions"><button class="btn btn--mint review-all" type="button">Leggi tutte le recensioni</button><button class="review-pause" type="button" aria-pressed="false">Metti in pausa il wall</button></div>
  <p class="review-mobile-hint">Scorri per leggere le esperienze dei clienti →</p>
  <div class="review-wall" role="region" aria-label="Recensioni dei clienti" data-lenis-prevent><div class="review-plane">'''+''.join(cards)+'''</div></div>
  <dialog class="review-dialog" aria-labelledby="review-dialog-title" data-lenis-prevent><div class="review-dialog-head"><h3 id="review-dialog-title">Le parole dei nostri clienti</h3><button type="button" class="review-dialog-close" aria-label="Chiudi recensione">×</button></div><div class="review-dialog-body"></div></dialog>
 </div>
</section>
'''

p=root/'index.html'
s=p.read_text()
s,n=re.subn(r'<!-- ============ RECENSIONI CLIENTI ============ -->.*?(?=<!-- ============ PREZZI ============ -->)',lambda _:section+'\n',s,flags=re.S)
if n!=1:raise ValueError('Review section not found')
p.write_text(s)
print(str(len(data))+' recensioni generate dai testi forniti.')
