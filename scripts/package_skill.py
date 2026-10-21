"""Build a reproducible source-only Skill ZIP. No generated media or dependencies."""
from pathlib import Path
import zipfile, hashlib
root = Path(__file__).resolve().parent.parent
source = root / 'skills' / 'auto-video'
target = root / 'downloads' / 'auto-video.zip'
target.parent.mkdir(exist_ok=True)
exclude = {'node_modules', '.venv-tts', '__pycache__', '.DS_Store', '.git', 'out', 'dist'}
media = {'.wav', '.mp3', '.m4a', '.aac', '.aiff', '.ogg', '.mp4', '.webm'}
with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED) as archive:
    for path in sorted(source.rglob('*')):
        relative = path.relative_to(source)
        if not path.is_file() or any(p in exclude or p.startswith('.env') for p in relative.parts) or path.suffix.lower() in media:
            continue
        info = zipfile.ZipInfo('auto-video/' + relative.as_posix(), (1980, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o644 << 16
        archive.writestr(info, path.read_bytes())
digest = hashlib.sha256(target.read_bytes()).hexdigest()
(target.parent / 'SHA256SUMS').write_text(digest + '  auto-video.zip\n')
print(f'{target.name}: {target.stat().st_size} bytes, SHA256 {digest}')
