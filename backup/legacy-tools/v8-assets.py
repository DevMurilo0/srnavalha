import json, pathlib, subprocess, urllib.request
root=pathlib.Path('.')
for p in root.glob('assets/images/*'):
 print(subprocess.getoutput('identify -format "%f %wx%h %b" '+str(p)))
