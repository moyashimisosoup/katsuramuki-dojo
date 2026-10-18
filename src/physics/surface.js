/** R0 geometry: angular segments split on entry/exit, with axial radial lanes.
 * The blade supplies absolute radial positions. No calibrated force or fracture.
 * Units: game-mm and radians. State is mutated; event output is deterministic.
 */
const TWO_PI = Math.PI * 2;
const EPS = 1e-10;
const RADIUS_TOL = 1e-9;

export function createDaikon({ radius = 35, minRadius = 5, width = 50, angularBins = 256, axialBins = 12 } = {}) {
  if (![radius,minRadius,width].every(Number.isFinite) || radius <= 0 || minRadius < 0 || minRadius >= radius || width <= 0) throw new RangeError('Invalid daikon dimensions');
  if (!Number.isInteger(angularBins) || angularBins < 8 || angularBins > 4096 || !Number.isInteger(axialBins) || axialBins < 2 || axialBins > 128) throw new RangeError('Invalid grid dimensions');
  const pitch = TWO_PI / angularBins;
  const bins = Array.from({length:angularBins},(_,i)=>[{
    start:i*pitch, end:(i+1)*pitch, radii:new Float64Array(axialBins).fill(radius)
  }]);
  return {
    config:{radius,minRadius,width,angularBins,axialBins},angle:0,bins,
    removedVolume:0,ribbonVolume:0,scrapVolume:0,ribbonLength:0,
    currentRibbonLength:0,longestRibbonLength:0,ribbonSections:[],
    lastContact:null,stats:{cuts:0,scrapCuts:0}
  };
}
function normalizeAngle(phi){return ((phi%TWO_PI)+TWO_PI)%TWO_PI;}
function sameRadii(a,b){return a.every((v,i)=>Math.abs(v-b[i])<RADIUS_TOL);}
function packPieces(pieces){
  const merged=[];
  for(const part of pieces){
    const prior=merged[merged.length-1];
    if(prior && Math.abs(prior.end-part.start)<EPS && sameRadii(prior.radii,part.radii)) prior.end=part.end;
    else merged.push(part);
  }
  return merged;
}
export function surfaceRadius(daikon,phi,z){
  if(!Number.isFinite(phi)||!Number.isFinite(z)||z<0||z>daikon.config.width)throw new RangeError('Invalid material coordinate');
  const {angularBins,axialBins,width}=daikon.config,angle=normalizeAngle(phi);
  const bin=Math.min(angularBins-1,Math.floor(angle*angularBins/TWO_PI));
  const lane=Math.min(axialBins-1,Math.floor(z*axialBins/width));
  const segments=daikon.bins[bin];
  return (segments.find(p=>angle>=p.start-EPS && angle<p.end-EPS)??segments[segments.length-1]).radii[lane];
}
export function remainingVolume(daikon){
  const dz=daikon.config.width/daikon.config.axialBins;
  let volume=0;
  for(const bin of daikon.bins)for(const part of bin)
    for(const r of part.radii)volume+=0.5*r*r*(part.end-part.start)*dz;
  return volume;
}
/** Sweeps a rotating daikon past a kinematic blade.
 * For positive deltaAngle, updates only touched material sectors.
 * An adaptive split keeps partial cell overlaps exact in angle.
 * The blade path inside each split is sampled at its midpoint.
 */
export function cutSweep(daikon,{
  deltaAngle=0,engaged=true,bladeRadiusStart=daikon.config.radius,
  bladeRadiusEnd=bladeRadiusStart,tilt=0
}={}){
  if(![deltaAngle,bladeRadiusStart,bladeRadiusEnd,tilt].every(Number.isFinite))throw new RangeError('Nonfinite blade motion');
  if(Math.abs(deltaAngle)>TWO_PI+EPS)throw new RangeError('Sweep too large; substep the motion');
  if(typeof engaged!=='boolean')throw new TypeError('engaged must be boolean');
  const startAngle=daikon.angle;
  daikon.angle+=deltaAngle;
  const events=[];
  if(deltaAngle<=EPS||!engaged){
    daikon.lastContact=null;daikon.currentRibbonLength=0;return events;
  }
  const {angularBins,axialBins,width,minRadius}=daikon.config;
  const pitch=TWO_PI/angularBins,dz=width/axialBins,finish=startAngle+deltaAngle;
  let cursor=startAngle,iterations=0;
  while(cursor<finish-EPS){
    if(++iterations>angularBins+3)throw new Error('Sweep numerical guard');
    const rawBin=Math.floor((cursor+EPS)/pitch);
    const binIndex=((rawBin%angularBins)+angularBins)%angularBins;
    const worldEnd=Math.min(finish,(rawBin+1)*pitch);
    const travel=worldEnd-cursor;
    if(travel<=EPS){cursor=Math.min(finish,cursor+pitch);continue;}
    const localStart=binIndex*pitch+(cursor-rawBin*pitch);
    const localEnd=localStart+travel;
    const pieces=[];
    for(const segment of daikon.bins[binIndex]){
      const l=Math.max(segment.start,localStart),h=Math.min(segment.end,localEnd);
      if(h<=l+EPS){pieces.push(segment);continue;}
      if(segment.start<l-EPS)pieces.push({start:segment.start,end:l,radii:segment.radii});
      const fraction=(cursor+(l+h)/2-localStart-startAngle)/deltaAngle;
      const centerBlade=bladeRadiusStart+fraction*(bladeRadiusEnd-bladeRadiusStart);
      const newRadii=Float64Array.from(segment.radii),thickness=new Array(axialBins);
      let dVolume=0,fullWidth=true,meanRadius=0;
      for(let z=0;z<axialBins;z++){
        const zCenter=(z+.5)*dz-width/2;
        const target=Math.max(minRadius,centerBlade+tilt*zCenter);
        const newR=Math.min(segment.radii[z],target);
        const layer=segment.radii[z]-newR;
        thickness[z]=layer;
        if(layer<=RADIUS_TOL)fullWidth=false;
        newRadii[z]=newR;
        dVolume+=0.5*(segment.radii[z]**2-newR**2)*(h-l)*dz;
        meanRadius+=(segment.radii[z]+newR)*.5/axialBins;
      }
      pieces.push({start:l,end:h,radii:newRadii});
      if(dVolume>EPS){
        daikon.removedVolume+=dVolume;
        const section={
          materialAngle:normalizeAngle(cursor+(l+h)/2-localStart),
          deltaAngle:h-l,thickness,
          meanThickness:thickness.reduce((a,b)=>a+b,0)/axialBins,
          topThickness:thickness[0],bottomThickness:thickness[axialBins-1],
          volume:dVolume,fullWidth,length:fullWidth?meanRadius*(h-l):0
        };
        if(fullWidth){
          daikon.ribbonVolume+=dVolume;daikon.ribbonLength+=section.length;
          daikon.currentRibbonLength+=section.length;
          daikon.longestRibbonLength=Math.max(daikon.longestRibbonLength,daikon.currentRibbonLength);
          daikon.stats.cuts++;
        }else{
          daikon.scrapVolume+=dVolume;daikon.currentRibbonLength=0;daikon.stats.scrapCuts++;
        }
        daikon.ribbonSections.push(section);
        daikon.lastContact=section;
        events.push({type:fullWidth?'ribbon':'scrap',...section});
      }else{
        daikon.currentRibbonLength=0;daikon.lastContact=null;
      }
      if(segment.end>h+EPS)pieces.push({start:h,end:segment.end,radii:segment.radii});
    }
    daikon.bins[binIndex]=packPieces(pieces);
    cursor=worldEnd;
  }
  return events;
}
