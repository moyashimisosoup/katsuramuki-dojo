import {createDaikon,cutSweep,remainingVolume} from './physics/surface.js';
import {drawScene,drawSurface} from './view/draw.js';
const $=id=>document.getElementById(id);
let sceneCanvas=$('scene'),view3D=null,cameraMode='main';
let daikon=createDaikon(),state='ready',bladeRadius=34.5,elapsed=0,last=0,acc=0;
const DT=1/60,DURATION=30;
const initialVolume=Math.PI*daikon.config.radius**2*daikon.config.width;
function refreshControls(){
 $('feed-value').textContent=Number($('feed').value).toFixed(2)+' mm/回転';
 $('tilt-value').textContent=Number($('tilt').value).toFixed(3);
 $('speed-value').textContent=Number($('speed').value).toFixed(1)+' rad/秒';
}
function updateStatus(){
 $('status').textContent=state==='playing'?'むいています':state==='paused'?'一時停止':state==='ended'?'30秒終了':'準備完了';
 $('toggle').textContent=state==='playing'?'一時停止':state==='paused'?'続きをむく':state==='ended'?'もう一度':'むき始める';
}
function reset(){
 daikon=createDaikon();bladeRadius=34.5;elapsed=0;acc=0;state='ready';
 updateStatus();readout();drawSurface($('surface'),daikon);
 if(view3D)view3D.update(daikon,bladeRadius,Number($('tilt').value));
}
function readout(){
 $('length').innerHTML=daikon.ribbonLength.toFixed(0)+'<span> mm</span>';
 $('volume').innerHTML=daikon.removedVolume.toFixed(0)+'<span> mm³</span>';
 const recent=[...daikon.ribbonSections].reverse().find(x=>x.fullWidth);
 $('thickness').innerHTML=(recent?recent.meanThickness.toFixed(2):'-')+'<span> mm</span>';
 $('difference').innerHTML=(recent?Math.abs(recent.topThickness-recent.bottomThickness).toFixed(2):'-')+'<span> mm</span>';
 const drift=Math.abs(initialVolume-(remainingVolume(daikon)+daikon.removedVolume));
 $('mass-check').textContent='体積保存：'+(drift<.001?'一致':'誤差あり');
}
$('toggle').addEventListener('click',()=>{
 if(state==='ended')reset();
 state=state==='playing'?'paused':'playing';updateStatus();
});
$('reset').addEventListener('click',reset);
for(const id of ['feed','speed','tilt'])$(id).addEventListener('input',refreshControls);
function update(){
 if(elapsed>=DURATION){state='ended';updateStatus();return;}
 const omega=Number($('speed').value),dAngle=omega*DT,feed=Number($('feed').value);
 const nextBlade=Math.max(daikon.config.minRadius,bladeRadius-feed*dAngle/(2*Math.PI));
 cutSweep(daikon,{
   deltaAngle:dAngle,engaged:true,bladeRadiusStart:bladeRadius,
   bladeRadiusEnd:nextBlade,tilt:Number($('tilt').value)
 });
 bladeRadius=nextBlade;
 elapsed+=DT;
 if(Math.round(elapsed*60)%6===0){readout();drawSurface($('surface'),daikon);
  if(view3D)view3D.update(daikon,bladeRadius,Number($('tilt').value));}
}
function tick(t){
 if(last===0)last=t;
 const delta=Math.min((t-last)/1000,.08);last=t;
 if(state==='playing'){
   acc+=delta;let guard=0;
   while(acc>=DT&&guard++<5&&state==='playing'){update();acc-=DT;}
   if(guard>=5)acc=0;
 }else acc=0;
 if(view3D)view3D.render(daikon);
 else drawScene(sceneCanvas,daikon,bladeRadius,t);
 requestAnimationFrame(tick);
}
document.addEventListener('visibilitychange',()=>{
 last=0;if(document.hidden&&state==='playing'){state='paused';updateStatus();}
});
$('camera-switch').addEventListener('click',()=>{
 if(!view3D)return;
 cameraMode=cameraMode==='main'?'detail':'main';
 view3D.setView(cameraMode);
 $('camera-switch').textContent=cameraMode==='main'?'刃先を拡大':'全体を見る';
});
async function boot(){
 try{
  const {createThreeView}=await import('./view3d/scene.js');
  view3D=createThreeView(sceneCanvas);
  view3D.update(daikon,bladeRadius,Number($('tilt').value));
  $('view-status').textContent='3D表示 · R0幾何モデル';
  $('camera-switch').disabled=false;
 }catch(error){
  console.warn('Three.js unavailable; using Canvas 2D fallback',error);
  const replacement=document.createElement('canvas');replacement.id='scene';
  replacement.setAttribute('role','img');replacement.setAttribute('aria-label','大根と包丁の2D代替表示');
  sceneCanvas.replaceWith(replacement);sceneCanvas=replacement;
  $('view-status').textContent='2D代替表示（3Dが利用できません）';
  $('camera-switch').disabled=true;
 }
 refreshControls();reset();requestAnimationFrame(tick);
}
boot();
