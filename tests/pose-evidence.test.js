import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LANDMARKS,reviewPoseEvidence} from '../src/rig/pose-evidence.js';

const saved=JSON.parse(readFileSync(new URL('../data/katsuramuki_pose_review_candidates_v1.json',import.meta.url),'utf8'));
const clone=x=>structuredClone(x);
const blank=()=>clone(saved.candidates[0]);
function witnessed() {
 const p=blank();
 p.actualVisualInspected=true;
 p.mediaType='video';
 p.sourceUrl='https://www.youtube.com/watch?v=fSa0cI-9EDk';
 p.reviewedFrames=[
  {second:20,viewId:'camera-front',sourceUrl:p.sourceUrl},
  {second:21,viewId:'camera-side',sourceUrl:p.sourceUrl}
 ];
 p.crossViewCalibrationVerified=true;
 p.landmarks={daikonAxisStart:[.1,.4],daikonAxisEnd:[.9,.4],
  bladeEdgeHeel:[.2,.6],bladeEdgeTip:[.8,.6],
  leftThumb:[.7,.35],rightThumb:[.3,.61],
  bladeSideContact:[.5,.58],ribbonOrigin:[.5,.6]};
 for(const key of ['handHeld','leftHandDaikon','rightHandKnife','thumbControl',
   'sidewallEdgeContact','ribbonContactContinuity'])p.claims[key]='pass';
 for(const key of ['grip','contact','cross_view'])p.reviews[key]={status:'pass',evidenceNote:'Independent manual example evidence recorded'};
 return p;
}
test('six real-source candidates remain uninspected and not accepted',()=>{
 assert.equal(saved.candidates.length,6);
 assert.equal(saved.approvalStatus,'none');
 const ids=new Set(saved.candidates.map(x=>x.id));assert.equal(ids.size,6);
 for(const x of saved.candidates){
  const r=reviewPoseEvidence(x);
  assert.equal(r.readyForHuman3DReview,false);
  assert.equal(r.automaticallyApprovedFor3D,false);
  assert.ok(r.blockers.includes('original_image_or_frames_not_inspected'));
  assert.equal(r.projectedEdgeAxisAngleDeg,null);
 }
});
test('upright holding is a valid distinct technique profile, not automatic failure',()=>{
 const x=blank();x.techniqueProfile='shimatani_upright';
 const r=reviewPoseEvidence(x);
 assert.equal(r.hardReject,false);
 assert.equal(r.readyForHuman3DReview,false);
});
test('cutting on support board is a hard rejection distinct from visible board',()=>{
 const x=blank();x.claims.boardSupportsDaikon='yes';
 assert.deepEqual(reviewPoseEvidence(x).failures,['board_used_as_cutting_support']);
 const y=blank();y.claims.boardSupportsDaikon='no';
 assert.equal(reviewPoseEvidence(y).hardReject,false);
});
test('end-face slicing is explicitly forbidden in handheld sidewall cutting',()=>{
 const x=blank();x.claims.endFaceCut='yes';
 assert.ok(reviewPoseEvidence(x).failures.includes('cuts_end_face_not_sidewall'));
});
test('ribbon emerging from blade midface is a hard failure',()=>{
 const x=blank();x.claims.ribbonFloatingFromBladeFace='yes';
 assert.ok(reviewPoseEvidence(x).failures.includes('ribbon_has_no_edge_origin'));
});
test('projected 2D angle cannot be reported as real 3D blade angle',()=>{
 const x=witnessed();
 const r=reviewPoseEvidence(x);
 assert.ok(Math.abs(r.projectedEdgeAxisAngleDeg)<1e-9);
 assert.match(r.angleMeaning,/2D projected/);
 assert.equal(r.automaticallyApprovedFor3D,false);
 assert.equal(r.readyForHuman3DReview,true);
});
test('single-camera video is insufficient to certify cross-view geometry',()=>{
 const x=witnessed();x.reviewedFrames[1].viewId='camera-front';
 const r=reviewPoseEvidence(x);
 assert.equal(r.readyForHuman3DReview,false);
 assert.ok(r.blockers.includes('independent_camera_views_not_verified'));
});
test('manual review passes without visible anchors cannot pass the gate',()=>{
 const x=witnessed();x.landmarks.leftThumb=null;
 const r=reviewPoseEvidence(x);
 assert.equal(r.readyForHuman3DReview,false);
 assert.ok(r.blockers.includes('landmark_unobserved_leftThumb'));
});
test('review notes, three rounds and normalized anchors must be valid',()=>{
 const x=witnessed();x.landmarks.leftThumb=[1.1,0];
 assert.throws(()=>reviewPoseEvidence(x),RangeError);
 const y=witnessed();y.reviews.grip.evidenceNote='';
 assert.equal(reviewPoseEvidence(y).readyForHuman3DReview,false);
 const z=witnessed();delete z.reviews.cross_view;
 assert.throws(()=>reviewPoseEvidence(z),TypeError);
 assert.equal(LANDMARKS.length,8);
});
