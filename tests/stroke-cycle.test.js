import test from 'node:test';
import assert from 'node:assert/strict';
import {createStrokeCycleState, advanceStrokeCycle, PROFILE_ID} from '../src/physics/stroke-cycle.js';
import {createDaikon,cutSweep,remainingVolume} from '../src/physics/surface.js';
const approx=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol, String(a)+' not near '+String(b));
const config={upDurationSeconds:.5,returnDurationSeconds:.4,upAngularSpeedRadPerSecond:2};
test('initial state identifies uncalibrated technique profile',()=>{
 const s=createStrokeCycleState(config);
 assert.equal(s.profileId,PROFILE_ID);assert.equal(s.phase,'upstroke');assert.equal(s.strokePosition01,0);
});
test('upstroke rotates daikon and reaches top of hypothetical travel',()=>{
 const {state,segments,deltaAngleRad}=advanceStrokeCycle(createStrokeCycleState(config),.5);
 assert.equal(segments.length,1);assert.equal(segments[0].phase,'upstroke');
 assert.equal(segments[0].cuttingCandidate,true);
 approx(segments[0].strokePositionEnd01,1);approx(deltaAngleRad,1);
 assert.equal(state.phase,'return');
});
test('return stroke does not rotate, while knife travels to bottom',()=>{
 let s=advanceStrokeCycle(createStrokeCycleState(config),.5).state;
 const r=advanceStrokeCycle(s,.4);
 approx(r.deltaAngleRad,0);approx(r.state.accumulatedRotationRad,1);
 assert.equal(r.segments[0].cuttingCandidate,false);
 approx(r.segments[0].strokePositionEnd01,0);
 assert.equal(r.state.phase,'upstroke');assert.equal(r.state.cyclesCompleted,1);
});
test('crossing boundary splits into distinct classified motions',()=>{
 const r=advanceStrokeCycle(createStrokeCycleState(config),.65);
 assert.equal(r.segments.length,2);
 assert.deepEqual(r.segments.map(x=>x.phase),['upstroke','return']);
 approx(r.segments[0].durationSeconds,.5);approx(r.segments[1].durationSeconds,.15);
 approx(r.deltaAngleRad,1);approx(r.state.strokePosition01,.625);
});
test('paused state advances neither phase, stroke nor rotation',()=>{
 const a=createStrokeCycleState(config);
 const r=advanceStrokeCycle(a,.5,{active:false});
 assert.notStrictEqual(a,r.state);assert.deepEqual(a,r.state);
 assert.deepEqual(r.segments,[]);approx(r.deltaAngleRad,0);
});
test('step size stable over repeated cycles across phase boundaries',()=>{
 const initial=createStrokeCycleState(config);
 const once=advanceStrokeCycle(initial,3.75);
 let stepped=initial;
 for(let n=0;n<375;n++)stepped=advanceStrokeCycle(stepped,.01).state;
 assert.equal(once.state.phase,stepped.phase);
 assert.equal(once.state.cyclesCompleted,stepped.cyclesCompleted);
 approx(once.state.strokePosition01,stepped.strokePosition01,1e-8);
 approx(once.state.accumulatedRotationRad,stepped.accumulatedRotationRad,1e-8);
});
test('return adds no cutSweep material removal and volume is conserved',()=>{
 const d=createDaikon();
 const first=advanceStrokeCycle(createStrokeCycleState(config),.5);
 for(const p of first.segments)if(p.deltaAngleRad>0)
   cutSweep(d,{deltaAngle:p.deltaAngleRad,bladeRadiusStart:34.3,bladeRadiusEnd:34.3});
 const before={volume:remainingVolume(d),removed:d.removedVolume,ribbon:d.ribbonLength,angle:d.angle};
 const second=advanceStrokeCycle(first.state,.4);
 for(const p of second.segments)if(p.deltaAngleRad>0)
   cutSweep(d,{deltaAngle:p.deltaAngleRad,bladeRadiusStart:34.3,bladeRadiusEnd:34.3});
 assert.deepEqual({volume:remainingVolume(d),removed:d.removedVolume,ribbon:d.ribbonLength,angle:d.angle},before);
 approx(remainingVolume(d)+d.removedVolume,Math.PI*35**2*50,1e-6);
});
test('input and parameter validation prevents undefined motion',()=>{
 assert.throws(()=>createStrokeCycleState({upDurationSeconds:0}),RangeError);
 assert.throws(()=>createStrokeCycleState({upAngularSpeedRadPerSecond:NaN}),RangeError);
 assert.throws(()=>advanceStrokeCycle(createStrokeCycleState(),-1),RangeError);
 assert.throws(()=>advanceStrokeCycle(createStrokeCycleState(),Infinity),RangeError);
 assert.throws(()=>advanceStrokeCycle({},.1),TypeError);
});
