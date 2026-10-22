/**
 * APP-022 pose evidence gates.
 *
 * Source photos and video frames remain third-party work linked by URL.
 * This module does not infer 3D angles or physical contacts from a 2D photo.
 * A successful automatic gate only means "ready for HUMAN 3D pose review".
 */
export const LANDMARKS = Object.freeze([
  'daikonAxisStart', 'daikonAxisEnd',
  'bladeEdgeHeel', 'bladeEdgeTip',
  'leftThumb', 'rightThumb',
  'bladeSideContact', 'ribbonOrigin'
]);
export const REVIEW_ROUNDS = Object.freeze(['grip', 'contact', 'cross_view']);
export const TECHNIQUE_PROFILES = Object.freeze(['tsuji_horizontal', 'shimatani_upright', 'kyoto_2025_demo']);
const ACCEPTED = new Set(['pass', 'fail', 'unknown']);
const POSSIBLE = new Set(['yes', 'no', 'unknown']);
const EPS = 1e-9;
const pointValid = p => p === null || (Array.isArray(p) && p.length === 2 &&
  p.every(n => Number.isFinite(n) && n >= 0 && n <= 1));
function projectedAngle(a,b,c,d) {
  if (![a,b,c,d].every(Array.isArray)) return null;
  const u=[b[0]-a[0],b[1]-a[1]],v=[d[0]-c[0],d[1]-c[1]];
  const lu=Math.hypot(...u),lv=Math.hypot(...v);
  if (lu<EPS||lv<EPS) return null;
  const cos=Math.min(1,Math.max(0,Math.abs((u[0]*v[0]+u[1]*v[1])/(lu*lv))));
  return Math.acos(cos)*180/Math.PI;
}
export function reviewPoseEvidence(record) {
  if (!record || typeof record !== 'object' || !TECHNIQUE_PROFILES.includes(record.techniqueProfile) ||
      !['photo','video'].includes(record.mediaType) || typeof record.sourceUrl!=='string' ||
      !/^https:\/\//.test(record.sourceUrl) || !Array.isArray(record.reviewedFrames) ||
      typeof record.actualVisualInspected!=='boolean') {
    throw new TypeError('Invalid pose evidence metadata');
  }
  if (!record.landmarks || typeof record.landmarks!=='object' ||
      LANDMARKS.some(key => !(key in record.landmarks) || !pointValid(record.landmarks[key]))) {
    throw new RangeError('Every landmark must be null or a normalized [x,y] point');
  }
  if (!record.claims || !['handHeld','leftHandDaikon','rightHandKnife','thumbControl',
      'sidewallEdgeContact','ribbonContactContinuity'].every(key=>ACCEPTED.has(record.claims[key])) ||
      !['boardSupportsDaikon','endFaceCut','ribbonFloatingFromBladeFace'].every(key=>POSSIBLE.has(record.claims[key]))) {
    throw new TypeError('Claims must have three-state evidence');
  }
  if (!record.reviews || REVIEW_ROUNDS.some(key=>
      !record.reviews[key] || !ACCEPTED.has(record.reviews[key].status) ||
      typeof record.reviews[key].evidenceNote!=='string')) {
    throw new TypeError('Missing independent review rounds');
  }
  if (!record.reviewedFrames.every(f=>Number.isFinite(f.second)&&f.second>=0 &&
      typeof f.viewId==='string'&&f.viewId.length>0 &&
      typeof f.sourceUrl==='string'&&f.sourceUrl.startsWith('https://'))) {
    throw new TypeError('Invalid timestamped frame evidence');
  }
  const failures=[];
  if(record.claims.boardSupportsDaikon==='yes')failures.push('board_used_as_cutting_support');
  if(record.claims.endFaceCut==='yes')failures.push('cuts_end_face_not_sidewall');
  if(record.claims.ribbonFloatingFromBladeFace==='yes')failures.push('ribbon_has_no_edge_origin');
  for(const key of REVIEW_ROUNDS)if(record.reviews[key].status==='fail')failures.push('review_'+key+'_failed');
  const blockers=[];
  if(!record.actualVisualInspected)blockers.push('original_image_or_frames_not_inspected');
  if(record.mediaType==='video' && record.reviewedFrames.length<2)blockers.push('need_two_distinct_video_frames');
  if(record.mediaType==='photo' && record.reviewedFrames.length===0)blockers.push('no_timestamped_cross_view_support');
  for(const key of ['handHeld','leftHandDaikon','rightHandKnife','thumbControl',
      'sidewallEdgeContact','ribbonContactContinuity']) {
    if(record.claims[key]!=='pass')blockers.push('claim_unconfirmed_'+key);
  }
  for(const key of REVIEW_ROUNDS)if(record.reviews[key].status!=='pass' ||
      record.reviews[key].evidenceNote.trim().length<8)blockers.push('review_not_evidenced_'+key);
  for(const key of LANDMARKS)if(record.landmarks[key]===null)blockers.push('landmark_unobserved_'+key);
  const distinctViews=new Set(record.reviewedFrames.map(f=>f.viewId));
  if(distinctViews.size<2)blockers.push('independent_camera_views_not_verified');
  if(record.crossViewCalibrationVerified!==true)blockers.push('cross_view_calibration_not_verified');
  const projectedEdgeAxisAngleDeg=projectedAngle(
    record.landmarks.daikonAxisStart,record.landmarks.daikonAxisEnd,
    record.landmarks.bladeEdgeHeel,record.landmarks.bladeEdgeTip);
  return Object.freeze({
    hardReject:failures.length>0,
    readyForHuman3DReview:failures.length===0 && blockers.length===0,
    automaticallyApprovedFor3D:false,
    failures,blockers,
    projectedEdgeAxisAngleDeg,
    angleMeaning:'2D projected line angle ONLY; not blade-face or physical 3D angle'
  });
}
