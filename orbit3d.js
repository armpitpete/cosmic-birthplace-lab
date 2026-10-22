// Cosmic Birthplace 3D orbit view. Positions arrive from the existing NASA/JPL-derived calculator.
// The Sun and Earth glyphs are deliberately enlarged relative to orbital distance.
import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';

let active = null;
const axis = p => new THREE.Vector3(p.x * 3.15, p.z * 3.15, -p.y * 3.15);

function earthTexture(){
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 256;
  const g = canvas.getContext('2d');
  g.fillStyle = '#2779bd'; g.fillRect(0,0,512,256);
  const continents = [
    [[45,80],[71,43],[110,34],[144,59],[151,94],[127,112],[121,155],[94,162],[79,120]],
    [[150,137],[174,149],[198,186],[192,230],[169,253],[153,227],[146,185]],
    [[245,66],[291,46],[349,58],[390,96],[376,130],[333,133],[301,161],[266,143]],
    [[287,150],[323,161],[342,214],[314,240],[287,217]],
    [[412,172],[458,172],[479,195],[464,218],[424,209]]
  ];
  g.fillStyle = '#4cb392';
  for(const polygon of continents){g.beginPath();polygon.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();}
  g.fillStyle = 'rgba(255,255,255,.18)';
  for(let i=0;i<15;i++){const x=(i*103+37)%512,y=(i*41+20)%256;g.beginPath();g.ellipse(x,y,30,5,(i%6)*.3,0,Math.PI*2);g.fill();}
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function mount(node, model){
  dispose();
  if(!node || !node.isConnected) return;
  const rect=node.getBoundingClientRect();
  const width=Math.max(240,Math.round(rect.width)),height=Math.max(240,Math.round(rect.height));
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(42,width/height,0.03,85);
  const initialPosition=new THREE.Vector3(5.3,4.45,6.7);
  camera.position.copy(initialPosition);
  camera.lookAt(0,0,0);
  let renderer;
  try{
    renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.65));
    renderer.setSize(width,height,false);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
  }catch(error){throw new Error('WebGL is unavailable on this device');}
  renderer.domElement.className='orbit3d-canvas';
  renderer.domElement.setAttribute('aria-hidden','true');
  node.replaceChildren(renderer.domElement);
  const controls=new OrbitControls(camera,renderer.domElement);
  controls.enablePan=true;
  controls.enableDamping=false;
  controls.minDistance=2.4;
  controls.maxDistance=16;
  controls.maxPolarAngle=Math.PI*.94;
  controls.minPolarAngle=.06;

  scene.add(new THREE.AmbientLight(0xaac7ff,1.15));
  const sunLight=new THREE.PointLight(0xffc47a,110,35,1.4);
  scene.add(sunLight);
  const sun=new THREE.Mesh(new THREE.SphereGeometry(.29,28,20),new THREE.MeshStandardMaterial({color:0xffb954,emissive:0xee7422,emissiveIntensity:1.45,roughness:.7}));
  scene.add(sun);
  const corona=new THREE.Mesh(new THREE.SphereGeometry(.4,24,16),new THREE.MeshBasicMaterial({color:0xffa555,transparent:true,opacity:.075,depthWrite:false}));
  scene.add(corona);

  const orbitPoints=(model.orbit||[]).map(axis);
  const curve=new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbitPoints),new THREE.LineBasicMaterial({color:0x89a8dc,transparent:true,opacity:.78}));
  scene.add(curve);

  const starPositions=[];
  for(let i=0;i<260;i++){
    const a=i*2.399963229728653, y=1-2*(i+.5)/260, r=Math.sqrt(1-y*y),distance=24+(i%9);
    starPositions.push(Math.cos(a)*r*distance,y*distance,Math.sin(a)*r*distance);
  }
  const stars=new THREE.BufferGeometry();
  stars.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));
  scene.add(new THREE.Points(stars,new THREE.PointsMaterial({color:0xb1c9e8,size:.052,sizeAttenuation:true,transparent:true,opacity:.75})));

  const texture=earthTexture();
  const globeMaterial=new THREE.MeshStandardMaterial({map:texture,roughness:1,metalness:0});
  function marker(colour){
    const group=new THREE.Group();
    const globe=new THREE.Mesh(new THREE.SphereGeometry(.145,26,20),globeMaterial);
    group.add(globe);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(.205,.017,8,46),new THREE.MeshBasicMaterial({color:colour,transparent:true,opacity:.95,depthTest:false}));
    rim.rotation.x=Math.PI/2;
    group.add(rim);
    scene.add(group);
    return {group,globe,rim};
  }
  const birth=marker(0x78e6da),selected=marker(0xd7b6ff);
  const overlays=document.createElement('div');
  overlays.className='orbit3d-overlays';
  overlays.setAttribute('aria-hidden','true');
  const labels=['SUN','BIRTH','SELECTED'].map((s,i)=>{
    const e=document.createElement('span');
    e.className='orbit3d-label orbit3d-label-'+i;
    e.textContent=s;
    overlays.append(e);
    return e;
  });
  node.append(overlays);

  function draw(){
    if(!active || active.node!==node || !node.isConnected)return;
    birth.rim.quaternion.copy(camera.quaternion);
    selected.rim.quaternion.copy(camera.quaternion);
    renderer.render(scene,camera);
    const positions=[new THREE.Vector3(0,0,0),birth.group.position,selected.group.position];
    positions.forEach((pos,i)=>{
      const point=pos.clone().project(camera);
      labels[i].style.left=((point.x+1)*50)+'%';
      labels[i].style.top=((1-point.y)*50)+'%';
      labels[i].hidden=point.z>1 || point.z< -1;
    });
  }
  const onChange=()=>draw();
  controls.addEventListener('change',onChange);
  const resize=new ResizeObserver(()=>{
    if(!active || active.node!==node)return;
    const r=node.getBoundingClientRect();
    if(r.width<1 || r.height<1)return;
    camera.aspect=r.width/r.height;camera.updateProjectionMatrix();
    renderer.setSize(r.width,r.height,false);draw();
  });
  resize.observe(node);
  const onContextLost=e=>{e.preventDefault();window.dispatchEvent(new CustomEvent('cosmic3dfailed'))};
  renderer.domElement.addEventListener('webglcontextlost',onContextLost,false);
  active={node,scene,camera,renderer,controls,resize,birth,selected,initialPosition,texture,onChange,onContextLost,draw,model:null};
  update(model);
  return true;
}

function update(model){
  if(!active)return;
  const {birth,selected,draw}=active;
  birth.group.position.copy(axis(model.birth));
  selected.group.position.copy(axis(model.selected));
  birth.globe.rotation.y=0;
  selected.globe.rotation.y=model.selectedDate?((new Date(model.selectedDate)-new Date(model.birthDate))/86400000)%1*Math.PI*2:0;
  active.model=model;
  draw();
}

function reset(){
  if(!active)return;
  const {camera,controls,initialPosition,draw}=active;
  camera.position.copy(initialPosition);
  controls.target.set(0,0,0);
  controls.update();
  draw();
}

function dispose(){
  if(!active)return;
  const current=active; active=null;
  current.resize.disconnect();
  current.controls.removeEventListener('change',current.onChange);
  current.controls.dispose();
  current.renderer.domElement.removeEventListener('webglcontextlost',current.onContextLost);
  current.scene.traverse(object=>{
    if(object.geometry)object.geometry.dispose();
    const materials=object.material?(Array.isArray(object.material)?object.material:[object.material]):[];
    for(const material of materials)material.dispose();
  });
  current.texture.dispose();
  current.renderer.dispose();
  current.node.replaceChildren();
}

window.cosmicOrbit3D={mount,update,reset,dispose};
