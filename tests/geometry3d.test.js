import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createDaikon,cutSweep} from '../src/physics/surface.js';
import {buildSurfaceMeshData,bladeEdgeEndpoints,buildRibbonMeshData,worldAngle,CONTACT_ANGLE} from '../src/view3d/geometry.js';
const close=(v,w,tol=1e-5)=>assert.ok(Math.abs(v-w)<tol,`${v} != ${w}`);
test('R0 initial surface is finite, with fixed triangles and capped mesh',()=>{
 const d=createDaikon();const m=buildSurfaceMeshData(d);
 assert.equal(m.positions.length,(256*12*4+(256+2)*2)*3);
 assert.equal(m.indices.length,(256*12*2+256*2)*3);
 assert.ok(m.positions.every(Number.isFinite));
 assert.ok(m.normals.every(Number.isFinite));
 assert.ok(m.indices.every(i=>i<m.positions.length/3));
});
test('all radial shell points fall inside initial radius',()=>{
 const d=createDaikon();cutSweep(d,{deltaAngle:Math.PI,bladeRadiusStart:33.5});
 const m=buildSurfaceMeshData(d);const sideCount=256*12*4;
 for(let i=0;i<sideCount;i++){
  const y=m.positions[i*3+1],z=m.positions[i*3+2];
  assert.ok(Math.hypot(y,z)<=35.00001);
 }
});
test('blade at contact angle and tilt follows axial radial slope',()=>{
 const d=createDaikon();const [left,right]=bladeEdgeEndpoints(d,34,0.02);
 close(left[0],-25);close(right[0],25);
 close(Math.hypot(left[1],left[2]),33.5);
 close(Math.hypot(right[1],right[2]),34.5);
 close(Math.atan2(right[2],right[1]),CONTACT_ANGLE);
});
test('rotating material coordinates leave the world blade contact fixed',()=>{
 const d=createDaikon();d.angle=1.234;
 close(worldAngle(d.angle,d.angle),CONTACT_ANGLE);
});
test('ribbon is wide and has no visible geometry before full-width cut',()=>{
 const d=createDaikon();assert.equal(buildRibbonMeshData(d,35).length,0);
 cutSweep(d,{deltaAngle:0.6,bladeRadiusStart:34});
 const m=buildRibbonMeshData(d,34);
 assert.ok(m.length>0);
 close(m.positions[0],-25);close(m.positions[3],25);
 assert.ok(m.indices.length>0);
 assert.ok(m.positions.every(Number.isFinite));
});
test('partial-width material removal does not display a continuous ribbon',()=>{
 const d=createDaikon();cutSweep(d,{deltaAngle:.5,bladeRadiusStart:34.75,tilt:.04});
 assert.equal(d.ribbonLength,0);assert.equal(buildRibbonMeshData(d,34.5).length,0);
});
test('max ribbon segment count stays bounded for long sessions',()=>{
 const d=createDaikon();d.currentRibbonLength=10000;
 const m=buildRibbonMeshData(d,31);
 assert.equal(m.length,156);assert.ok(m.positions.length<1000);
});

test('3D peel sheet starts at the real knife edge, even with axial blade tilt',()=>{
 const d=createDaikon();
 cutSweep(d,{deltaAngle:.45,bladeRadiusStart:34,tilt:.015});
 assert.ok(d.currentRibbonLength>0);
 for(const tilt of [-.045,0,.04]){
  for(const contactAngle of [.45,CONTACT_ANGLE,1.45]){
   const r=buildRibbonMeshData(d,34,{tilt,contactAngle});
   const [start,end]=bladeEdgeEndpoints(d,34,tilt,contactAngle);
   assert.ok(r.length>0);
   for(let k=0;k<3;k++){
    close(r.positions[k],start[k],.00001);
    close(r.positions[k+3],end[k],.00001);
   }
   for(let i=0;i<r.positions.length;i+=6){
    // A full-width sheet keeps its 50-game-mm axial span throughout.
    close(r.positions[i+3]-r.positions[i],d.config.width,.00001);
    assert.ok(Number.isFinite(r.positions[i+1]));
    assert.ok(Number.isFinite(r.positions[i+2]));
   }
  }
 }
});
test('3D ribbon disappears on break even when historical ribbon length remains positive',()=>{
 const d=createDaikon();
 cutSweep(d,{deltaAngle:.5,bladeRadiusStart:34});
 assert.ok(d.ribbonLength>0);
 d.currentRibbonLength=0;
 const r=buildRibbonMeshData(d,34);
 assert.equal(r.length,0);
 assert.equal(r.positions.length,0);
});
test('3D ribbon rejects nonsensical view-only parameters rather than hiding cutting gaps',()=>{
 const d=createDaikon();
 d.currentRibbonLength=10;
 assert.throws(()=>buildRibbonMeshData(d,34,{tilt:NaN}),RangeError);
 assert.throws(()=>buildRibbonMeshData(d,34,{step:0}),RangeError);
});
