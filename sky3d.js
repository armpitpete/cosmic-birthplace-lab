// Cosmic Birthplace v0.6 — Observer-centred 3D birth sky.
// Consumes the SAME altitude/azimuth model as the accepted 2D sky chart.
// Constellation connectors are selected asterism guides, not surveyed boundaries.
import * as THREE from 'three';

let active=null;
const RAD=Math.PI/180;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const direction=(alt,az)=>new THREE.Vector3(
 Math.sin(az*RAD)*Math.cos(alt*RAD),
 Math.sin(alt*RAD),
 -Math.cos(az*RAD)*Math.cos(alt*RAD)
);
function skyPoint(alt,az){return direction(alt,az).multiplyScalar(36);}

function mount(node,data){
 dispose();
 if(!node||!node.isConnected)return;
 let renderer;
 const size=node.getBoundingClientRect(),w=Math.max(240,Math.round(size.width)),h=Math.max(240,Math.round(size.height));
 try{
  renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));
  renderer.setSize(w,h,false);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
 }catch(error){renderer?.dispose();throw Error('WebGL unavailable: '+error.message);}
 renderer.domElement.className='sky3d-canvas';
 renderer.domElement.tabIndex=0;
 renderer.domElement.setAttribute('role','group');
 renderer.domElement.setAttribute('aria-label','3D sky viewer. Arrow keys look around; plus and minus zoom.');
 renderer.domElement.style.touchAction='none';
 node.replaceChildren(renderer.domElement);
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(73,w/h,.1,85);
 camera.position.set(0,0,0);
 const starObjects=[],targets=[],materialList=[];
 const points=[],stars=data.stars.filter(s=>s.alt>=0);
 function addLine(path,color,opacity=.35){
  const geo=new THREE.BufferGeometry().setFromPoints(path);
  const material=new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false});
  scene.add(new THREE.Line(geo,material));return geo;
 }
 // Horizon and altitude guide rings. The ring at 0° is the local horizon.
 for(const alt of [0,30,60]){
  const coords=[];
  for(let j=0;j<=128;j++)coords.push(skyPoint(alt,j*360/128));
  addLine(coords,alt===0?0x64a8a8:0x405c7e,alt===0?.58:.22);
 }
 for(let az=0;az<360;az+=90){
  const arr=[];for(let alt=0;alt<=90;alt+=5)arr.push(skyPoint(alt,az));
  addLine(arr,0x41607b,.17);
 }
 // No photographic texture or false positions: each point comes from an altitude/azimuth.
 for(const s of stars){
  const radius=clamp(.12+(3.8-s.mag)*.038,.11,.32);
  const mat=new THREE.MeshBasicMaterial({color:0xddefff,transparent:true,opacity:clamp(1.15-.08*s.mag,.55,1)});
  const point=new THREE.Mesh(new THREE.SphereGeometry(radius,12,8),mat);
  point.position.copy(skyPoint(s.alt,s.az));
  scene.add(point);
  const hit=new THREE.Mesh(new THREE.SphereGeometry(.8,10,8),new THREE.MeshBasicMaterial({visible:false}));
  hit.position.copy(point.position);scene.add(hit);hit.userData={kind:'Star',name:s.name,alt:s.alt,az:s.az,mag:s.mag};
  targets.push(hit);starObjects.push({data:s,point});
 }
 const planetObjects=[];
 for(const s of data.objects.filter(s=>s.alt>=0)){
  const colour=s.kind==='Sun'?0xffd28a:s.kind==='Moon'?0xe4e4ed:0xffb875;
  const radius=s.kind==='Sun'?.73:s.kind==='Moon'?.49:.44;
  const point=new THREE.Mesh(new THREE.SphereGeometry(radius,20,12),new THREE.MeshBasicMaterial({color:colour}));
  point.position.copy(skyPoint(s.alt,s.az));scene.add(point);
  const hit=new THREE.Mesh(new THREE.SphereGeometry(1.2,12,8),new THREE.MeshBasicMaterial({visible:false}));
  hit.position.copy(point.position);scene.add(hit);hit.userData={kind:s.kind,name:s.name,alt:s.alt,az:s.az};
  targets.push(hit);planetObjects.push(s);
 }
 // The four sparse outlines use catalogued stars from the primary 2D experience.
 const guides=new THREE.Group();
 for(const guide of data.guides){
  for(const [a,b] of guide.pairs){
   const starA=stars.find(s=>s.name===a),starB=stars.find(s=>s.name===b);
   if(!starA||!starB)continue;
   const p=skyPoint(starA.alt,starA.az),q=skyPoint(starB.alt,starB.az),path=[];
   // Arc follows the inside of the celestial sphere, not a chord through the sky.
   for(let j=0;j<=14;j++)path.push(p.clone().lerp(q,j/14).normalize().multiplyScalar(36));
   const geo=new THREE.BufferGeometry().setFromPoints(path);
   const material=new THREE.LineBasicMaterial({color:0x78c6b9,transparent:true,opacity:.54,depthWrite:false});
   const line=new THREE.Line(geo,material);guides.add(line);
  }
 }
 scene.add(guides);
 guides.visible=data.showGuides;
 const overlay=document.createElement('div');overlay.className='sky3d-overlays';overlay.setAttribute('aria-hidden','true');
 node.append(overlay);
 const labels=[];
 for(const [az,label] of [[0,'N'],[90,'E'],[180,'S'],[270,'W']]){
  const el=document.createElement('span');el.className='sky3d-direction';el.textContent=label;overlay.append(el);
  labels.push({p:skyPoint(0,az),el});
 }
 const closeLabels=[];
 for(const s of stars.filter(s=>s.mag<.8)){
  const el=document.createElement('span');el.className='sky3d-object-label';el.textContent=s.name;overlay.append(el);
  closeLabels.push({p:skyPoint(s.alt,s.az),el});
 }
 for(const o of planetObjects){
  const el=document.createElement('span');el.className='sky3d-object-label sky3d-planet-label';el.textContent=o.name;overlay.append(el);
  closeLabels.push({p:skyPoint(o.alt,o.az),el});
 }
 const controls={yaw:0,pitch:20,fov:73,activePointers:new Map(),gesture:null,justDragged:false};
 const raycaster=new THREE.Raycaster();
 const pointer=new THREE.Vector2();
 const ctx={node,data,scene,camera,renderer,controls,resize:null,onLost:null,handlers:[],guides,targets,labels,closeLabels,draw:null};
 active=ctx;
 function draw(){
  if(active!==ctx||!node.isConnected)return;
  camera.fov=controls.fov;camera.aspect=Math.max(.4,node.clientWidth/node.clientHeight);camera.updateProjectionMatrix();
  camera.lookAt(direction(controls.pitch,controls.yaw));
  renderer.render(scene,camera);
  const placed=[],width=node.clientWidth,height=node.clientHeight;
  for(const {p,el} of [...labels,...closeLabels]){
   const v=p.clone().project(camera);
   const x=(v.x+1)*width/2,y=(1-v.y)*height/2;
   const visible=v.z>0&&v.z<1&&x>15&&x<width-18&&y>15&&y<height-18;
   const ww=Math.max(26,el.textContent.length*6+10),hh=18;
   const overlap=placed.some(a=>x<a.x+a.w+6 && x+ww>a.x-6 && y<a.y+a.h+7 && y+hh>a.y-7);
   el.hidden=!visible||overlap;
   if(visible&&!overlap){el.style.left=x+'px';el.style.top=y+'px';placed.push({x,y,w:ww,h:hh});}
  }
  window.dispatchEvent(new CustomEvent('cosmicskydirection',{detail:{az:controls.yaw,alt:controls.pitch}}));
 }
 ctx.draw=draw;
 function listen(event,fn,options){renderer.domElement.addEventListener(event,fn,options);ctx.handlers.push([event,fn,options]);}
 function pinch(){
  const ps=[...controls.activePointers.values()];
  if(ps.length!==2)return null;
  return Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y);
 }
 listen('pointerdown',e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  renderer.domElement.setPointerCapture(e.pointerId);
  controls.activePointers.set(e.pointerId,{x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY});
  controls.gesture=pinch();
  controls.justDragged=false;
 });
 listen('pointermove',e=>{
  const v=controls.activePointers.get(e.pointerId);if(!v)return;
  const dx=e.clientX-v.x,dy=e.clientY-v.y;
  v.x=e.clientX;v.y=e.clientY;
  if(Math.abs(e.clientX-v.startX)+Math.abs(e.clientY-v.startY)>5)controls.justDragged=true;
  if(controls.activePointers.size===2){
   const dist=pinch();
   if(dist&&controls.gesture){controls.fov=clamp(controls.fov*controls.gesture/dist,36,99);}
   controls.gesture=dist;
  }else{
   controls.yaw=(controls.yaw-dx*.22+3600)%360;
   controls.pitch=clamp(controls.pitch+dy*.22,-10,88);
  }
  draw();
 });
 function finish(e){
  const v=controls.activePointers.get(e.pointerId);controls.activePointers.delete(e.pointerId);controls.gesture=pinch();
  if(v&&!controls.justDragged&&controls.activePointers.size===0){
   const r=node.getBoundingClientRect();pointer.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
   raycaster.setFromCamera(pointer,camera);
   const hits=raycaster.intersectObjects(targets);
   if(hits.length)window.dispatchEvent(new CustomEvent('cosmicskyselect',{detail:hits[0].object.userData}));
  }
 }
 listen('pointerup',finish);listen('pointercancel',finish);
 listen('wheel',e=>{e.preventDefault();controls.fov=clamp(controls.fov+Math.sign(e.deltaY)*3.2,36,99);draw();},{passive:false});
 listen('keydown',e=>{
  const key=e.key;
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','_'].includes(key))return;
  e.preventDefault();
  if(key==='ArrowLeft')controls.yaw=(controls.yaw+355)%360;
  if(key==='ArrowRight')controls.yaw=(controls.yaw+5)%360;
  if(key==='ArrowUp')controls.pitch=clamp(controls.pitch+5,-10,88);
  if(key==='ArrowDown')controls.pitch=clamp(controls.pitch-5,-10,88);
  if(key==='+'||key==='=')controls.fov=clamp(controls.fov-4,36,99);
  if(key==='-'||key==='_')controls.fov=clamp(controls.fov+4,36,99);
  draw();
 });
 const resize=new ResizeObserver(()=>{
  if(active!==ctx)return;
  const rect=node.getBoundingClientRect();if(rect.width<2||rect.height<2)return;
  renderer.setSize(rect.width,rect.height,false);draw();
 });resize.observe(node);ctx.resize=resize;
 const onLost=e=>{e.preventDefault();window.dispatchEvent(new CustomEvent('cosmicsky3dfailed'));};
 renderer.domElement.addEventListener('webglcontextlost',onLost,false);ctx.onLost=onLost;
 draw();
 return true;
}
function reset(){if(!active)return;Object.assign(active.controls,{yaw:0,pitch:20,fov:73});active.draw();}
function look(az,alt){if(!active)return;active.controls.yaw=((az%360)+360)%360;active.controls.pitch=clamp(alt,-10,88);active.draw();}
function guides(visible){if(active){active.guides.visible=!!visible;active.draw();}}
function dispose(){
 if(!active)return;
 const ctx=active;active=null;
 ctx.resize.disconnect();ctx.renderer.domElement.removeEventListener('webglcontextlost',ctx.onLost);
 for(const [name,fn,opts] of ctx.handlers)ctx.renderer.domElement.removeEventListener(name,fn,opts);
 ctx.scene.traverse(obj=>{obj.geometry?.dispose();if(obj.material){for(const m of(Array.isArray(obj.material)?obj.material:[obj.material]))m.dispose();}});
 ctx.renderer.dispose();ctx.node.replaceChildren();
}
window.cosmicSky3D={mount,reset,look,guides,dispose,inspect:()=>active?{yaw:active.controls.yaw,pitch:active.controls.pitch,fov:active.controls.fov,visibleStars:active.data.stars.filter(s=>s.alt>=0).length,visiblePlanets:active.data.objects.filter(s=>s.kind==='Planet'&&s.alt>=0).length,guideLines:active.guides.children.length,guides:active.guides.visible}:null};
