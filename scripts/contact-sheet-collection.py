"""Review contact sheets only. Original bytes remain unmodified outside the repo."""
from PIL import Image,ImageDraw,ImageFont,ImageOps
from pathlib import Path
import json,math,os
root=Path(__file__).resolve().parents[1];out=root/'docs/oaktown-signature/phase2b'
originals=Path(os.environ.get('OAKTOWN_ORIGINAL_DIR','/tmp/phase2b-originals'))
audit=json.loads((out/'photo-verification.json').read_text())
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',14)
for prop in audit['properties']:
    photos=[p for p in audit['photos'] if p['propertySlug']==prop['slug']]
    sheet=Image.new('RGB',(1200,math.ceil(len(photos)/4)*250+50),'#faf7ef')
    for i,photo in enumerate(photos):
        x=(i%4)*300;y=(i//4)*250+50
        source=originals/(photo['propertySlug']+'-'+str(photo['index']).zfill(2)+'.image')
        image=ImageOps.exif_transpose(Image.open(source)).convert('RGB')
        image.thumbnail((288,210));sheet.paste(image,(x+(300-image.width)//2,y+(210-image.height)//2))
    draw=ImageDraw.Draw(sheet)
    draw.text((12,14),prop['address']+' — exact original gallery order',font=font,fill='#102f23')
    for i,photo in enumerate(photos):
        x=(i%4)*300;y=(i//4)*250+50
        draw.rectangle((x,y+213,x+299,y+249),fill='#faf7ef')
        draw.text((x+8,y+219),f"{photo['index']:02d}  {photo['width']} × {photo['height']}",font=font,fill='#102f23')
    sheet.save(out/('contact-'+prop['slug']+'.jpg'),quality=90)
