"""Read-only source listing comparison; preserves exact catalogue URL assignments."""
from pathlib import Path
from urllib.parse import unquote
import html,json,re,subprocess
root=Path(__file__).resolve().parents[1]
audit=json.loads((root/'docs/oaktown-signature/phase2a/catalogue-audit.json').read_text())
results=[]
for prop in audit['properties']:
    request=subprocess.run(['curl','-sS','--max-time','20','--fail',prop['sourceUrl']],capture_output=True,text=True)
    raw=html.unescape(request.stdout)
    normalized=unquote(raw)
    positions=[normalized.find(unquote(photo['url'])) for photo in prop['photos']]
    title=re.findall(r'<title>(.*?)</title>',raw)
    results.append({'propertySlug':prop['slug'],'sourceUrl':prop['sourceUrl'],'sourceTitle':title[0] if title else None,'curlExit':request.returncode,'error':request.stderr.strip(),'normalization':'HTML entity decoding and percent decoding only; + characters preserved','exactPhotoUrlsPresent':sum(photo['url'] in raw for photo in prop['photos']),'normalizedPhotoUrlsPresent':sum(p>=0 for p in positions),'expected':len(positions),'normalizedAllPresent':all(p>=0 for p in positions),'firstOccurrenceOrderMatches':all(p>=0 for p in positions) and positions==sorted(positions)})
    print(prop['slug'],results[-1]['normalizedPhotoUrlsPresent'],len(positions))
(root/'docs/oaktown-signature/phase2b/source-listing-verification.json').write_text(json.dumps(results,indent=2)+'\n')
raise SystemExit(not all(r['normalizedAllPresent'] and r['firstOccurrenceOrderMatches'] for r in results))
