/** R0 fallback view-only layout. A handheld sidewall-cut *schematic*,
 * not measured knife pose or anatomical reconstruction. R0 physics is the
 * authority for remaining material and visible currentRibbonLength.
 * All positions are in a normalized 700x335 canvas coordinate system.
 */
export function buildCuttingSchematic(daikon,bladeRadius,tilt=0){
  const {radius,width}=daikon.config;
  if(!Number.isFinite(bladeRadius)||!Number.isFinite(tilt)||
      !Number.isFinite(daikon.currentRibbonLength)||
      radius<=0||width<=0)throw new RangeError('Invalid R0 diagram state');
  const leftX=144,rightX=358,centerY=140,screenRadius=61;
  const cuttingY=z=>centerY+(bladeRadius+tilt*(z-width/2))/radius*screenRadius;
  const edgeStart=[leftX,cuttingY(0)],edgeEnd=[rightX,cuttingY(width)];
  // A complete sheet starts at exactly the two displayed cutting-edge ends.
  // We never use historical ribbonLength to resurrect a broken current sheet.
  const visible=daikon.currentRibbonLength>1e-4;
  const rows=[];
  if(visible){
    const travel=Math.min(79,14+Math.sqrt(daikon.currentRibbonLength)*4.5);
    for(let i=0;i<=16;i++){
      const t=i/16;
      const drift=13*t+5*Math.sin(Math.PI*t);
      const down=travel*t+4*Math.sin(Math.PI*t)*t;
      rows.push({
        left:[edgeStart[0]+drift,edgeStart[1]+down],
        right:[edgeEnd[0]+drift,edgeEnd[1]+down]
      });
    }
  }
  return {
    leftX,rightX,centerY,screenRadius,
    edgeStart,edgeEnd,rows,
    currentSheetVisible:visible,
    // Default 3D and fallback must not assert a real chef-grip measurement.
    measuredHandPose:false,schematicOnly:true
  };
}
