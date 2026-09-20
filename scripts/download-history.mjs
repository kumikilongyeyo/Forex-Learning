import { getHistoricalRates } from 'dukascopy-node';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const sample=process.argv.includes('--sample');
const all=process.argv.includes('--all');
if(!sample&&!all){console.error('Use --sample or --all');process.exit(1);}
const pairs=all?['eurusd','gbpusd','usdjpy','audusd','usdcad','usdchf']:['eurusd','gbpusd','usdjpy'];
const timeframe='h1';
const years=[2020,2021,2022,2023,2024,2025];
const outDir=join(process.cwd(),'public','data');await mkdir(outDir,{recursive:true});
const manifest={generatedAt:new Date().toISOString(),provider:'Dukascopy via dukascopy-node 1.50.0',timezone:'UTC source; UI converts to Asia/Manila',datasets:[]};

for(const pair of pairs){
  const merged=[];
  for(const year of years){
    const from=new Date(`${year}-01-01T00:00:00Z`);
    const to=new Date(`${year+1}-01-01T00:00:00Z`);
    console.log(`Downloading ${pair.toUpperCase()} ${year} ${timeframe}…`);
    const rows=await getHistoricalRates({instrument:pair,dates:{from,to},timeframe,format:'json'});
    for(const r of rows){
      const timestamp=typeof r.timestamp==='number'?r.timestamp:Date.parse(r.timestamp);
      if(!Number.isFinite(timestamp)) continue;
      const open=Number(r.open),high=Number(r.high),low=Number(r.low),close=Number(r.close);
      if([open,high,low,close].every(Number.isFinite)) merged.push({timestamp,open,high,low,close,volume:Number(r.volume??r.tickVolume??0)});
    }
  }
  merged.sort((a,b)=>a.timestamp-b.timestamp);
  const filename=`${pair.toUpperCase()}-${timeframe.toUpperCase()}-2020-2025.json`;
  await writeFile(join(outDir,filename),JSON.stringify(merged));
  manifest.datasets.push({pair:pair.toUpperCase().replace(/(.{3})(.{3})/,'$1/$2'),timeframe:timeframe.toUpperCase(),from:2020,to:2025,candles:merged.length,path:`./public/data/${filename}`});
}
await writeFile(join(outDir,'manifest.json'),JSON.stringify(manifest,null,2));
console.log(`Done. ${manifest.datasets.length} datasets written to public/data/.`);
