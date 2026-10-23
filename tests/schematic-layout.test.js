import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createDaikon,cutSweep} from '../src/physics/surface.js';
import {buildCuttingSchematic} from '../src/view/schematic-layout.js';
const close=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} vs ${b}`);
test('2D fallback starts as horizontal cylinder without a fictitious sheet',()=>{
 const d=createDaikon(),g=buildCuttingSchematic(d,34.5);
 assert.ok(g.leftX<g.rightX);
 assert.equal(g.rows.length,0);
 assert.equal(g.currentSheetVisible,false);
 assert.equal(g.measuredHandPose,false);
 assert.equal(g.schematicOnly,true);
});
test('full-width 2D sheet begins EXACTLY at tilted blade edge',()=>{
 const d=createDaikon();
 cutSweep(d,{deltaAngle:0.7,bladeRadiusStart:34,tilt:.01});
 assert.ok(d.currentRibbonLength>0);
 for(const tilt of [-.05,0,.055]){
  const l=buildCuttingSchematic(d,34,tilt);
  assert.equal(l.rows.length,17);
  assert.deepEqual(l.rows[0].left,l.edgeStart);
  assert.deepEqual(l.rows[0].right,l.edgeEnd);
  for(const row of l.rows){
   close(row.right[0]-row.left[0],l.rightX-l.leftX);
  }
  close(l.edgeEnd[1]-l.edgeStart[1],tilt*d.config.width/d.config.radius*l.screenRadius);
 }
});
test('historical ribbon length cannot display a new free-floating strip after a break',()=>{
 const d=createDaikon();
 cutSweep(d,{deltaAngle:.6,bladeRadiusStart:34});
 assert.ok(d.ribbonLength>0);
 d.currentRibbonLength=0;
 const g=buildCuttingSchematic(d,34);
 assert.equal(g.currentSheetVisible,false);
 assert.equal(g.rows.length,0);
});
test('fallback draw code paints filled sheet and blade from the SAME layout',()=>{
 const draw=readFileSync(new URL('../src/view/draw.js',import.meta.url),'utf8');
 const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
 assert.match(draw,/buildCuttingSchematic\(daikon,bladeRadius,tilt\)/);
 assert.match(draw,/ctx\.moveTo\(\.\.\.rows\[0\]\.left\)/);
 assert.match(draw,/ctx\.moveTo\(\.\.\.edgeStart\);ctx\.lineTo\(\.\.\.edgeEnd\)/);
 assert.match(draw,/ctx\.fillStyle=paper/);
 assert.match(draw,/横向き|horizontally supported/);
 assert.match(main,/drawScene\(sceneCanvas,daikon,bladeRadius,t,Number\(\$\('tilt'\)\.value\)\)/);
});
test('fallback layout rejects nonfinite display-only inputs',()=>{
 const d=createDaikon();
 assert.throws(()=>buildCuttingSchematic(d,NaN),RangeError);
 assert.throws(()=>buildCuttingSchematic(d,34,Infinity),RangeError);
});
