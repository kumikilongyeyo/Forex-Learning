import { spawnSync } from 'node:child_process';

function run(cmd,args){
  const r=spawnSync(cmd,args,{stdio:'inherit',shell:process.platform==='win32'});
  if(r.status!==0) process.exit(r.status??1);
}
console.log('Updating Forex Lab PH…');
run('git',['pull','--ff-only']);
run('npm',['install','--no-audit','--no-fund']);
run('npm',['run','check']);
console.log('Update complete. Your downloaded historical data and browser progress are preserved.');
