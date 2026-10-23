/** View-only mesh sampling of the authoritative R0 radial field.
 * World X = daikon axis; world Y/Z = cross section. No Three.js dependency.
 * All coordinates use game-mm. The knife stays at the fixed world angle.
 */
import { surfaceRadius } from '../physics/surface.js';
export const TAU = 2 * Math.PI;
export const CONTACT_ANGLE = Math.PI * 0.33;

export function worldAngle(materialAngle, rotatedAngle, contactAngle=CONTACT_ANGLE) {
  return materialAngle - rotatedAngle + contactAngle;
}
export function radialPoint(x, radius, angle) {
  return [x, radius * Math.cos(angle), radius * Math.sin(angle)];
}

/** Creates a sampled cylinder shell and end caps. Individual angular bins use
 * their center radius for bounded GPU cost; R0 retains exact sub-bin cuts.
 */
export function buildSurfaceMeshData(daikon, { contactAngle=CONTACT_ANGLE }={}) {
  const {angularBins, axialBins, width}=daikon.config;
  const positions=[]; const normals=[]; const indices=[];
  const addVertex=(point, normal)=>{
    const i=positions.length/3;
    positions.push(...point);normals.push(...normal);
    return i;
  };
  for(let a=0;a<angularBins;a++){
    const phi0=a*TAU/angularBins,phi1=(a+1)*TAU/angularBins;
    const mid=(phi0+phi1)/2, radiusAngle=worldAngle(mid,daikon.angle,contactAngle);
    const normal=[0,Math.cos(radiusAngle),Math.sin(radiusAngle)];
    for(let z=0;z<axialBins;z++){
      const x0=-width/2+z*width/axialBins;
      const x1=-width/2+(z+1)*width/axialBins;
      const r=surfaceRadius(daikon,mid,(z+.5)*width/axialBins);
      const v0=addVertex(radialPoint(x0,r,worldAngle(phi0,daikon.angle,contactAngle)),normal);
      const v1=addVertex(radialPoint(x1,r,worldAngle(phi0,daikon.angle,contactAngle)),normal);
      const v2=addVertex(radialPoint(x0,r,worldAngle(phi1,daikon.angle,contactAngle)),normal);
      const v3=addVertex(radialPoint(x1,r,worldAngle(phi1,daikon.angle,contactAngle)),normal);
      indices.push(v0,v1,v2,v2,v1,v3);
    }
  }
  for(const end of [0,1]){
    const x=end?width/2:-width/2,edge=end?axialBins-1:0;
    const normal=end?[1,0,0]:[-1,0,0];
    const center=addVertex([x,0,0],normal);const rim=[];
    for(let a=0;a<=angularBins;a++){
      const phi=a*TAU/angularBins;
      const sample=((a%angularBins)+.5)*TAU/angularBins;
      const r=surfaceRadius(daikon,sample,(edge+.5)*width/axialBins);
      rim.push(addVertex(radialPoint(x,r,worldAngle(phi,daikon.angle,contactAngle)),normal));
    }
    for(let a=0;a<angularBins;a++)
      if(end)indices.push(center,rim[a],rim[a+1]);
      else indices.push(center,rim[a+1],rim[a]);
  }
  return {positions:new Float32Array(positions),normals:new Float32Array(normals),indices:new Uint32Array(indices)};
}

export function bladeEdgeEndpoints(daikon,bladeRadius,tilt=0,contactAngle=CONTACT_ANGLE){
  const half=daikon.config.width/2;
  return [radialPoint(-half,bladeRadius-tilt*half,contactAngle),radialPoint(half,bladeRadius+tilt*half,contactAngle)];
}
/** A connected schematic knife shape. Not measured kitchen-knife dimensions.
 * Keep the blade edge, face and handle in a single render-independent frame.
 * In particular the cylinder handle START must meet the face upper corner.
 * That avoids the previously visible gap from unrelated handle placement math.
 */
export function buildKnifeDisplayData(daikon,bladeRadius,tilt=0,{
  faceRise=13,faceDepth=11,handleLength=34
}={}){
  if(![bladeRadius,tilt,faceRise,faceDepth,handleLength].every(Number.isFinite) ||
      faceRise<=0||faceDepth<0||handleLength<=0)throw new RangeError('Invalid display knife geometry');
  const [a,b]=bladeEdgeEndpoints(daikon,bladeRadius,tilt);
  const faceAt=p=>[p[0],p[1]+faceRise,p[2]+faceDepth];
  const upperA=faceAt(a),upperB=faceAt(b);
  // The simplified handle extends axially directly from the upper heel.
  const handleStart=upperB.slice();
  const handleEnd=[upperB[0]+handleLength,upperB[1],upperB[2]];
  const handleCenter=[(handleStart[0]+handleEnd[0])/2,handleStart[1],handleStart[2]];
  return {
    bladePositions:new Float32Array([...a,...b,...upperB,...upperA]),
    bladeIndices:new Uint32Array([0,1,2,0,2,3]),
    cuttingEdgeStart:a,cuttingEdgeEnd:b,faceUpperStart:upperA,faceUpperEnd:upperB,
    handleStart,handleEnd,handleCenter,handleLength,
    calibration:'unmeasured_view_only_geometry'
  };
}

/** An uncalibrated kinematic guide path, not a gravity/cloth solver. */
export function ribbonGuidePoint(distance,contactR,contactAngle=CONTACT_ANGLE){
  // The first row of the peeled sheet is the exact blade edge. No
  // arbitrary clearance: a gap here makes the sheet appear to emerge
  // below the knife rather than separate from its cutting edge.
  const root=radialPoint(0,contactR,contactAngle);
  const s=Math.max(0,distance);
  let y,z;
  if(s<=18){y=root[1]-s*.18;z=root[2]+s*.98;}
  else if(s<=90){const t=s-18;y=root[1]-3.24-t*.87;z=root[2]+17.64+t*.32;}
  else {const t=s-90;y=Math.max(-49,root[1]-65.88)+2*Math.sin(t/13);z=root[2]+40.68+t*.48;}
  return [y,z];
}
export function buildRibbonMeshData(daikon,bladeRadius,{contactAngle=CONTACT_ANGLE,tilt=0,maxVisibleLength=156,step=3.5}={}) {
  if(![bladeRadius,contactAngle,tilt,maxVisibleLength,step].every(Number.isFinite) ||
      maxVisibleLength<0 || step<=0)throw new RangeError('Invalid ribbon presentation parameters');
  const length=Math.min(maxVisibleLength,daikon.currentRibbonLength);
  if(length<.0001)return {positions:new Float32Array(0),indices:new Uint32Array(0),length:0};
  const sections=Math.max(2,Math.ceil(length/step));
  // Each edge point inherits the *same* axial tilt as the actual blade.
  // Previously the sheet ignored tilt and started 0.5 mm off the edge.
  const [leftEdge,rightEdge]=bladeEdgeEndpoints(daikon,bladeRadius,tilt,contactAngle);
  const nominal=radialPoint(0,bladeRadius,contactAngle);
  const positions=[];const indices=[];
  for(let i=0;i<=sections;i++){
    const s=length*i/sections;
    const [guideY,guideZ]=ribbonGuidePoint(s,bladeRadius,contactAngle);
    const dy=guideY-nominal[1],dz=guideZ-nominal[2];
    positions.push(
      leftEdge[0],leftEdge[1]+dy,leftEdge[2]+dz,
      rightEdge[0],rightEdge[1]+dy,rightEdge[2]+dz
    );
    if(i<sections){const v=2*i; indices.push(v,v+1,v+2,v+1,v+3,v+2);}
  }
  return {positions:new Float32Array(positions),indices:new Uint32Array(indices),length};
}
