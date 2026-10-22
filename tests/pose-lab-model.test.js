import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createPoseLabModel,POSE_LAB_DEFAULTS} from '../src/rig/pose-lab-model.js';
const close=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<t,`expected ${a}≈${b}`);
test('same model yields stable axes, noncalibrated flags and approximate contact',()=>{
 const x=createPoseLabModel();
 assert.equal(x.confirmedFromRealFrames,false);
 assert.match(x.parameterStatus,/provisional/);
 assert.equal(x.daikon.radius,35);assert.equal(x.daikon.width,50);
 assert.deepEqual(x.daikon.axisStart,[-25,0,0]);
 assert.deepEqual(x.daikon.axisEnd,[25,0,0]);
 close(Math.hypot(x.knife.edgeMidpoint[1],x.knife.edgeMidpoint[2]),34.5);
 assert.ok(x.orthonormalityError<1e-10);
});
test('ribbon is a continuous single sheet anchored exactly at the blade edge',()=>{
 const x=createPoseLabModel();
 assert.equal(x.ribbon.startsAtEdge,true);
 assert.equal(x.ribbon.points.length,(x.ribbon.columns+1)*(x.ribbon.rows+1));
 for(let k=0;k<3;k++){
  close(x.ribbon.points[0][k],x.knife.edgeStart[k]);
  close(x.ribbon.points[x.ribbon.columns][k],x.knife.edgeEnd[k]);
 }
 for(const point of x.ribbon.points)assert.ok(point.every(Number.isFinite));
});
test('independent blade-face parameter rotates plane but not cutting edge',()=>{
 const a=createPoseLabModel({bladeFaceAngleDeg:-15});
 const b=createPoseLabModel({bladeFaceAngleDeg:20});
 assert.deepEqual(a.knife.edgeStart,b.knife.edgeStart);
 assert.deepEqual(a.knife.edgeEnd,b.knife.edgeEnd);
 assert.notDeepEqual(a.knife.bladeFaceUpperStart,b.knife.bladeFaceUpperStart);
});
test('separating contact position and depth moves edge consistently',()=>{
 const a=createPoseLabModel({contactAngleDeg:-40,cutDepthMm:0});
 const b=createPoseLabModel({contactAngleDeg:-40,cutDepthMm:.7});
 close(Math.hypot(a.knife.edgeMidpoint[1],a.knife.edgeMidpoint[2]),35);
 close(Math.hypot(b.knife.edgeMidpoint[1],b.knife.edgeMidpoint[2]),34.3);
});
test('changing peel-length has no effect on knife or daikon anchors',()=>{
 const a=createPoseLabModel({ribbonLengthMm:0}),b=createPoseLabModel({ribbonLengthMm:60});
 assert.deepEqual(a.knife,b.knife);
 assert.deepEqual(a.daikon,b.daikon);
 assert.notDeepEqual(a.ribbon.points.at(-1),b.ribbon.points.at(-1));
});
test('the two stylized palms and thumb tips are model guesses, not photo landmarks',()=>{
 const model=createPoseLabModel();
 for(const hand of [model.leftHand,model.rightHand]){
  assert.equal(hand.provenance,'not_calibrated_placeholder');
  assert.equal(hand.palm.length,3);assert.equal(hand.thumb.length,3);
  assert.ok(hand.palm.every(Number.isFinite));
 }
 assert.notDeepEqual(model.leftHand.palm,model.rightHand.palm);
});
test('out-of-range fake measured angles and invalid input are rejected',()=>{
 for(const params of [
  {contactAngleDeg:90},{bladeFaceAngleDeg:60},{ribbonLengthMm:100},
  {cutDepthMm:3},{contactAngleDeg:NaN},{bladeFaceAngleDeg:Infinity}
 ])assert.throws(()=>createPoseLabModel(params),RangeError);
});
test('standalone page references same rig, three panels, and not production main.js',()=>{
 const html=readFileSync(new URL('../experiments/pose-lab.html',import.meta.url),'utf8');
 const js=readFileSync(new URL('../experiments/pose-lab.js',import.meta.url),'utf8');
 assert.match(html,/斜め正面/);
 assert.match(html,/側面/);assert.match(html,/大根の軸方向/);
 assert.match(html,/pose-lab.js/);
 assert.ok(!html.includes('src/main.js\"'));
 assert.match(js,/createPoseLabModel/);
 assert.match(js,/renderer\.render\(scene,camera\)/);
 assert.equal((js.match(/new THREE\.Scene\(/g)||[]).length,1);
});
