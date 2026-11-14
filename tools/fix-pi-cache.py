#!/usr/bin/env python3
"""Apply the narrow directory-HTML cache fix to the existing Pi web server."""
import subprocess
script=r'''
from pathlib import Path
from datetime import datetime, timezone
from urllib.parse import urlparse
import ast, json, os, py_compile, shutil, subprocess
path=Path('/home/pi4/web/server.py');source=path.read_text()
legacy='if parsed_path == "/" or parsed_path.endswith(".html"):'
old='if parsed_path == "/" or parsed_path.endswith(".html") or parsed_path in {"/karussell", "/karussell/", "/orbit", "/orbit/"}:'
new='if parsed_path == "/" or parsed_path.endswith(".html") or parsed_path in {"/karussell", "/karussell/", "/orbit", "/orbit/", "/karussell/version.json", "/orbit/version.json"}:'
if new in source:
 print(json.dumps({'status':'already applied'}));raise SystemExit(0)
if old not in source:old=legacy
assert source.count(old)==1,'Unexpected live server source; no change made'
updated=source.replace(old,new,1)
# Exercise the actual updated end_headers method without importing the server.
tree=ast.parse(updated)
cls=next(n for n in tree.body if isinstance(n,ast.ClassDef) and n.name=='AiRadioHandler')
method=next(n for n in cls.body if isinstance(n,ast.FunctionDef) and n.name=='end_headers')
class Base:
 def send_header(self,k,v):self.headers[k]=v
 def end_headers(self):pass
 def _request_scheme(self):return 'https'
isolated=ast.fix_missing_locations(ast.Module(body=[ast.ClassDef(name='Handler',bases=[ast.Name(id='Base',ctx=ast.Load())],keywords=[],body=[method],decorator_list=[])],type_ignores=[]))
namespace={'Base':Base,'urlparse':urlparse};exec(compile(isolated,'cache-policy','exec'),namespace)
for route in ['/', '/karussell/', '/karussell', '/orbit/', '/orbit', '/karussell/index.html', '/orbit/version.json', '/karussell/version.json']:
 handler=namespace['Handler']();handler.path=route;handler.headers={};handler.end_headers();assert 'no-store' in handler.headers['Cache-Control'],route
for route in ['/karussell/assets/index-test.js','/stream.mp3','/api/health']:
 handler=namespace['Handler']();handler.path=route;handler.headers={};handler.end_headers();assert 'Cache-Control' not in handler.headers,route
stamp=datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
backup=Path('/home/pi4/deploy-backups')/('cache-policy-'+stamp);backup.mkdir(parents=True)
shutil.copy2(path,backup/'server.py')
staged=path.with_name('.server-cache-'+stamp+'.py');staged.write_text(updated);os.chmod(staged,path.stat().st_mode&0o777)
py_compile.compile(str(staged),cfile=str(backup/'syntax-check.pyc'),doraise=True)
os.replace(staged,path)
result=subprocess.run(['sudo','-n','systemctl','restart','ai-radio-web.service'],capture_output=True,text=True)
if result.returncode:
 shutil.copy2(backup/'server.py',path)
 raise RuntimeError('Server restart failed; original file restored: '+result.stderr)
subprocess.run(['systemctl','is-active','--quiet','ai-radio-web.service'],check=True)
print(json.dumps({'status':'applied','backup':str(backup),'tested_cache_routes':11}))
'''
subprocess.run(['ssh','-o','BatchMode=yes','pi4','python3 -'],input=script,text=True,check=True)
