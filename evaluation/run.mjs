import {pipeline,env} from '@huggingface/transformers';
import {categories,MODEL} from '../public/categories.js';
import {rankMessage} from '../public/engine.js';
import {readFile,writeFile} from 'node:fs/promises';
env.cacheDir = new URL('../.cache/',import.meta.url).pathname.replace(/^\/(\w:)/,'$1');
const start=performance.now();
console.log('Loading quantized multilingual model for a real local inference evaluation.');
const embed=await pipeline('feature-extraction',MODEL,{dtype:'q8',device:'cpu'});
const references=[];
for(const category of categories){references.push({...category,vectors:(await embed(category.examples,{pooling:'mean',normalize:true})).tolist()});}
const casesFile = process.argv[2] || 'cases.json';
if (!['cases.json','holdout.json'].includes(casesFile)) throw new Error('Use cases.json or holdout.json');
const cases=JSON.parse(await readFile(new URL('./'+casesFile,import.meta.url),'utf8'));
const results=[];
const inferStart=performance.now();
for(const item of cases){
  const result=rankMessage((await embed(item.message,{pooling:'mean',normalize:true})).tolist()[0],references);
  const row={...item,actual:result.category,correct:item.expected===result.category,score:+result.scores[0].score.toFixed(4),gap:+result.gap.toFixed(4),nearest:result.scores[0].name,reason:result.reason};
  results.push(row);console.log(JSON.stringify(row));
}
const report={date:new Date().toISOString(),model:MODEL,dtype:'q8',runtime:'Transformers.js 3.8.1 / Node CPU',synthetic:true,threshold:.5,margin:.06,total:results.length,correct:results.filter(r=>r.correct).length,accepted:results.filter(r=>r.actual!=='review').length,acceptedCorrect:results.filter(r=>r.actual!=='review'&&r.correct).length,inferenceSeconds:+((performance.now()-inferStart)/1000).toFixed(2),totalSeconds:+((performance.now()-start)/1000).toFixed(2),results};
await writeFile(new URL(casesFile === 'holdout.json' ? './holdout-results.json' : './results.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(`Correct: ${report.correct}/${report.total}; accepted correctly: ${report.acceptedCorrect}/${report.accepted}. Results saved.`);
