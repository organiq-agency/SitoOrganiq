"""Refresh public reel and TikTok cover images referenced by portfolio.json."""
import html
import io
import json
import re
import urllib.parse
import urllib.request
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
data_path = root / 'data/portfolio.json'
data = json.loads(data_path.read_text())
folder = root / 'assets' / 'video-covers'
folder.mkdir(exist_ok=True)
headers = {'User-Agent': 'Mozilla/5.0'}

def fetch(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=15).read()

for client in data['clients']:
    for video in client['videos']:
        if video.get('previewUnavailable'):
            continue
        code = video['url'].rstrip('/').split('/')[-1]
        path = folder / f'{code}.webp'
        if path.exists():
            continue
        try:
            if video['platform'] == 'Instagram':
                source = fetch(video['embed']).decode('utf-8', 'ignore')
                match = re.search(r'<img class="EmbeddedMediaImage"[^>]*src="([^"]+)"', source)
                if not match:
                    raise RuntimeError('anteprima non esposta dall’embed pubblico')
                cover_url = html.unescape(match.group(1))
            else:
                endpoint = 'https://www.tiktok.com/oembed?url=' + urllib.parse.quote(video['url'], safe='')
                cover_url = json.loads(fetch(endpoint))['thumbnail_url']
            with Image.open(io.BytesIO(fetch(cover_url))) as image:
                image = image.convert('RGB')
                image.thumbnail((720, 1280))
                image.save(path, 'WEBP', quality=84, method=6)
            with Image.open(path) as image:
                if image.width < 200 or image.height < 200:
                    raise RuntimeError('copertina troppo piccola')
            print(f'{client["name"]}: {code} ({path.stat().st_size // 1024} KB)', flush=True)
        except Exception as error:
            path.unlink(missing_ok=True)
            print(f'Anteprima assente per {client["name"]}: {code} ({error})', flush=True)
data_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
