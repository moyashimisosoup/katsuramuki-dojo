/** Photo-calibratable, render-independent knife frame for katsuramuki.
 * These are virtual model dimensions, NOT measured knife angles.
 * World X = daikon axis, Y up, Z depth. GLB convention:
 * local +X follows blade edge, local +Y follows face away from edge,
 * local +Z is face normal.
 */
const EPS=1e-12;
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>Math.sqrt(dot(a,a));
const scale=(v,k)=>v.map(x=>x*k);
const add=(a,b)=>a.map((x,i)=>x+b[i]);
const sub=(a,b)=>a.map((x,i)=>x-b[i]);
const normalize=v=>{const n=norm(v);if(n<EPS)throw new Error('Degenerate 3D frame');return scale(v,1/n);};
const perpendicular=(v,axis)=>normalize(sub(v,scale(axis,dot(v,axis))));
const finite=(v,name)=>{if(!Number.isFinite(v))throw new RangeError(name+' must be finite');};
export function cylinderContactBasis(contactAngleRad){
 finite(contactAngleRad,'contactAngleRad');
 return {axis:[1,0,0],radial:[0,Math.cos(contactAngleRad),Math.sin(contactAngleRad)],
   tangent:[0,-Math.sin(contactAngleRad),Math.cos(contactAngleRad)]};
}
/** bladeFaceAngleRad = blade-face angle relative to local cylinder tangent.
 * edgeSkew = difference in radial position per axial game-mm.
 * No numerical angle here is validated against real katsuramuki footage.
 */
export function buildKnifeContactPose({
 daikonWidth=50,contactRadius=34.5,contactAngleRad=Math.PI/3,
 bladeFaceAngleRad=0,edgeSkew=0,bladeFaceHeight=27,handleOffset=34
}={}){
 for(const [k,v] of Object.entries({daikonWidth,contactRadius,contactAngleRad,bladeFaceAngleRad,edgeSkew,bladeFaceHeight,handleOffset}))finite(v,k);
 if(daikonWidth<=0||contactRadius<=0||bladeFaceHeight<=0||handleOffset<0)throw new RangeError('Invalid dimensions');
 if(Math.abs(edgeSkew)*daikonWidth/2>=contactRadius)throw new RangeError('Edge outside cylinder');
 if(Math.abs(bladeFaceAngleRad)>Math.PI/2)throw new RangeError('Face angle outside parameter range');
 const basis=cylinderContactBasis(contactAngleRad);
 const pointAt=x=>[x,basis.radial[1]*(contactRadius+edgeSkew*x),basis.radial[2]*(contactRadius+edgeSkew*x)];
 const edgeStart=pointAt(-daikonWidth/2),edgeEnd=pointAt(daikonWidth/2);
 const edgeDirection=normalize(sub(edgeEnd,edgeStart));
 const nominalFace=add(scale(basis.tangent,Math.cos(bladeFaceAngleRad)),scale(basis.radial,Math.sin(bladeFaceAngleRad)));
 const bladeFaceDirection=perpendicular(nominalFace,edgeDirection);
 const bladeFaceNormal=normalize(cross(edgeDirection,bladeFaceDirection));
 const bladeFaceUpperStart=add(edgeStart,scale(bladeFaceDirection,bladeFaceHeight));
 const bladeFaceUpperEnd=add(edgeEnd,scale(bladeFaceDirection,bladeFaceHeight));
 return {edgeStart,edgeEnd,edgeMidpoint:scale(add(edgeStart,edgeEnd),.5),
   bladeFaceUpperStart,bladeFaceUpperEnd,
   handleAnchor:add(bladeFaceUpperEnd,scale(edgeDirection,handleOffset)),
   edgeDirection,bladeFaceDirection,bladeFaceNormal,
   radialNormal:basis.radial,cylinderTangent:basis.tangent,
   bladeFaceAngleRad,edgeSkew,contactAngleRad,
   faceRadialDot:dot(bladeFaceDirection,basis.radial)};
}
export function orthonormalityError(pose){
 const vs=[pose.edgeDirection,pose.bladeFaceDirection,pose.bladeFaceNormal];
 return Math.max(...vs.map(v=>Math.abs(dot(v,v)-1)),
   ...vs.flatMap((v,i)=>vs.slice(i+1).map(w=>Math.abs(dot(v,w)))));
}
