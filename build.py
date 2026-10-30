#!/usr/bin/env python3
"""Cap versi pada semua import modul, CSS, dan script agar cache browser/GitHub Pages selalu segar.
Jalankan sebelum commit: python3 build.py"""
import re, time, pathlib

root = pathlib.Path(__file__).parent
stamp = time.strftime('%Y%m%d%H%M%S')
pat = re.compile(r"""((?:from|import)\s*\(?\s*['"]\./[\w-]+\.js)(?:\?v=\w+)?(['"])""")

for f in (root / 'js').glob('*.js'):
    s = f.read_text()
    n = pat.sub(lambda m: f"{m.group(1)}?v={stamp}{m.group(2)}", s)
    if n != s:
        f.write_text(n)

idx = root / 'index.html'
s = idx.read_text()
s = re.sub(r'(css/app\.css|js/app\.js)(?:\?v=\w+)?', lambda m: f'{m.group(1)}?v={stamp}', s)
idx.write_text(s)
print('build', stamp)
