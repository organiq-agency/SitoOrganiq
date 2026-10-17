"""Keep package contents and commercial notes consistent across both pages."""
from pathlib import Path
from html import escape
from urllib.parse import quote
import json,re
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'data/social-plans.json').read_text())
li=lambda items: ''.join('<li>'+escape(s)+'</li>' for s in items)
notes='<p class="project-context">'+escape(data['reelsNote'])+'</p><details class="offer-details"><summary>Leggi cosa definiamo nella proposta</summary><p>'+escape(data['details'])+'</p><p>'+escape(data['taxNote'])+'</p></details>'
home=[];service=[]
for plan in data['plans']:
 name=escape(plan['name']);price=f"{plan['price']:,}".replace(',','.')+' €';url='contatti.html?servizio='+quote('Gestione social '+plan['name'])
 variant=plan['id']
 logo_src='assets/plans/organiq-glass.png' if variant=='business' else 'assets/mark-mint.png'
 logo='<span class="plan-brand plan-brand--'+variant+'" aria-hidden="true"><img class="plan-brand__image" src="'+logo_src+'" alt="" loading="lazy" decoding="async"></span>'
 volume=str(plan['reelsPerWeek'])+' video reel* a settimana'
 home.append('<article class="plan'+(' plan--featured' if plan['id']=='smart' else '')+'" data-reveal>'+logo+'<h3>'+name+'</h3><p class="plan-sub">'+escape(plan['description'])+'</p><p class="plan-price"><small>da</small> '+price+'<span>/mese</span></p><a href="'+url+'" class="btn '+('btn--mint' if plan['id']=='smart' else 'btn--dark')+' btn--block"><span class="btn-roll"><span>Richiedi un preventivo</span><span aria-hidden="true">Richiedi un preventivo</span></span></a><ul class="plan-list">'+li([volume]+data['common']+plan['extras'])+'</ul></article>')
 service.append('<a class="pack pack--'+plan['id']+'" href="'+url+'" aria-label="Richiedi un preventivo per il piano '+name+': da '+price+' al mese"><div class="pack__head">'+logo+'<div class="pack__name">Organiq.<small>'+name+'</small></div></div><div class="pack__body"><ul class="pack__list">'+li([volume]+plan['extras'])+'</ul><div class="pack__footer"><span class="pack__from">A partire da</span><span class="pack__price tnum">'+price+'<small>/mese</small></span><span class="pack__cta">Richiedi un preventivo <span aria-hidden="true">↗</span></span></div></div></a>')
p=root/'index.html';s=p.read_text();start=s.index('    <div class="plans">');end=s.index('\n  </div>\n</section>',start)
s=s[:start]+'    <div class="plans">'+''.join(home)+'</div>\n'+notes+'<p class="pricing-note">Le visualizzazioni dei progetti mostrati non sono una previsione dei risultati del tuo profilo.</p>'+s[end:];p.write_text(s)
p=root/'servizi.html';s=p.read_text();start=s.index('<div class="packs">');end=s.index('</div></section>',s.index('<p class="service-note">',start))
s=s[:start]+'<div class="packs">'+''.join(service)+'</div><p class="service-note">In tutti i piani: '+escape(', '.join(data['common']).lower())+'.</p>'+notes+s[end:];p.write_text(s)
print('Pacchetti allineati nelle due pagine.')
