from pathlib import Path
import tempfile,zipfile,subprocess,json,time,shutil
root=Path(__file__).resolve().parent.parent
archive=root/'entrega/sr-navalha-arte-do-ritual.zip';dest=Path(tempfile.mkdtemp(prefix='sr-ritual-entrega-'));server=None
try:
 with zipfile.ZipFile(archive)as z:
  corrupt=z.testzip();z.extractall(dest)
 server=subprocess.Popen(['python3','-m','http.server','8034','--bind','127.0.0.1','--directory',str(dest/'sr-navalha')],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(.4)
 run=subprocess.run(['node','scripts/test-zip.mjs'],cwd=root,capture_output=True,text=True,timeout=60)
 result={'zipIntegrity':corrupt is None,'extractedOutsideRepository':True,'browserExit':run.returncode,'output':run.stdout,'error':run.stderr}
 (root/'docs/ritual/zip-validacao.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False,indent=2))
finally:
 if server:server.terminate();server.wait(timeout=5)
 shutil.rmtree(dest)
