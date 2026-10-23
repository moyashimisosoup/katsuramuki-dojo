/** Three.js presentation for the R0 physical cutting data.
 * Only mesh appearance is synthetic. This module never changes cutting results.
 */
import * as THREE from 'three';
import {buildSurfaceMeshData,buildRibbonMeshData,bladeEdgeEndpoints,CONTACT_ANGLE} from './geometry.js';
const DAICON_MATERIAL=new THREE.MeshStandardMaterial({color:0xe9f0df,roughness:.78,metalness:0,side:THREE.DoubleSide});
const RIBBON_MATERIAL=new THREE.MeshStandardMaterial({color:0xf6ffe9,transparent:true,opacity:.80,roughness:.42,side:THREE.DoubleSide,depthWrite:false});
const BLADE_MATERIAL=new THREE.MeshStandardMaterial({color:0xc0cbd0,metalness:.48,roughness:.3,side:THREE.DoubleSide});
function toGeometry(data){
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.BufferAttribute(data.positions,3));
 if(data.normals)geo.setAttribute('normal',new THREE.BufferAttribute(data.normals,3));
 geo.setIndex(new THREE.BufferAttribute(data.indices,1));
 if(!data.normals && data.positions.length)geo.computeVertexNormals();
 return geo;
}
function knifeShape(daikon,bladeRadius,tilt){
 const [a,b]=bladeEdgeEndpoints(daikon,bladeRadius,tilt);
 const lift=[0,13,11];
 return toGeometry({positions:new Float32Array([...a,...b,
   b[0]+lift[0],b[1]+lift[1],b[2]+lift[2],
   a[0]+lift[0],a[1]+lift[1],a[2]+lift[2]]),
   indices:new Uint32Array([0,1,2,0,2,3])});
}
export function createThreeView(canvas){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.55;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#f5f6ef');
 const camera=new THREE.PerspectiveCamera(40,1,.1,900);
 scene.add(new THREE.HemisphereLight(0xfffbec,0x79998c,2));
 const sunlight=new THREE.DirectionalLight(0xffffff,2.4);sunlight.position.set(-40,115,85);scene.add(sunlight);
 const fill=new THREE.DirectionalLight(0xd2f3f2,1.1);fill.position.set(80,20,-40);scene.add(fill);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(260,230),new THREE.MeshStandardMaterial({color:0xc7b49c,roughness:1}));
 floor.rotation.x=-Math.PI/2;floor.position.y=-52;scene.add(floor);
 const board=new THREE.Mesh(new THREE.BoxGeometry(205,4,152),new THREE.MeshStandardMaterial({color:0xe2c6a3,roughness:.98}));
 board.position.set(5,-49,26);scene.add(board);
 const subtleGrid=new THREE.GridHelper(190,12,0xccc8ad,0xd4d0bc);
 subtleGrid.position.set(5,-46.7,27);subtleGrid.material.opacity=.11;subtleGrid.material.transparent=true;scene.add(subtleGrid);
 let body=null,ribbon=null,knife=null,knifeHandle=null,contactLine=null;
 let currentAngle=0,lastMeshedAngle=0,cameraMode='main',disposed=false;
 const setView=mode=>{cameraMode=mode==='detail'?'detail':'main';return cameraMode;};
 function update(state,bladeRadius,tilt=0){
  if(disposed)return;
  currentAngle=state.angle;
  const geometry=toGeometry(buildSurfaceMeshData(state));
  if(body){body.geometry.dispose();body.geometry=geometry;body.rotation.x=0;}
  else {body=new THREE.Mesh(geometry,DAICON_MATERIAL);scene.add(body);}
  lastMeshedAngle=state.angle;
  const ribbonGeo=toGeometry(buildRibbonMeshData(state,bladeRadius,{tilt}));
  if(ribbon){ribbon.geometry.dispose();ribbon.geometry=ribbonGeo;ribbon.visible=state.currentRibbonLength>.0001;}
  else {ribbon=new THREE.Mesh(ribbonGeo,RIBBON_MATERIAL);scene.add(ribbon);}
  const knifeGeo=knifeShape(state,bladeRadius,tilt);
  if(knife){knife.geometry.dispose();knife.geometry=knifeGeo;}
  else {knife=new THREE.Mesh(knifeGeo,BLADE_MATERIAL);scene.add(knife);}
  const [,b]=bladeEdgeEndpoints(state,bladeRadius,tilt);
  const handleStart=new THREE.Vector3(state.config.width/2+3,b[1]+10,b[2]+8);
  if(!knifeHandle){
    knifeHandle=new THREE.Mesh(new THREE.CylinderGeometry(4,5,31,12),new THREE.MeshStandardMaterial({color:0x785b45,roughness:.91}));
    knifeHandle.rotation.z=Math.PI/2;scene.add(knifeHandle);
  }
  knifeHandle.position.copy(handleStart).add(new THREE.Vector3(18,0,0));
  const [a,b2]=bladeEdgeEndpoints(state,bladeRadius,tilt);
  const lineGeometry=new THREE.BufferGeometry();
  lineGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array([...a,...b2]),3));
  if(contactLine){contactLine.geometry.dispose();contactLine.geometry=lineGeometry;}
  else {contactLine=new THREE.Line(lineGeometry,new THREE.LineBasicMaterial({color:0xd8a276}));scene.add(contactLine);}
 }
 function resize(){
   const {width,height}=canvas.getBoundingClientRect();
   const w=Math.max(1,Math.round(width)),h=Math.max(1,Math.round(height));
   if(canvas.width!==Math.round(w*renderer.getPixelRatio())||canvas.height!==Math.round(h*renderer.getPixelRatio()))renderer.setSize(w,h,false);
   camera.aspect=w/h;camera.updateProjectionMatrix();
 }
 const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
 function render(state){
   if(disposed)return;
   currentAngle=state.angle;
   if(body)body.rotation.x=-(currentAngle-lastMeshedAngle);
   // The two views are visual inspection cameras, not calibrated knife angles.
   const wide=cameraMode==='main',portrait=canvas.clientWidth<600;
   const scale=portrait?1.12:1;
   camera.position.set(...(wide?[97*scale,80*scale,142*scale]:[47*scale,48*scale,82*scale]));
   camera.lookAt(wide?0:5,wide?-4:16,wide?12:24);
   renderer.render(scene,camera);
 }
 function dispose(){
   disposed=true;observer.disconnect();renderer.dispose();
   for(const item of [body,ribbon,knife,contactLine])item?.geometry.dispose();
   if(knifeHandle){knifeHandle.geometry.dispose();knifeHandle.material.dispose();}
   for(const mat of [DAICON_MATERIAL,RIBBON_MATERIAL,BLADE_MATERIAL])mat.dispose();
   for(const mesh of [board,floor,subtleGrid]){mesh.geometry.dispose();mesh.material.dispose();}
   if(contactLine)contactLine.material.dispose();
 }
 return {update,render,setView,dispose};
}
