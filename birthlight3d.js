// The expanding birth-light shell, an educational model in an illustrative local frame.
// Star radial distances are taken from the existing example list; directions are schematic.
import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';

let active=null;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

function makeCanvas(node,model){
  const scene=new THREE.Scene();
  const bounds=node.getBoundingClientRect(),width=Math.max(240,Math.round(bounds.width)),height=Math.max(240,Math.round(bounds.height));
  const camera=new THREE.PerspectiveCamera(40,width/height,.02,95);
  const start=new THREE.Vector3(3.6,2.3,6.1);
  camera.position.copy(start);camera.lookAt(0,0,0);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));
  renderer.setSize(width,height,false);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.domElement.className='orbit3d-canvas';
  renderer.domElement.setAttribute('aria-hidden','true');
  node.replaceChildren(renderer.domElement);
  const controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=false;
  controls.enablePan=true;
  controls.minDistance=3.1;
  controls.maxDistance=13;
  controls.minPolarAngle=.08;
  controls.maxPolarAngle=Math.PI-.08;
  controls.target.set(0,0,0);

  const backdrop=[];
  for(let i=0;i<220;i++){
    const phi=i*2.39996323,t=1-2*(i+.5)/220,r=Math.sqrt(1-t*t),dist=18+(i%8);
    backdrop.push(dist*r*Math.cos(phi),dist*t,dist*r*Math.sin(phi));
  }
  const bgGeometry=new THREE.BufferGeometry();
  bgGeometry.setAttribute('position',new THREE.Float32BufferAttribute(backdrop,3));
  const bgMaterial=new THREE.PointsMaterial({color:0xadcce9,size:.04,transparent:true,opacity:.62});
  scene.add(new THREE.Points(bgGeometry,bgMaterial));

  const originGlow=new THREE.Mesh(new THREE.SphereGeometry(.105,20,16),new THREE.MeshBasicMaterial({color:0x4dabf9}));
  scene.add(originGlow);
  const halo=new THREE.Mesh(new THREE.SphereGeometry(.17,20,16),new THREE.MeshBasicMaterial({color:0x7ccafe,transparent:true,opacity:.2,depthWrite:false}));
  scene.add(halo);

  const shellGroup=new THREE.Group();
  const sphere=new THREE.Mesh(new THREE.SphereGeometry(1,56,36),new THREE.MeshBasicMaterial({color:0x4fd4e5,transparent:true,opacity:.11,side:THREE.DoubleSide,depthWrite:false,depthTest:true}));
  sphere.name='light-shell';
  shellGroup.add(sphere);
  const rimMaterial=new THREE.LineBasicMaterial({color:0x91f8e3,transparent:true,opacity:.5});
  for(const angles of [[0,0,0],[Math.PI/2,0,0],[0,Math.PI/2,0]]){
    const pts=[];
    for(let i=0;i<=128;i++){const t=i/128*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(t),Math.sin(t),0));}
    const ring=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts.slice(0,-1)),rimMaterial);
    ring.rotation.set(...angles);shellGroup.add(ring);
  }
  scene.add(shellGroup);

  const stars=[];
  const badges=document.createElement('div');
  badges.className='orbit3d-overlays birthlight-labels';
  badges.setAttribute('aria-hidden','true');
  node.append(badges);
  const maxLy=Math.max(80,Number(model.maxYears||0)*1.1), maxUnit=2.45;
  for(let i=0;i<model.stars.length;i++){
    const [name,d]=model.stars[i];
    if(d>maxLy)continue;
    const y=1-2*(i+.5)/model.stars.length;
    const az=i*2.39996322972865;
    const h=Math.sqrt(1-y*y);
    const position=new THREE.Vector3(Math.cos(az)*h,y,Math.sin(az)*h).multiplyScalar((d/maxLy)*maxUnit);
    const core=new THREE.Mesh(new THREE.SphereGeometry(.033,12,8),new THREE.MeshBasicMaterial({color:0x8cabc6}));
    core.position.copy(position);scene.add(core);
    const glow=new THREE.Mesh(new THREE.SphereGeometry(.075,12,8),new THREE.MeshBasicMaterial({color:0x72bda9,transparent:true,opacity:.08,depthWrite:false}));
    glow.position.copy(position);scene.add(glow);
    const label=document.createElement('span');
    label.className='orbit3d-label birthlight-starlabel';
    label.textContent=name;badges.append(label);
    stars.push({name,d,core,glow,label,position,reached:false});
  }
  const originLabel=document.createElement('span');
  originLabel.className='orbit3d-label birthlight-originlabel';originLabel.textContent='BIRTH EVENT';badges.append(originLabel);

  const current={node,scene,camera,renderer,controls,start,resize:null,onChange:null,onLost:null,maxLy,maxUnit,shellGroup,stars,originLabel,radiusLy:0,draw:null,raf:0};
  active=current;
  const draw=()=>{
    if(active!==current || !node.isConnected)return;
    renderer.render(scene,camera);
    const bounds=node.getBoundingClientRect(),placed=[];
    const all=[{p:new THREE.Vector3(),label:originLabel},...stars.filter(s=>s.d>=16).sort((a,b)=>b.d-a.d).map(s=>({p:s.position,label:s.label}))];
    for(const star of stars)star.label.hidden=true;
    for(const {p,label} of all){
      const v=p.clone().project(camera);
      const x=(1+v.x)*bounds.width/2,y=(1-v.y)*bounds.height/2;
      const w=Math.max(55,label.textContent.length*6+9),h=18;
      const overlaps=placed.some(rect=>x < rect.x+rect.w+8 && x+w+8>rect.x && y<rect.y+rect.h+6 && y+h+6>rect.y);
      const visible=v.z>=-1 && v.z<=1 && Math.abs(v.x)<.87 && Math.abs(v.y)<.85 && !overlaps;
      label.hidden=!visible;
      if(visible){label.style.left=(50+v.x*50)+'%';label.style.top=(50-v.y*50)+'%';placed.push({x,y,w,h});}
    }
  };
  current.draw=draw;
  current.onChange=()=>draw();
  controls.addEventListener('change',current.onChange);
  const resize=new ResizeObserver(()=>{
    if(active!==current)return;
    const b=node.getBoundingClientRect();if(b.width<2 || b.height<2)return;
    camera.aspect=b.width/b.height;camera.updateProjectionMatrix();renderer.setSize(b.width,b.height,false);draw();
  });
  resize.observe(node);current.resize=resize;
  current.onLost=e=>{e.preventDefault();window.dispatchEvent(new CustomEvent('cosmicbirthlight3dfailed'));};
  renderer.domElement.addEventListener('webglcontextlost',current.onLost,false);
  update(model.radius);
  return true;
}
function update(radiusLy){
  if(!active)return;
  const ctx=active;
  const radius=clamp(Number(radiusLy)||0,0,ctx.maxLy);
  ctx.radiusLy=radius;
  const scale=Math.max(.0001,radius/ctx.maxLy*ctx.maxUnit);
  ctx.shellGroup.scale.setScalar(scale);
  ctx.shellGroup.visible=radius>.005;
  let reached=0;
  for(const star of ctx.stars){
    star.reached=star.d<=radius+1e-9;
    if(star.reached)reached++;
    star.core.material.color.setHex(star.reached?0xffdfa0:0x7292b4);
    star.glow.material.opacity=star.reached?.35:.06;
    star.label.style.color=star.reached?'#ffdfab':'#94acc5';
  }
  ctx.draw();
  return {radius,reached};
}
function reset(){
  if(!active)return;
  active.camera.position.copy(active.start);
  active.controls.target.set(0,0,0);
  active.controls.update();active.draw();
}
function dispose(){
  if(!active)return;
  const ctx=active;active=null;
  ctx.resize.disconnect();
  ctx.controls.removeEventListener('change',ctx.onChange);
  ctx.controls.dispose();
  ctx.renderer.domElement.removeEventListener('webglcontextlost',ctx.onLost);
  ctx.scene.traverse(o=>{
    if(o.geometry)o.geometry.dispose();
    if(o.material){for(const m of (Array.isArray(o.material)?o.material:[o.material]))m.dispose();}
  });
  ctx.renderer.dispose();
  ctx.node.replaceChildren();
}
window.cosmicBirthLight3D={mount:makeCanvas,update,reset,dispose,inspect:()=>active?{radius:active.radiusLy,camera:active.camera.position.toArray(),target:active.controls.target.toArray(),visibleStars:active.stars.filter(s=>s.reached).length,stars:active.stars.map(s=>({name:s.name,distance:s.d,reached:s.reached}))}:null};
