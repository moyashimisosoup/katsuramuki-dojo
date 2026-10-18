import test from 'node:test';
import assert from 'node:assert/strict';
import {createDaikon,cutSweep,surfaceRadius,remainingVolume} from '../src/physics/surface.js';
const PI=Math.PI;
const close=(a,b,tol=1e-7)=>assert.ok(Math.abs(a-b)<=tol,`${a} != ${b} within ${tol}`);
const cylinder=(r,w)=>PI*r*r*w;

test('full circle has exact ring volume, uniform thickness and ribbon length',()=>{
 const d=createDaikon(),events=cutSweep(d,{deltaAngle:2*PI,bladeRadiusStart:34});
 close(d.removedVolume,cylinder(35,50)-cylinder(34,50),1e-6);
 close(d.ribbonVolume,d.removedVolume);
 close(d.ribbonLength,2*PI*34.5,1e-6);
 assert.ok(events.length && events.every(e=>e.fullWidth && e.topThickness===1 && e.bottomThickness===1));
 close(surfaceRadius(d,.5,10),34);close(surfaceRadius(d,5,40),34);
 close(remainingVolume(d)+d.removedVolume,cylinder(35,50),1e-6);
});
test('partial angular sweep touches only its own material sector',()=>{
 const d=createDaikon();cutSweep(d,{deltaAngle:PI/7,bladeRadiusStart:34});
 close(d.removedVolume,.5*(35**2-34**2)*(PI/7)*50,1e-7);
 close(surfaceRadius(d,.12,15),34);close(surfaceRadius(d,.9,15),35);
 close(remainingVolume(d)+d.removedVolume,cylinder(35,50),1e-7);
});
test('repeating a cut at the same radius removes nothing new',()=>{
 const d=createDaikon();
 cutSweep(d,{deltaAngle:.05,bladeRadiusStart:34.5});cutSweep(d,{deltaAngle:-.05});
 const volume=d.removedVolume;
 cutSweep(d,{deltaAngle:.05,bladeRadiusStart:34.5});close(d.removedVolume,volume);
 cutSweep(d,{deltaAngle:-.05});
 cutSweep(d,{deltaAngle:.05,bladeRadiusStart:34});
 close(d.removedVolume,.5*(35**2-34**2)*.05*50,1e-7);
});
test('stationary, disengaged, reverse and misses do not remove material',()=>{
 const d=createDaikon();
 cutSweep(d,{deltaAngle:0,bladeRadiusStart:30});
 cutSweep(d,{deltaAngle:2,engaged:false,bladeRadiusStart:30});
 cutSweep(d,{deltaAngle:-1,bladeRadiusStart:30});
 cutSweep(d,{deltaAngle:1,bladeRadiusStart:36});
 close(d.removedVolume,0);close(d.ribbonLength,0);close(surfaceRadius(d,1.5,25),35);
});
test('blade tilt creates an axial thickness gradient, with mass conservation',()=>{
 const d=createDaikon();cutSweep(d,{deltaAngle:PI,bladeRadiusStart:34,tilt:.02});
 assert.ok(d.ribbonSections[0].topThickness>d.ribbonSections[0].bottomThickness);
 assert.ok(d.ribbonSections.every(e=>e.fullWidth));
 close(d.ribbonVolume,d.removedVolume);close(d.scrapVolume,0);
 close(remainingVolume(d)+d.removedVolume,cylinder(35,50),1e-6);
});
test('partial-width cuts are classified as scraps, not ribbon',()=>{
 const d=createDaikon(),ev=cutSweep(d,{deltaAngle:.25,bladeRadiusStart:34.75,tilt:.04});
 assert.ok(ev.length>0 && ev.every(e=>e.type==='scrap'));
 close(d.ribbonLength,0);close(d.scrapVolume,d.removedVolume);
});
test('minimum radius prevents excessive material removal',()=>{
 const d=createDaikon({radius:35,minRadius:8});
 cutSweep(d,{deltaAngle:2*PI,bladeRadiusStart:-200});
 for(const phi of [.1,1,2,5])close(surfaceRadius(d,phi,30),8);
 close(d.removedVolume,cylinder(35,50)-cylinder(8,50),1e-6);
});
test('fast blade sweep does not skip angular bins',()=>{
 const d=createDaikon({angularBins:128});
 cutSweep(d,{deltaAngle:2*PI,bladeRadiusStart:34.5});
 for(let i=0;i<128;i++)close(surfaceRadius(d,(i+.5)*2*PI/128,25),34.5);
});
test('second revolution removes the second shell only',()=>{
 const d=createDaikon();
 cutSweep(d,{deltaAngle:2*PI,bladeRadiusStart:34});
 cutSweep(d,{deltaAngle:2*PI,bladeRadiusStart:33.5});
 close(d.removedVolume,cylinder(35,50)-cylinder(33.5,50),1e-6);
 close(d.ribbonVolume+d.scrapVolume,d.removedVolume,1e-7);
});
test('equivalent constant-edge chunking produces matching volumes and lengths',()=>{
 const a=createDaikon(),b=createDaikon();
 cutSweep(a,{deltaAngle:2,bladeRadiusStart:34});
 for(let i=0;i<200;i++)cutSweep(b,{deltaAngle:.01,bladeRadiusStart:34});
 close(a.removedVolume,b.removedVolume,1e-7);
 close(a.ribbonLength,b.ribbonLength,1e-7);
 close(surfaceRadius(a,1.33,10),surfaceRadius(b,1.33,10));
});
test('invalid dimensions and nonfinite/overlarge motion are rejected',()=>{
 const d=createDaikon();
 assert.throws(()=>cutSweep(d,{deltaAngle:NaN}),RangeError);
 assert.throws(()=>cutSweep(d,{deltaAngle:20}),RangeError);
 assert.throws(()=>cutSweep(d,{deltaAngle:1,bladeRadiusStart:Infinity}),RangeError);
 assert.throws(()=>createDaikon({radius:-1}),RangeError);
});
test('constant-depth analytic volume is independent of angular bin count',()=>{
 const volumes=[];
 for(const angularBins of [16,32,64,256,512]){
  const d=createDaikon({angularBins});
  cutSweep(d,{deltaAngle:PI*1.4,bladeRadiusStart:34.2});
  volumes.push(d.removedVolume);
 }
 for(const v of volumes)close(v,volumes[0],1e-6);
});
