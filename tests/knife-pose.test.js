import test from 'node:test';
import assert from 'node:assert/strict';
import {buildKnifeContactPose,cylinderContactBasis,orthonormalityError} from '../src/rig/knife-pose.js';
const close=(a,b,t=1e-10)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
const radius=v=>Math.hypot(v[1],v[2]);
test('contact frame is orthonormal for multiple positions, skews and face angles',()=>{
 for(const a of [-1,0,.7,3,Math.PI*1.75])for(const k of [-.02,0,.025]){
  const p=buildKnifeContactPose({contactAngleRad:a,edgeSkew:k,bladeFaceAngleRad:.31});
  assert.ok(orthonormalityError(p)<1e-12);
 }
});
test('parallel edge follows cylindrical axis and touches surface',()=>{
 const p=buildKnifeContactPose();
 close(p.edgeDirection[0],1);close(p.edgeDirection[1],0);close(p.edgeDirection[2],0);
 close(radius(p.edgeStart),34.5);close(radius(p.edgeEnd),34.5);
 close(p.edgeStart[0],-25);close(p.edgeEnd[0],25);
});
test('axial skew changes thickness/contact radius across daikon width',()=>{
 const p=buildKnifeContactPose({edgeSkew:.04});
 close(radius(p.edgeStart),33.5);close(radius(p.edgeEnd),35.5);
 close(p.edgeMidpoint[0],0);close(radius(p.edgeMidpoint),34.5);
});
test('changing face angle rotates blade plane without moving edge',()=>{
 const a=buildKnifeContactPose({bladeFaceAngleRad:0});
 const b=buildKnifeContactPose({bladeFaceAngleRad:.4});
 assert.deepEqual(a.edgeStart,b.edgeStart);assert.deepEqual(a.edgeEnd,b.edgeEnd);
 close(a.faceRadialDot,0);close(b.faceRadialDot,Math.sin(.4));
});
test('tangency is defined in the local cylinder frame, not camera pixels',()=>{
 for(const angle of [0,.5,Math.PI,5]){
  const p=buildKnifeContactPose({contactAngleRad:angle});
  close(p.faceRadialDot,0);assert.ok(orthonormalityError(p)<1e-12);
 }
});
test('contact position rotates with the world-space cylinder normal',()=>{
 const basis=cylinderContactBasis(Math.PI/2);
 close(basis.radial[1],0);close(basis.radial[2],1);
 close(basis.tangent[1],-1);close(basis.tangent[2],0);
 const p=buildKnifeContactPose({contactAngleRad:Math.PI/2});
 close(p.edgeMidpoint[1],0);close(p.edgeMidpoint[2],34.5);
});
test('rejects invalid numeric and geometric parameters',()=>{
 for(const bad of [{contactRadius:0},{daikonWidth:0},{edgeSkew:100},
 {bladeFaceAngleRad:Math.PI},{contactAngleRad:NaN},{handleOffset:-1}])
  assert.throws(()=>buildKnifeContactPose(bad),RangeError);
});
test('pose contains independent model anchors and never claims a fixed real-world angle',()=>{
 const p=buildKnifeContactPose({bladeFaceAngleRad:.2});
 close(p.bladeFaceAngleRad,.2);
 assert.ok(p.handleAnchor.every(Number.isFinite));
 assert.ok(p.bladeFaceUpperStart.every(Number.isFinite));
});
