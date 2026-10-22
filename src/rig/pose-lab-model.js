/** APP-022: exploratory *single* 3D pose, shared by three cameras.
 * Dimensions, palm/thumb locations, camera angle and ribbon curvature are
 * PLACEHOLDERS, not photo-derived measurements or accepted chef technique.
 */
import {buildKnifeContactPose,orthonormalityError} from './knife-pose.js';
const RAD=Math.PI/180;
const add=(a,b)=>a.map((v,i)=>v+b[i]);
const scale=(a,s)=>a.map(v=>v*s);
const between=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
export const POSE_LAB_PROFILE='app022_tsuji_horizontal_unapproved_schematic';
export const POSE_LAB_DEFAULTS=Object.freeze({
 contactAngleDeg:-60,bladeFaceAngleDeg:0,cutDepthMm:0.5,ribbonLengthMm:38
});
export function createPoseLabModel(config={}){
 const p={...POSE_LAB_DEFAULTS,...config};
 for(const [k,v] of Object.entries(p))if(!Number.isFinite(v))throw new RangeError(k+' must be finite');
 if(p.contactAngleDeg< -85||p.contactAngleDeg> -5
   ||p.bladeFaceAngleDeg< -25||p.bladeFaceAngleDeg> 25
   ||p.cutDepthMm<0||p.cutDepthMm>2
   ||p.ribbonLengthMm<0||p.ribbonLengthMm>70)throw new RangeError('Research pose controls out of bounds');
 const radius=35,width=50;
 const knife=buildKnifeContactPose({
   daikonWidth:width,contactRadius:radius-p.cutDepthMm,
   contactAngleRad:p.contactAngleDeg*RAD,bladeFaceAngleRad:p.bladeFaceAngleDeg*RAD,
   bladeFaceHeight:28,handleOffset:34
 });
 // Attach the *placeholder* thumb to the rotating contact basis so that
 // moving the experimental cut around the cylinder does not leave it floating.
 const leftThumb=add([-19,0,0],
   add(scale(knife.radialNormal,34),scale(knife.cylinderTangent,6)));
 const leftPalm=add(leftThumb,[-22,-20,5]);
 const rightPalm=add(knife.handleAnchor,[15,-10,6]);
 const rightThumb=add(knife.handleAnchor,[-19,-2,-2]);
 const edge0=knife.edgeStart,edge1=knife.edgeEnd;
 // A continuous *one-piece* sheet. Its first row is exactly the cutting edge.
 const ribbonRows=12,ribbonColumns=8;
 const ribbonPoints=[];
 for(let j=0;j<=ribbonRows;j++){
   const t=j/ribbonRows;
   for(let i=0;i<=ribbonColumns;i++){
     const base=between(edge0,edge1,i/ribbonColumns);
     ribbonPoints.push([
       base[0]+2*t*Math.sin(i/ribbonColumns*Math.PI),
       base[1]-p.ribbonLengthMm*t,
       base[2]+12*t+4*Math.sin(Math.PI*t)
     ]);
   }
 }
 return {
   profile:POSE_LAB_PROFILE,confirmedFromRealFrames:false,
   daikon:{radius,width,axisStart:[-width/2,0,0],axisEnd:[width/2,0,0]},
   knife,ribbon:{points:ribbonPoints,rows:ribbonRows,columns:ribbonColumns,
     startsAtEdge:true,lengthParameterMm:p.ribbonLengthMm},
   // Role is fixed for the right-handed instructor profile; this does NOT
   // certify hand anatomy or literal left/right placement in camera pixels.
   leftHand:{role:'hold_and_rotate_daikon',side:'left',palm:leftPalm,thumb:leftThumb,provenance:'not_calibrated_placeholder'},
   rightHand:{role:'control_knife',side:'right',palm:rightPalm,thumb:rightThumb,provenance:'not_calibrated_placeholder'},
   parameterStatus:'ALL 3D contact, finger and material quantities provisional',
   controls:p,orthonormalityError:orthonormalityError(knife)
 };
}
