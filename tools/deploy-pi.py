#!/usr/bin/env python3
"""Deploy ORBIT and the prepared carousel build to the existing Pi web server."""
import hashlib, json, pathlib, subprocess, tarfile, tempfile, sys
from datetime import datetime, timezone
ROOT=pathlib.Path(__file__).resolve().parents[1]
subprocess.run([sys.executable,str(ROOT/'tools'/'fix-pi-cache.py')],check=True)
CAROUSEL=ROOT.parent/'20260310 AI-Radio'/'karussell'/'dist-pi'
release='orbit-'+datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
remote='/home/pi4/releases/'+release
files={'orbit/index.html':ROOT/'index.html','orbit/version.json':ROOT/'version.json','orbit/THIRD-PARTY-LICENSES.txt':ROOT/'THIRD-PARTY-LICENSES.txt'}
for name in ['Barlow-OFL.txt','DMSans-OFL.txt','three-globe-LICENSE.txt']:files['orbit/assets/'+name]=ROOT/'assets'/name
for p in CAROUSEL.rglob('*'):
 if p.is_file():files['carousel/'+p.relative_to(CAROUSEL).as_posix()]=p
assert 'ai-radio.cc/orbit/' in (CAROUSEL/'assets'/next(p.name for p in (CAROUSEL/'assets').glob('*.js'))).read_text()
manifest={name:hashlib.sha256(p.read_bytes()).hexdigest() for name,p in files.items()}
subprocess.run(['ssh','-o','BatchMode=yes','pi4','mkdir -p '+remote],check=True)
with tempfile.TemporaryDirectory(prefix='orbit-deploy-') as temp:
 archive=pathlib.Path(temp)/'release.tar.gz'
 with tarfile.open(archive,'w:gz') as tar:
  for name,p in files.items():tar.add(p,arcname=name)
 manifest_file=pathlib.Path(temp)/'manifest.json';manifest_file.write_text(json.dumps(manifest,indent=2))
 subprocess.run(['scp','-q',str(archive),str(manifest_file),'pi4:'+remote+'/'],check=True)
 remote_script=r'''
import pathlib, tarfile, hashlib, json, shutil, os
release=pathlib.Path(REMOTE)
with tarfile.open(release/'release.tar.gz') as tar:tar.extractall(release,filter='data')
manifest=json.loads((release/'manifest.json').read_text())
for name,expected in manifest.items():
 actual=hashlib.sha256((release/name).read_bytes()).hexdigest()
 if actual!=expected:raise RuntimeError('Upload checksum mismatch: '+name)
web=pathlib.Path('/home/pi4/web');backup=pathlib.Path('/home/pi4/deploy-backups')/release.name
backup.mkdir(parents=True,exist_ok=False)
for app in ['orbit','karussell']:
 if (web/app).exists():shutil.copytree(web/app,backup/app)
# New hashed assets are installed first; previously served carousel assets are retained.
for source_name,target_name in [('orbit','orbit'),('carousel','karussell')]:
 source=release/source_name;target=web/target_name;target.mkdir(exist_ok=True)
 for p in source.rglob('*'):
  if not p.is_file() or p.relative_to(source).as_posix() in {'index.html','version.json'}:continue
  dst=target/p.relative_to(source);dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dst)
 temp=target/('index.html.'+release.name);shutil.copy2(source/'index.html',temp);os.replace(temp,target/'index.html')
 # Publish the version marker only after the matching HTML and assets are available.
 version_temp=target/('version.json.'+release.name);shutil.copy2(source/'version.json',version_temp);os.replace(version_temp,target/'version.json')
for name,expected in manifest.items():
 folder,relative=name.split('/',1);live=web/('karussell' if folder=='carousel' else folder)/relative
 if hashlib.sha256(live.read_bytes()).hexdigest()!=expected:raise RuntimeError('Published checksum mismatch: '+name)
print(json.dumps({'release':release.name,'backup':str(backup),'verified_files':len(manifest),'urls':['https://ai-radio.cc/orbit/','https://ai-radio.cc/karussell/']}))
'''.replace('REMOTE',repr(remote))
 result=subprocess.run(['ssh','-o','BatchMode=yes','pi4','python3 -'],input=remote_script,text=True,capture_output=True,check=True)
 print(result.stdout,end='')
 (ROOT/'deployment.json').write_text(result.stdout)
