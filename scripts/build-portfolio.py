"""Run from any directory after editing data/portfolio.json."""
import json,re,html
from pathlib import Path
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'data/portfolio.json').read_text()); esc=lambda x:html.escape(str(x),quote=True)
def card(c,v=None,i=1):
 if v:
  if v.get('previewUnavailable'):
   media=f'''<a class="video-pending video-pending--post" href="{esc(v['url'])}" target="_blank" rel="noopener noreferrer" aria-label="Apri il post di {esc(c['name'])} su {v['platform']}"><span class="video-platform">{v['platform']} · Post</span><span class="pending-number" aria-hidden="true">↗</span><span class="video-owner">{esc(c['name'])}</span><span>Apri il post originale</span></a>'''
  else:
   media=f'''<button class="video-launch" data-embed="{esc(v['embed'])}" aria-label="Riproduci il video di {esc(c['name'])} su {v['platform']}"><img class="video-cover" src="{esc(v['cover'])}" alt="" loading="lazy" decoding="async"><span class="video-platform">{v['platform']}</span><span class="play-symbol" aria-hidden="true">▷</span><span class="video-owner">{esc(c['name'])}</span><span>Riproduci video</span></button>'''
  bottom=f'<a href="{esc(v["url"])}" target="_blank" rel="noopener noreferrer">Apri su {v["platform"]} ↗</a>'
 else:
  media=f'<div class="video-pending"><span class="video-platform">IN SELEZIONE</span><span class="pending-number" aria-hidden="true">0{i}</span><span class="video-owner">Video in arrivo</span><span>{esc(c["name"])}</span></div>'
  bottom='<span>La prossima storia prende forma.</span>'
 return f'<article class="portfolio-video"><div class="video-stage">{media}</div><div class="video-meta">{bottom}</div></article>'
def carousel(cards,id):
 return f'''<div class="video-carousel" role="region" aria-label="Carosello video"><div class="video-track" id="{id}" tabindex="0">{''.join(cards)}</div><div class="video-controls"><span>Scorri per esplorare</span><button data-step="-1" aria-controls="{id}" aria-label="Video precedenti">←</button><button data-step="1" aria-controls="{id}" aria-label="Video successivi">→</button></div></div>'''
parts=['<section class="section" id="social-video"><div class="container"><div class="section-head"><span class="eyebrow">Le storie dei nostri clienti</span><h2>Scopri i video. <span class="accent-grad">Entra nel progetto.</span></h2><p class="lead">Una selezione di contenuti Instagram e TikTok, cliente per cliente.</p><p class="embed-note">Guarda le anteprime e premi play per caricare il video ufficiale. Puoi anche aprirlo su Instagram o TikTok.</p></div>']
for n,c in enumerate(data['clients']):
 if c['name']=='Sorriso Bistrot': parts.append('<div class="section-head"><span class="eyebrow">In gestione oggi</span><h2>I nuovi <span class="accent-grad">avvii</span>.</h2></div>')
 links=''.join(f'<a href="{esc(l["url"])}" target="_blank" rel="noopener noreferrer">{esc(l["label"])} ↗</a>' for l in c['profiles'])
 cards=[card(c,v) for v in c['videos']]
 while len(cards)<2: cards.append(card(c,i=len(cards)+1))
 parts.append(f'<section class="client-project" aria-labelledby="client-{n}"><div class="client-heading"><span class="project-index">{n+1:02}</span><div><span class="eyebrow">{esc(c["category"])}</span><h3 id="client-{n}">{esc(c["name"])}</h3><p>{esc(c["description"])}</p><div class="card-links">{links}</div></div></div>{carousel(cards,"client-track-"+str(n))}</section>')
parts.append('</div></section>')
best=sorted([(c,v) for c in data['clients'] for v in c['videos'] if isinstance(v.get('views'), int) and v['views'] > 0],key=lambda cv:cv[1]['views'],reverse=True)
cards=[]
for c,v in best:
 s=card(c,v); views=f'{v["views"]:,}'.replace(',','.')
 s=s.replace('</article>',f'<div class="video-result"><strong>{views}</strong><span>visualizzazioni indicate da Organiq · apri il video</span></div></article>'); cards.append(s)
parts.append(f'<section class="section" id="video-risultati"><div class="container"><div class="section-head"><span class="eyebrow">I migliori risultati</span><h2>Storie che hanno <span class="accent-grad">viaggiato lontano.</span></h2><p class="lead">Visualizzazioni aggiornate manualmente, non in tempo reale.</p></div>{carousel(cards,"best-video-track")}</div></section>')
total=sum(v['views'] for c,v in best)
base=f'{total:,}'.replace(',','.')
count_label='Sei' if len(best)==6 else str(len(best))
parts.append(f'''<section class="section"><div class="container"><div class="views-total"><span class="eyebrow">I video in evidenza</span><h2>{count_label} video, un totale<br>da esplorare.</h2><div class="views-number">{base}</div><p>Visualizzazioni complessive dei {len(best)} video qui sopra</p><p class="counter-note">Somma dei dati indicati per ogni video, aggiornata manualmente. Apri i contenuti per vedere i risultati sui rispettivi profili.</p></div></div></section>''')
page=root/'portfolio.html'; src=page.read_text(); content='\n'.join(parts)
if '<!-- VIDEO PORTFOLIO START -->' in src:
 src=re.sub(r'<!-- VIDEO PORTFOLIO START -->.*?<!-- VIDEO PORTFOLIO END -->',lambda _: '<!-- VIDEO PORTFOLIO START -->\n'+content+'\n<!-- VIDEO PORTFOLIO END -->',src,flags=re.S)
else:
 start=src.index('<section class="section"'); end=src.rfind('<section class="section"')
 src=src[:start]+'<!-- VIDEO PORTFOLIO START -->\n'+content+'\n<!-- VIDEO PORTFOLIO END -->\n'+src[end:]
 src=src.replace('<span class="eyebrow">Portfolio 2025</span>','<span class="eyebrow">Il portfolio Organiq</span>')
 src=re.sub(r'<p class="lead">Ogni dato.*?</p>','<p class="lead">Strategia, persone e contenuti. Guarda i video realizzati per i nostri clienti e scopri i risultati dei progetti.</p>',src)
 src=src.replace('<script src="js/main.js"></script>','<script src="js/main.js"></script>\n<script src="js/portfolio.js"></script>')
page.write_text(src)
print(f'Portfolio generato: {len(data["clients"])} clienti, {sum(len(c["videos"]) for c in data["clients"])} contenuti collegati, {len(best)} risultati.')
