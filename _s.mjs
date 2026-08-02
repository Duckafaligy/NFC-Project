import sharp from 'sharp'; import fs from 'fs';
const D='/tmp/claude-0/-home-user-NFC-Project/07b11a8f-b30c-5979-9135-75b8c1575575/scratchpad/cards';
const files = fs.readdirSync(D).filter(f=>f.startsWith(process.env.PFX)).sort();
const W=360,H=560, tiles=[];
for (let i=0;i<files.length;i++){
  const buf=await sharp(D+'/'+files[i]).resize(W-16,H-16,{fit:'contain',background:'#ffffff'}).toBuffer();
  const m=await sharp(buf).metadata();
  tiles.push({input:buf,left:i*W+8+Math.floor((W-16-m.width)/2),top:8+Math.floor((H-16-m.height)/2)});
}
await sharp({create:{width:files.length*W,height:H,channels:3,background:'#bbbbbb'}}).composite(tiles).jpeg({quality:90}).toFile(D+'/sheet-'+process.env.PFX+'.jpg');
console.log(files.join(' '));
