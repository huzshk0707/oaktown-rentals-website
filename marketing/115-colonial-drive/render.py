#!/usr/bin/env python3
"""Render the reviewed storyboard into a silent captioned H.264 Facebook Reel.

Requires Python 3, FFmpeg with libx264/drawtext, and a TrueType font.
Photo paths are relative to the storyboard; originals are never modified.
"""
import argparse
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import textwrap


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--storyboard', type=Path, default=Path(__file__).with_name('storyboard.json'))
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--font', type=Path, default=Path('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
    parser.add_argument('--check', action='store_true', help='Validate inputs without rendering')
    args = parser.parse_args()
    config = args.storyboard.resolve()
    data = json.loads(config.read_text())
    if not shutil.which('ffmpeg'):
        parser.error('Install FFmpeg before rendering.')
    if not args.font.is_file():
        parser.error('Font not found. Pass --font /path/to/font.ttf.')
    if (data['width'], data['height'], data['fps']) != (1080, 1920, 30):
        parser.error('This layout currently supports 1080x1920 at 30 fps.')
    if not data['scenes']:
        parser.error('Storyboard must include at least one scene.')
    images = []
    for number, scene in enumerate(data['scenes'], 1):
        if not scene['image']:
            parser.error(f'Scene {number}: assign a visually reviewed photo for: {scene["shot"]}')
        photo = (config.parent / scene['image']).resolve()
        if not photo.is_file():
            parser.error(f'Scene {number}: photo missing: {photo}')
        if not isinstance(scene['seconds'], (int, float)) or not 1 <= scene['seconds'] <= 30:
            parser.error(f'Scene {number}: duration must be between 1 and 30 seconds.')
        images.append(photo)
    if args.check:
        print(f'Validated {len(images)} scenes, {sum(s["seconds"] for s in data["scenes"])} seconds.')
        return
    output = args.output.resolve()
    if output.exists():
        parser.error('Output already exists. Choose a new filename to preserve the previous version.')
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='oaktown-video-') as temp:
        work = Path(temp)
        shutil.copyfile(args.font, work / 'font.ttf')
        clips = []
        for index, (scene, photo) in enumerate(zip(data['scenes'], images)):
            copy = {
                'location': data['location'],
                'address': data['property'],
                'headline': '\n'.join(textwrap.wrap(scene['headline'], 28)),
                'detail': '\n'.join(textwrap.wrap(scene['detail'], 36)),
                'brand': data['brand'],
                'contact': data['contact'],
            }
            for key, value in copy.items():
                (work / f'{key}.txt').write_text(value, encoding='utf-8')
            # Contain the entire real property photograph; do not crop or alter its features.
            filters = ['scale=960:880:force_original_aspect_ratio=decrease:out_range=tv',
                       'format=yuv420p', 'setparams=range=limited',
                       'pad=1080:1920:(ow-iw)/2:350:color=0x123b25', 'setsar=1']
            for key, size, y in [('location', 30, 165), ('address', 56, 225),
                                  ('headline', 52, 1280), ('detail', 34, 1430),
                                  ('brand', 28, 1550), ('contact', 38, 1610)]:
                filters.append(f'drawtext=fontfile=font.ttf:textfile={key}.txt:expansion=none:'
                               f'fontcolor=0xf3f5df:fontsize={size}:line_spacing=12:x=(w-tw)/2:y={y}')
            duration = scene['seconds']
            filters.extend(['fade=t=in:st=0:d=0.25', f'fade=t=out:st={duration-0.25}:d=0.25'])
            clip = f'scene-{index:02d}.mp4'
            subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-nostdin',
                            '-loop', '1', '-framerate', '30', '-i', str(photo),
                            '-vf', ','.join(filters), '-t', str(duration), '-an',
                            '-c:v', 'libx264', '-preset', 'fast', '-crf', '19',
                            '-pix_fmt', 'yuv420p', '-r', '30', '-threads', '2', clip],
                           cwd=work, check=True)
            clips.append(f"file '{clip}'")
        (work / 'clips.txt').write_text('\n'.join(clips) + '\n')
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-nostdin',
                        '-f', 'concat', '-safe', '0', '-i', 'clips.txt', '-c', 'copy',
                        '-movflags', '+faststart', str(output)], cwd=work, check=True)
    print(f'Rendered {output}')


if __name__ == '__main__':
    main()
