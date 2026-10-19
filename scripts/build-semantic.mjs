const {pipeline}=await import(process.env.TRANSFORMERS_MODULE || '@huggingface/transformers');
import fs from 'node:fs';
// Keep vocabulary and targets stable: saved puzzles depend on this pack.
const targets='apple ocean forest mountain river garden flower bird dog cat horse fish bread cheese coffee tea music dance painting book school teacher doctor hospital kitchen window chair table bicycle train airplane boat road bridge city village beach island desert snow rain wind cloud fire water earth moon star sun light shadow dream sleep smile family friend child mother father love peace home house castle king queen money gold silver stone glass paper pencil camera phone computer clock shoe shirt hat coat tree leaf grass fruit lemon orange banana potato carrot honey sugar salt pepper cake soup rice egg milk butter lion tiger elephant monkey bear wolf fox rabbit mouse snake spider butterfly bee'.split(' ');
const vocab=[...new Set([...fs.readFileSync('/tmp/semantic-build/vocabulary.txt','utf8').split(/\s+/).filter(w=>/^[a-z]{2,20}$/.test(w)).slice(0,6000),...targets])].sort();
const model=await pipeline('feature-extraction','Xenova/all-MiniLM-L6-v2',{dtype:'q8'});
const vectors=[];
for(let i=0;i<vocab.length;i+=64){const output=await model(vocab.slice(i,i+64),{pooling:'mean',normalize:true});vectors.push(...output.tolist());if(i%640===0)console.log(i+'/'+vocab.length);}
fs.writeFileSync('/tmp/semantic-build/vectors.json',JSON.stringify({targets,vocab,vectors}));
console.log('Embeddings complete');
