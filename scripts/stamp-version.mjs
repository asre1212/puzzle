// Deterministic cache revision: every changed app asset creates a new offline release.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const dir=new URL('../dist/',import.meta.url),sw=new URL('sw.js',dir),pattern=/wordgarden-shell-[a-z0-9]+/g;
const hash=createHash('sha256');
for(const file of fs.readdirSync(dir).sort()){
 const url=new URL(file,dir);if(!fs.statSync(url).isFile())continue;
 hash.update(file);hash.update(file==='sw.js'?fs.readFileSync(url,'utf8').replace(pattern,'wordgarden-shell-REVISION'):fs.readFileSync(url));
}
const revision=hash.digest('hex').slice(0,12);
fs.writeFileSync(sw,fs.readFileSync(sw,'utf8').replace(/const CACHE='wordgarden-shell-[a-z0-9]+'/ ,"const CACHE='wordgarden-shell-"+revision+"'"));
console.log('Offline release:',revision);
