"""Create original Chinese narration with Apache-licensed Kokoro model. No cloned voice."""
import argparse,json
from pathlib import Path
import numpy as np
import soundfile as sf
import torch
from kokoro import KModel,KPipeline
from huggingface_hub import hf_hub_download
parser=argparse.ArgumentParser();parser.add_argument('--job',required=True);parser.add_argument('--out',required=True);parser.add_argument('--model-dir');args=parser.parse_args()
job=json.loads(Path(args.job).read_text());out=Path(args.out);out.mkdir(parents=True,exist_ok=True)
if any(out.iterdir()):raise RuntimeError('Voice output must be a new empty directory.')
torch.set_num_threads(4)
local=Path(args.model_dir).resolve() if args.model_dir else None
def model_file(name):
 return str(local/name) if local else hf_hub_download(repo_id=job['voice']['model'],revision=job['voice']['revision'],filename=name)
model=KModel(repo_id=job['voice']['model'],config=model_file('config.json'),model=model_file('kokoro-v1_1-zh.pth')).to('cpu').eval()
pipeline=KPipeline(lang_code='z',repo_id=job['voice']['model'],model=model,en_callable=lambda text:'')
voice_path=model_file(f"voices/{job['voice']['name']}.pt")
records=[]
for i,scene in enumerate(job['scenes']):
 for j,text in enumerate(scene['lines']):
  parts=[result.audio.numpy() for result in pipeline(text,voice=voice_path,speed=job['voice']['speed'])]
  audio=np.concatenate(parts);name=f'speech-{i}-{j}.wav';sf.write(out/name,audio,24000,subtype='PCM_16')
  records.append(dict(scene=i,line=j,text=text,file=name,duration=len(audio)/24000))
  print(f'{i+1}.{j+1}: {len(audio)/24000:.3f}s {text}',flush=True)
(out/'voice.json').write_text(json.dumps(dict(voice=job['voice'],clips=records),ensure_ascii=False,indent=2))
