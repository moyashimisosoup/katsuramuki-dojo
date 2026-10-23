import {surfaceRadius} from '../physics/surface.js';
import {buildCuttingSchematic} from './schematic-layout.js';
const TWO_PI=Math.PI*2;
function fit(canvas){
 const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
 const w=Math.max(1,rect.width),h=Math.max(1,rect.height);
 const ww=Math.round(w*dpr),hh=Math.round(h*dpr);
 if(canvas.width!==ww||canvas.height!==hh){canvas.width=ww;canvas.height=hh;}
 const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);
 return {ctx,w,h};
}
function ellipse(ctx,x,y,rx,ry,color,stroke){
 ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TWO_PI);
 ctx.fillStyle=color;ctx.fill();
 if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}
}
export function drawScene(canvas,daikon,bladeRadius,animatedTime,tilt=0){
 const {ctx,w,h}=fit(canvas);ctx.clearRect(0,0,w,h);
 const scale=Math.min(w/700,h/335),ox=(w-700*scale)/2,oy=(h-335*scale)/2;
 const layout=buildCuttingSchematic(daikon,bladeRadius,tilt);
 const {leftX,rightX,centerY,screenRadius,edgeStart,edgeEnd,rows}=layout;
 ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);
 ctx.fillStyle='#f5f6ef';ctx.beginPath();ctx.roundRect(20,22,660,286,18);ctx.fill();
 ctx.strokeStyle='#e4e8dd';ctx.lineWidth=1;ctx.stroke();
 ctx.strokeStyle='#e3e7dc';ctx.lineWidth=1;
 for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(38,279-i*43);ctx.lineTo(665,279-i*43);ctx.stroke();}
 // A horizontally supported cylinder: the axial direction and the
 // full-width blade edge both run from image-left to image-right.
 const {width,radius,axialBins}=daikon.config;
 const upper=[],lower=[];
 for(let i=0;i<=axialBins;i++){
   const z=i*width/axialBins,x=leftX+(rightX-leftX)*i/axialBins;
   const r=surfaceRadius(daikon,daikon.angle,z)/radius*screenRadius;
   upper.push([x,centerY-r]);lower.push([x,centerY+r]);
 }
 const grad=ctx.createLinearGradient(0,centerY-screenRadius,0,centerY+screenRadius);
 grad.addColorStop(0,'#d2dfd1');grad.addColorStop(.23,'#fbfff7');
 grad.addColorStop(.54,'#eaf2e8');grad.addColorStop(1,'#bbcfba');
 ctx.beginPath();ctx.moveTo(...upper[0]);
 for(const p of upper.slice(1))ctx.lineTo(...p);
 for(const p of [...lower].reverse())ctx.lineTo(...p);
 ctx.closePath();ctx.fillStyle=grad;ctx.fill();
 ctx.strokeStyle='#9ab39d';ctx.lineWidth=1.5;ctx.stroke();
 // Elliptical end faces emphasize the horizontal cylinder axis.
 ellipse(ctx,leftX,centerY,13,(upper[0][1]-lower[0][1])/-2,'#eff7eb','#a5b9a3');
 ellipse(ctx,rightX,centerY,13,(upper[upper.length-1][1]-lower[lower.length-1][1])/-2,'#eef5e9','#a5b9a3');
 // The sheet is a FILLED band across the full axial blade width.
 // The first row exactly coincides with the knife edge, including tilt.
 if(rows.length>0){
   ctx.save();
   ctx.beginPath();ctx.moveTo(...rows[0].left);
   for(let i=1;i<rows.length;i++)ctx.lineTo(...rows[i].left);
   for(let i=rows.length-1;i>=0;i--)ctx.lineTo(...rows[i].right);
   ctx.closePath();
   const paper=ctx.createLinearGradient(leftX,0,rightX+30,0);
   paper.addColorStop(0,'#d6ebd8');paper.addColorStop(.48,'#fafff6');
   paper.addColorStop(1,'#c4ddc7');
   ctx.fillStyle=paper;ctx.shadowColor='#597d6550';ctx.shadowBlur=7;ctx.shadowOffsetY=6;ctx.fill();
   ctx.shadowBlur=0;ctx.shadowOffsetY=0;
   ctx.strokeStyle='#9fbea3';ctx.lineWidth=1.3;ctx.stroke();
   // Fine longitudinal fold is for legibility, not a force simulation.
   ctx.beginPath();
   ctx.moveTo((edgeStart[0]+edgeEnd[0])/2,(edgeStart[1]+edgeEnd[1])/2);
   for(let i=1;i<rows.length;i++){
     const row=rows[i];ctx.lineTo((row.left[0]+row.right[0])/2,(row.left[1]+row.right[1])/2);
   }
   ctx.strokeStyle='#ffffffe3';ctx.lineWidth=2;ctx.stroke();ctx.restore();
   const end=rows[rows.length-1];
   ctx.fillStyle='#688a74';ctx.font='600 12px system-ui';
   ctx.fillText('一枚の薄片',rightX+37,Math.min(305,(end.right[1]+end.left[1])/2+12));
 }
 // Knife face and visible edge are tied to EXACTLY the same contact endpoints.
 const faceH=30;
 ctx.beginPath();ctx.moveTo(...edgeStart);ctx.lineTo(...edgeEnd);
 ctx.lineTo(edgeEnd[0],edgeEnd[1]-faceH);
 ctx.lineTo(edgeStart[0],edgeStart[1]-faceH);
 ctx.closePath();
 const steel=ctx.createLinearGradient(0,edgeEnd[1]-faceH,0,edgeEnd[1]);
 steel.addColorStop(0,'#9fb3bb');steel.addColorStop(1,'#e3edf0');
 ctx.fillStyle=steel;ctx.strokeStyle='#647f85';ctx.lineWidth=1.2;
 ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.moveTo(...edgeStart);ctx.lineTo(...edgeEnd);
 ctx.strokeStyle='#54747b';ctx.lineWidth=3.2;ctx.stroke();
 ctx.beginPath();ctx.moveTo(edgeStart[0],edgeStart[1]-1.3);ctx.lineTo(edgeEnd[0],edgeEnd[1]-1.3);
 ctx.strokeStyle='#faffff';ctx.lineWidth=1.2;ctx.stroke();
 // Handle is an intentionally schematic continuation of the blade.
 const handleY=edgeEnd[1]-faceH*.53;
 ctx.fillStyle='#667d70';ctx.beginPath();ctx.roundRect(rightX+6,handleY-6,92,15,6);ctx.fill();
 ctx.fillStyle='#4d665b';ctx.beginPath();ctx.roundRect(rightX+81,handleY-11,19,25,5);ctx.fill();
 // Contact mark and rotation indication.
 ctx.fillStyle='#557c63';ctx.beginPath();ctx.arc(edgeStart[0],edgeStart[1],3.5,0,TWO_PI);ctx.fill();
 ctx.fillStyle='#61806b';ctx.font='600 12px system-ui';
 ctx.fillText('大根の回転（模式）',160,46);
 ctx.strokeStyle='#8dab91';ctx.lineWidth=2;ctx.beginPath();ctx.arc(leftX,centerY,83,Math.PI*1.1,Math.PI*1.62);ctx.stroke();
 ctx.beginPath();ctx.moveTo(169,61);ctx.lineTo(181,55);ctx.lineTo(177,68);ctx.fillStyle='#8dab91';ctx.fill();
 ctx.fillStyle='#789084';ctx.font='12px system-ui';
 ctx.fillText('切れ刃＝薄片の根元',410,235);
 ctx.fillStyle='#899a8d';ctx.font='11px system-ui';ctx.fillText('2D模式図・手指は省略',44,295);
 ctx.restore();
}
export function drawSurface(canvas,d){
 const {ctx,w,h}=fit(canvas);ctx.clearRect(0,0,w,h);
 const pad=7,pw=w-pad*2,ph=h-pad*2;
 ctx.fillStyle='#e7eada';ctx.fillRect(pad,pad,pw,ph);
 const steps=Math.min(256,d.config.angularBins);
 for(let i=0;i<steps;i++){
   const phi=TWO_PI*(i+.5)/steps,dx=pad+i*pw/steps,colw=pw/steps+.2;
   for(let z=0;z<d.config.axialBins;z++){
     const depth=d.config.radius-surfaceRadius(d,phi,(z+.5)*d.config.width/d.config.axialBins);
     const rate=Math.min(1,depth/15);
     const red=Math.round(225-rate*135),green=Math.round(231-rate*95),blue=Math.round(215-rate*112);
     ctx.fillStyle=`rgb(${red} ${green} ${blue})`;
     ctx.fillRect(dx,pad+z*ph/d.config.axialBins,colw,ph/d.config.axialBins+.2);
   }
 }
 ctx.strokeStyle='#c9d5c6';ctx.strokeRect(pad,pad,pw,ph);
}
