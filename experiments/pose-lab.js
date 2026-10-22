/** APP-022 isolated three-view visual inspection; no gameplay or network writes. */
import * as THREE from 'three';
import {createPoseLabModel,POSE_LAB_DEFAULTS} from '../src/rig/pose-lab-model.js';
const $=id=>document.getElementById(id);
const canvas=$('pose-canvas'),status=$('scene-status');
const cfg={
 contactAngleDeg:POSE_LAB_DEFAULTS.contactAngleDeg,
 bladeFaceAngleDeg:POSE_LAB_DEFAULTS.bladeFaceAngleDeg,
 ribbonLengthMm:POSE_LAB_DEFAULTS.ribbonLengthMm
};
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});}
catch(e){status.textContent='WebGLが利用できません。3D描画は確認できていません。';throw e;}
renderer.setPixelRatio(Math.min(1.7,window.devicePixelRatio||1));
renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();scene.background=new THREE.Color('#e7eeeb');
scene.add(new THREE.HemisphereLight(0xffffff,0x96b4a4,2));
const sun=new THREE.DirectionalLight(0xffffff,2);sun.position.set(80,140,-90);scene.add(sun);
const fill=new THREE.DirectionalLight(0xf1f1ff,.7);fill.position.set(-80,30,70);scene.add(fill);
const cameras=[
 new THREE.OrthographicCamera(-100,100,100,-100,.1,800),
 new THREE.OrthographicCamera(-100,100,100,-100,.1,800),
 new THREE.OrthographicCamera(-100,100,100,-100,.1,800)
];
cameras[0].position.set(113,83,-150);
cameras[1].position.set(0,28,-210);
cameras[2].position.set(210,30,0);
for(const c of cameras){c.up.set(0,1,0);c.lookAt(0,-2,0);}
const bodyMat=new THREE.MeshStandardMaterial({color:0xf2f4e9,roughness:.83});
const bladeMat=new THREE.MeshStandardMaterial({color:0x8eaaaa,metalness:.34,roughness:.33,side:THREE.DoubleSide});
const ribbonMat=new THREE.MeshStandardMaterial({color:0xc9e7df,transparent:true,opacity:.77,roughness:.6,side:THREE.DoubleSide,depthWrite:false});
const guideMat=new THREE.LineBasicMaterial({color:0xcf6649,depthTest:false,transparent:true,opacity:.95});
const axisMat=new THREE.LineDashedMaterial({color:0x728a86,dashSize:3,gapSize:2,depthTest:false});
const leftMat=new THREE.MeshStandardMaterial({color:0xc19c81,roughness:.8,transparent:true,opacity:.82});
const rightMat=new THREE.MeshStandardMaterial({color:0x8ca8bb,roughness:.8,transparent:true,opacity:.88});
const handleMat=new THREE.MeshStandardMaterial({color:0x655449,roughness:.9});
const contactDotMat=new THREE.MeshBasicMaterial({color:0xb54c42,depthTest:false});
let objects={};
let model;
// Every label identifies a MODEL ROLE, not screen-left or screen-right.
// Three viewports project the same palm anchors using their own camera.
const roleLabelContainer=$('hand-role-pins');
const rolePanels=Array.from({length:3},(_,i)=>{
 const panel=document.createElement('div');
 panel.className='role-panel'+(i===2?' axis-overlap':'');
 const make=(side,label)=>{
  const chip=document.createElement('span');
  chip.className='role-pin '+side;
  chip.innerHTML='<i class="pin-dot"></i>'+label;
  panel.append(chip);
  return chip;
 };
 const left=make('left','左手・大根');
 const right=make('right','右手・包丁');
 roleLabelContainer.append(panel);
 return {panel,left,right};
});
const clamp=(x,min,max)=>Math.min(max,Math.max(min,x));
function placeHandRoleLabels(i,camera){
 const row=rolePanels[i];
 if(i===2)return; // Axis camera compresses +X/-X, so these are legend positions.
 const place=(element,hand)=>{
  const p=new THREE.Vector3(...hand.palm).project(camera);
  element.style.left=clamp((p.x+1)*50,22,78).toFixed(1)+'%';
  element.style.top=clamp((1-p.y)*50,24,90).toFixed(1)+'%';
 };
 place(row.left,model.leftHand);
 place(row.right,model.rightHand);
 // Preserve both labels even where the two projected palm markers overlap.
 const y0=parseFloat(row.left.style.top),y1=parseFloat(row.right.style.top);
 const x0=parseFloat(row.left.style.left),x1=parseFloat(row.right.style.left);
 if(Math.abs(x0-x1)<35&&Math.abs(y0-y1)<16){
  row.left.style.top=clamp(y0-9,24,78).toFixed(1)+'%';
  row.right.style.top=clamp(y1+10,40,91).toFixed(1)+'%';
 }
}

function xyz(p){return new THREE.Vector3(...p);}
function line(group,a,b,material,dashed=false){
 const g=new THREE.BufferGeometry().setFromPoints([xyz(a),xyz(b)]);
 const l=new THREE.Line(g,material);
 if(dashed)l.computeLineDistances();
 if(material===guideMat)l.renderOrder=10;
 group.add(l);return l;
}
function sphere(group,p,r,material){
 const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,14,10),material);
 mesh.position.copy(xyz(p));group.add(mesh);return mesh;
}
function strut(group,a,b,r,material){
 const v=xyz(b).sub(xyz(a));const len=v.length();
 if(!len)return;
 const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,10),material);
 mesh.position.copy(xyz(a).add(xyz(b)).multiplyScalar(.5));
 mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());
 group.add(mesh);return mesh;
}
function bladeMesh(knife){
 const points=[knife.edgeStart,knife.edgeEnd,knife.bladeFaceUpperEnd,knife.bladeFaceUpperStart];
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));
 geo.setIndex([0,1,2,0,2,3]);geo.computeVertexNormals();
 return new THREE.Mesh(geo,bladeMat);
}
function ribbonMesh(ribbon){
 const geo=new THREE.BufferGeometry();const cols=ribbon.columns;
 const vertices=ribbon.points.flat();
 const idx=[];
 for(let y=0;y<ribbon.rows;y++)for(let x=0;x<cols;x++){
  const a=y*(cols+1)+x,b=a+1,c=a+cols+1,d=c+1;
  idx.push(a,c,b,b,c,d);
 }
 geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
 geo.setIndex(idx);geo.computeVertexNormals();
 return new THREE.Mesh(geo,ribbonMat);
}
function destroy(group){
 if(!group)return;
 group.traverse(o=>{if(o.geometry)o.geometry.dispose();});
 scene.remove(group);
}
function buildScene(){
 model=createPoseLabModel(cfg);
 for(const g of Object.values(objects))destroy(g);
 objects={base:new THREE.Group(),hands:new THREE.Group(),guides:new THREE.Group(),ribbon:new THREE.Group()};
 for(const o of Object.values(objects))scene.add(o);
 const body=new THREE.Mesh(new THREE.CylinderGeometry(model.daikon.radius,model.daikon.radius,model.daikon.width,64),bodyMat);
 body.rotation.z=Math.PI/2;objects.base.add(body);
 const blade=bladeMesh(model.knife);objects.base.add(blade);
 // Handle: the only geometry that belongs to the knife extends beyond +X.
 strut(objects.base,model.knife.bladeFaceUpperEnd,model.knife.handleAnchor,3.6,handleMat);
 objects.ribbon.add(ribbonMesh(model.ribbon));
 // Support points are hypotheses, not actual hands.
 for(const [hand,mat] of [[model.leftHand,leftMat],[model.rightHand,rightMat]]){
  sphere(objects.hands,hand.palm,8,mat);
  sphere(objects.hands,hand.thumb,4.2,mat);
  strut(objects.hands,hand.palm,hand.thumb,3.5,mat);
 }
 // Render-order overlay is deliberately diagnostic and not an image of force/contact.
 const d=model.knife;
 line(objects.guides,model.daikon.axisStart,model.daikon.axisEnd,axisMat,true);
 line(objects.guides,d.edgeStart,d.edgeEnd,guideMat);
 sphere(objects.guides,d.edgeStart,2.2,leftMat);sphere(objects.guides,d.edgeEnd,2.2,rightMat);
 sphere(objects.guides,d.edgeMidpoint,2.5,contactDotMat);
 objects.guides.visible=$('show-guides').checked;
 objects.hands.visible=$('show-hands').checked;
 roleLabelContainer.style.display=$('show-hands').checked?'grid':'none';
 objects.ribbon.visible=$('show-ribbon').checked && cfg.ribbonLengthMm>0;
 $('contact-value').textContent=cfg.contactAngleDeg+'°（仮）';
 $('blade-face-value').textContent=cfg.bladeFaceAngleDeg+'°（仮）';
 $('ribbon-length-value').textContent=cfg.ribbonLengthMm+'（仮）';
 status.textContent='単一3Dシーンを3方向に表示中｜親指は代替支点、刃面角・材質・帯は未校正';
}
function resize(){
 const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);
 renderer.setSize(w,h,false);
}
function render(){
 resize();
 const width=Math.max(1,canvas.clientWidth),height=Math.max(1,canvas.clientHeight);
 const stacked=window.innerWidth<=720;
 renderer.setScissorTest(true);
 for(let i=0;i<3;i++){
  const w=stacked?width:width/3,h=stacked?height/3:height;
  const x=stacked?0:i*w,y=stacked?(2-i)*h:0;
  renderer.setViewport(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h));
  renderer.setScissor(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h));
  const camera=cameras[i],halfHeight=101;
  camera.left=-halfHeight*(w/h);camera.right=halfHeight*(w/h);
  camera.top=halfHeight;camera.bottom=-halfHeight;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
  placeHandRoleLabels(i,camera);
  renderer.render(scene,camera);
 }
 renderer.setScissorTest(false);
}
for(const [id,key] of [['contact','contactAngleDeg'],['blade-face','bladeFaceAngleDeg'],['ribbon-length','ribbonLengthMm']]){
 $(id).addEventListener('input',()=>{cfg[key]=Number($(id).value);buildScene();render();});
}
for(const [id,obj] of [['show-guides','guides'],['show-hands','hands'],['show-ribbon','ribbon']]){
 $(id).addEventListener('change',()=>{
   objects[obj].visible=$(id).checked && (obj!=='ribbon'||cfg.ribbonLengthMm>0);
   if(obj==='hands')roleLabelContainer.style.display=$(id).checked?'grid':'none';
   render();
 });
}
$('reset').addEventListener('click',()=>{
 Object.assign(cfg,{...POSE_LAB_DEFAULTS});
 $('contact').value=String(cfg.contactAngleDeg);
 $('blade-face').value=String(cfg.bladeFaceAngleDeg);
 $('ribbon-length').value=String(cfg.ribbonLengthMm);
 for(const id of ['show-guides','show-hands','show-ribbon'])$(id).checked=true;
 buildScene();render();
});
window.addEventListener('resize',render,{passive:true});
try{buildScene();render();}
catch(e){status.textContent='3D表示に失敗しました。姿勢合格とは判定しません。';console.error(e);}
