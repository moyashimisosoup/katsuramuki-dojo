import {surfaceRadius} from '../physics/surface.js';
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
export function drawScene(canvas,daikon,bladeRadius,animatedTime){
 const {ctx,w,h}=fit(canvas);ctx.clearRect(0,0,w,h);
 const scale=Math.min(w/700,h/335),ox=(w-700*scale)/2,oy=(h-335*scale)/2;
 ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);
 const x=244,top=55,bot=270,initialR=75;
 ctx.fillStyle='#f5f6ef';ctx.beginPath();ctx.roundRect(20,22,660,286,18);ctx.fill();
 ctx.strokeStyle='#e4e8dd';ctx.lineWidth=1;ctx.stroke();
 ctx.strokeStyle='#e3e7dc';ctx.lineWidth=1;
 for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(40,292-i*45);ctx.lineTo(663,292-i*45);ctx.stroke();}
 ctx.fillStyle='#e1e7dc';ctx.globalAlpha=.5;ctx.fillRect(x-initialR,top,initialR*2,bot-top);ctx.globalAlpha=1;
 ctx.fillStyle='#d6e1d2';ctx.beginPath();ctx.ellipse(x,top,initialR,17,0,0,TWO_PI);ctx.fill();
 const left=[],right=[];
 for(let j=0;j<daikon.config.axialBins;j++){
   const z=daikon.config.width*(j+.5)/daikon.config.axialBins;
   const r=surfaceRadius(daikon,daikon.angle,z),y=top+(j+.5)/daikon.config.axialBins*(bot-top);
   left.push([x-r/35*initialR,y]);right.push([x+r/35*initialR,y]);
 }
 const topR=surfaceRadius(daikon,daikon.angle,0)/35*initialR;
 const bottomR=surfaceRadius(daikon,daikon.angle,daikon.config.width)/35*initialR;
 const grad=ctx.createLinearGradient(x-initialR,0,x+initialR,0);
 grad.addColorStop(0,'#c4d4c1');grad.addColorStop(.2,'#e6eee1');
 grad.addColorStop(.45,'#fffff6');grad.addColorStop(.8,'#e8eee3');grad.addColorStop(1,'#b9cdb9');
 ctx.beginPath();ctx.moveTo(x-topR,top);
 for(const p of left)ctx.lineTo(...p);ctx.lineTo(x-bottomR,bot);ctx.lineTo(x+bottomR,bot);
 for(const p of [...right].reverse())ctx.lineTo(...p);
 ctx.lineTo(x+topR,top);ctx.closePath();ctx.fillStyle=grad;ctx.fill();ctx.strokeStyle='#9ab09a';ctx.lineWidth=1.2;ctx.stroke();
 ellipse(ctx,x,top,topR,15,'#f9fbf4','#92ad95');
 ellipse(ctx,x,bot,bottomR,15,'#e3ece0','#92ad95');
 const stripAnchor=x+surfaceRadius(daikon,daikon.angle,daikon.config.width*.52)/35*initialR;
 if(daikon.ribbonLength>0){
   const lengthVisual=Math.min(270,50+Math.sqrt(daikon.currentRibbonLength)*9);
   const waviness=window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:Math.sin(animatedTime*.0015)*4;
   ctx.save();ctx.lineCap='round';ctx.shadowColor='#6d8c7244';ctx.shadowBlur=10;ctx.shadowOffsetY=6;
   ctx.strokeStyle='#d1e2d1';ctx.lineWidth=23;
   ctx.beginPath();ctx.moveTo(stripAnchor+5,177);
   ctx.bezierCurveTo(stripAnchor+54,183,370,206,430,198+waviness);
   ctx.bezierCurveTo(485,183,430+lengthVisual*.24,251,stripAnchor+lengthVisual,260+waviness);ctx.stroke();
   ctx.shadowBlur=0;ctx.shadowOffsetY=0;ctx.strokeStyle='#fbfff7';ctx.lineWidth=20;ctx.stroke();
   ctx.strokeStyle='#ffffffb4';ctx.lineWidth=2;ctx.stroke();ctx.restore();
 }
 const bx=stripAnchor-2;
 ctx.fillStyle='#b7c4cd';ctx.strokeStyle='#667d83';ctx.lineWidth=1.3;
 ctx.beginPath();ctx.moveTo(bx-10,117);ctx.lineTo(bx+105,88);
 ctx.lineTo(bx+115,104);ctx.lineTo(bx+3,157);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.strokeStyle='#f1f5f8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(bx+3,157);ctx.lineTo(bx+115,104);ctx.stroke();
 ctx.fillStyle='#8b9d91';ctx.beginPath();ctx.roundRect(bx+101,79,31,36,5);ctx.fill();
 ctx.fillStyle='#577366';ctx.font='600 12px system-ui';ctx.fillText('回転',113,45);
 ctx.strokeStyle='#8fab91';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,top,97,Math.PI*1.18,Math.PI*1.65);ctx.stroke();
 ctx.fillStyle='#8fab91';ctx.beginPath();ctx.moveTo(x+43,top-87);ctx.lineTo(x+53,top-96);ctx.lineTo(x+39,top-99);ctx.fill();
 ctx.fillStyle='#5d7b65';ctx.font='12px system-ui';ctx.fillText('むけた帯',474,278);
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
