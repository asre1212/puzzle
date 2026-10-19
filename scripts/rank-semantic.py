import json,numpy as np,base64
from pathlib import Path
x=json.load(open('/tmp/semantic-build/vectors.json'));v=x['vocab'];a=np.array(x['vectors'],dtype=np.float32);a/=np.linalg.norm(a,axis=1)[:,None]
encoded=[]
for target in x['targets']:
 scores=a@a[v.index(target)];scores[v.index(target)]=2
 order=np.argsort(-scores,kind='stable');ranks=np.empty(len(v),dtype='<u2');ranks[order]=np.arange(1,len(v)+1);encoded.append(base64.b64encode(ranks.tobytes()).decode())
 if target in ['ocean','dog','coffee']:print(target,[v[i] for i in order[:12]])
p=Path(__file__).resolve().parents[1]/'dist/semantic-data.js'
p.write_text('// Generated with Xenova/all-MiniLM-L6-v2 (q8), mean pooling, normalized cosine similarity.\nexport const vocabulary='+json.dumps(v,separators=(',',':'))+';\nexport const targets='+json.dumps(x['targets'])+';\nexport const encodedRanks='+json.dumps(encoded,separators=(',',':'))+';\n')
print(len(v),len(x['targets']),p.stat().st_size)
