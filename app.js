import * as THREE from 'three';
import {RectAreaLightUniformsLib} from './vendor/RectAreaLightUniformsLib.js';
const $=id=>document.getElementById(id);
try { init(); } catch(e) { $('error').hidden=false;$('error').textContent='Не удалось запустить 3D. Попробуйте браузер с поддержкой WebGL 2. '+e.message; }
function init(){
RectAreaLightUniformsLib.init();
const scene=new THREE.Scene();scene.background=new THREE.Color('#131c19');scene.fog=new THREE.FogExp2('#131c19',.025);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.08,60);camera.position.set(0,1.65,5);camera.rotation.order='YXZ';
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;$('scene').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0x9fbdb7,0x302a1e,.32));
const materials={wall:new THREE.MeshStandardMaterial({color:0x92918a,roughness:.96}),wood:new THREE.MeshStandardMaterial({color:0x564032,roughness:.78}),dark:new THREE.MeshStandardMaterial({color:0x191f1a,roughness:.8}),cloth:new THREE.MeshStandardMaterial({color:0x48554a,roughness:1}),floor:new THREE.MeshStandardMaterial({color:0x715a43,roughness:.6})};
const colliders=[];
function box(name,x,y,z,w,h,d,mat,solid=false){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),materials[mat]||mat);m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);if(solid)colliders.push({minX:x-w/2-.22,maxX:x+w/2+.22,minZ:z-d/2-.22,maxZ:z+d/2+.22});return m;}
box('floor',0,-.12,0,14,.24,14,'floor');box('ceiling',0,3.65,0,14,.18,14,'wall');
for(let x=-6.8;x<7;x+=.45)box('floor joint',x,.003,0,.008,.008,14,'dark');
box('north wall',0,1.8,-7,14,3.6,.2,'wall',true);box('south wall',0,1.8,7,14,3.6,.2,'wall',true);box('west wall',-7,1.8,0,.2,3.6,14,'wall',true);box('east wall',7,1.8,0,.2,3.6,14,'wall',true);
// Two side rooms, each reached through a 2.4-metre opening.
for(const x of [-2.5,2.5]){box('partition rear',x,1.8,-4.3,.18,3.6,5.4,'wall',true);box('partition front',x,1.8,3.9,.18,3.6,6.2,'wall',true);box('door lintel',x,3.2,-.4,.18,.8,2.4,'wood');}
for(const x of [-6.88,6.88,-2.38,2.38])box('skirting',x,.08,0,.06,.16,14,'wood');
// Sparse domestic furniture, with navigable collision bounds.
box('sofa',-5.1,.4,3.8,2.5,.6,1,'cloth',true);box('sofa back',-5.1,.88,4.23,2.5,.75,.2,'cloth');
for(const x of [-6.3,-3.9])box('sofa arm',x,.66,3.8,.2,.5,1.1,'cloth');
box('table top',-5,.55,1.9,1.5,.1,.8,'wood',true);for(const x of [-5.6,-4.4])for(const z of [1.6,2.2])box('table leg',x,.25,z,.07,.5,.07,'dark');
box('bench',0,.46,-3.2,2.3,.14,.7,'wood',true);for(const x of [-.9,.9])box('bench leg',x,.2,-3.2,.12,.4,.55,'dark');
box('bed base',5,.3,3.5,2.3,.6,3,'wood',true);box('bed linen',5,.65,3.5,2.25,.23,2.9,'cloth');box('pillow',5,.84,4.4,1.5,.18,.5,'wall');
box('console',4.7,.7,-5.7,2.5,.1,.65,'wood',true);for(const x of [3.65,5.75])box('console leg',x,.35,-5.7,.08,.7,.5,'dark');
const loader=new THREE.TextureLoader(), photos=[], clickable=[];
const specs=[{title:'Там, где тихо',caption:'01 / Гостиная · Тёплый вечер',pos:[0,1.95,-6.83],rot:0,color:0xffbc70},{title:'Воздух после дождя',caption:'02 / Западная комната · Лес',pos:[-6.83,1.95,-2.4],rot:Math.PI/2,color:0x95d9b0},{title:'Последний снег',caption:'03 / Восточная комната · Горы',pos:[6.83,1.95,-2.4],rot:-Math.PI/2,color:0xb7d9ff}];
specs.forEach((s,i)=>{const group=new THREE.Group();group.position.set(...s.pos);group.rotation.y=s.rot;scene.add(group);
 const frame=new THREE.Mesh(new THREE.BoxGeometry(.52,.38,.045),materials.dark);group.add(frame);
 const mat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:.12,roughness:.38});
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.48,.339),mat);mesh.position.z=.024;group.add(mesh);
 const light=new THREE.RectAreaLight(s.color,0,.48,.339);light.position.z=.035;light.rotation.y=Math.PI;group.add(light);
 // A low-energy shadow-casting bounce adds contact to the area light.
 const bounce=new THREE.SpotLight(s.color,0,10,1.1,.85,1.7);bounce.position.z=.25;bounce.target.position.z=4;bounce.castShadow=true;bounce.shadow.mapSize.set(512,512);group.add(bounce,bounce.target);
 const p={...s,mesh,mat,light,bounce,on:false,power:1.5,level:0,index:i};photos.push(p);mesh.userData.photo=p;clickable.push(mesh);
 loader.load('./photos/'+i+'.jpg',texture=>setTexture(p,texture),undefined,()=>{$('status').textContent='Можно загрузить свои фотографии через панель снимка.';});
 const dot=new THREE.Mesh(new THREE.SphereGeometry(.006,8,8),new THREE.MeshBasicMaterial({color:0xd6bc91}));dot.position.set(.235,-.18,.026);group.add(dot);
});
function setTexture(p,t){t.colorSpace=THREE.SRGBColorSpace;const a=t.image.width/t.image.height,target=1.8/1.27;if(a>target){t.repeat.x=target/a;t.offset.x=(1-t.repeat.x)/2;}else{t.repeat.y=a/target;t.offset.y=(1-t.repeat.y)/2;}p.mat.map?.dispose();p.mat.map=t;p.mat.emissiveMap=t;p.mat.needsUpdate=true;const c=document.createElement('canvas');c.width=c.height=1;const ctx=c.getContext('2d');try{ctx.drawImage(t.image,0,0,1,1);const v=ctx.getImageData(0,0,1,1).data;p.light.color.setRGB(v[0]/255,v[1]/255,v[2]/255,THREE.SRGBColorSpace);p.bounce.color.copy(p.light.color);}catch{}}
let entered=false,selected=null,hovered=null,yaw=0,pitch=0;const keys=new Set(),ray=new THREE.Raycaster();const canvas=renderer.domElement;
const coarse=matchMedia('(pointer:coarse)').matches;
const resume=document.createElement('button');resume.id='resume';resume.hidden=true;resume.textContent='Продолжить · захватить мышь';document.body.appendChild(resume);
const controlNotice=document.createElement('div');controlNotice.id='control-notice';controlNotice.hidden=true;document.body.appendChild(controlNotice);
canvas.tabIndex=0;
async function lock(){document.activeElement?.blur();canvas.focus();if(coarse)return;try{if(!canvas.requestPointerLock)throw Error('unsupported');await canvas.requestPointerLock();}catch{showLockFailure();}}
function showLockFailure(){controlNotice.hidden=false;controlNotice.textContent='Браузер не разрешил захват мыши. Нажмите «Продолжить». Если не помогает — откройте эту ссылку в Chrome или Edge. Пока можно осматриваться, удерживая правую кнопку мыши.';resume.hidden=false;}
document.addEventListener('pointerlockerror',showLockFailure);
resume.onclick=()=>{controlNotice.hidden=true;lock();};
document.addEventListener('pointerlockchange',()=>{keys.clear();const locked=document.pointerLockElement===canvas;resume.hidden=locked||!entered||coarse||!$('panel').hidden||$('instructions').open;controlNotice.hidden=true;$('crosshair').hidden=!locked&&!coarse;document.body.classList.toggle('playing',locked);});
function reset(){camera.position.set(0,1.65,5);yaw=pitch=0;camera.rotation.set(0,0,0);}
$('enter').onclick=()=>{entered=true;document.activeElement.blur();$('intro').hidden=true;$('crosshair').hidden=false;lock();};
$('reset').onclick=()=>{reset();$('panel').hidden=true;selected=null;if(entered)lock();};
$('help').onclick=()=>{document.exitPointerLock?.();keys.clear();$('instructions').showModal();};$('dismiss').onclick=()=>{$('instructions').close();if(entered)lock();};
function updatePanel(){if(!selected)return;$('number').textContent=String(selected.index+1).padStart(2,'0');$('title').textContent=selected.title;$('caption').textContent=selected.caption;$('toggle').textContent=selected.on?'Выключить свет':'Включить свет';$('power').value=selected.power;}
function activate(p){selected=p;p.on=!p.on;updatePanel();}
function editPhoto(p){selected=p;updatePanel();$('panel').hidden=false;resume.hidden=true;document.exitPointerLock?.();keys.clear();}
$('toggle').onclick=()=>{selected.on=!selected.on;updatePanel();};$('power').oninput=e=>{if(selected)selected.power=Number(e.target.value);};$('close').onclick=()=>{$('panel').hidden=true;lock();};
$('upload').onchange=e=>{const f=e.target.files[0],p=selected;if(!f||!p)return;if(f.size>25*1024*1024){$('caption').textContent='Выберите изображение меньше 25 МБ.';return;}const url=URL.createObjectURL(f);loader.load(url,t=>{setTexture(p,t);URL.revokeObjectURL(url);p.title=f.name.replace(/\.[^.]+$/,'');p.caption='Ваш снимок · хранится только в текущей сессии';p.on=true;updatePanel();},undefined,()=>{URL.revokeObjectURL(url);$('caption').textContent='Не удалось открыть изображение. Попробуйте JPG или PNG.';});};
function pick(x=0,y=0){ray.setFromCamera(new THREE.Vector2(x,y),camera);const hit=ray.intersectObjects(clickable)[0];if(!hit||hit.distance>5)return null; // Prevent interactions through room walls.
 const obstruction=ray.intersectObjects(scene.children,true).find(h=>h.object.isMesh&&h.distance<hit.distance-.08);return obstruction?null:hit.object.userData.photo;}
canvas.addEventListener('click',e=>{if(!entered)return;if(!coarse&&document.pointerLockElement!==canvas){$('panel').hidden=true;lock();return;}const p=coarse?pick(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2):pick();if(p)activate(p);});
let rightDrag=false;canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('mousedown',e=>{if(e.button===2)rightDrag=true;});addEventListener('mouseup',()=>rightDrag=false);
document.addEventListener('mousemove',e=>{if(!entered||!$('panel').hidden||$('instructions').open)return;if(document.pointerLockElement!==canvas&&!rightDrag)return;yaw-=e.movementX*.002;pitch=THREE.MathUtils.clamp(pitch-e.movementY*.002,-1.5,1.5);});
addEventListener('keydown',e=>{if(!entered||/INPUT/.test(document.activeElement.tagName)||$('instructions').open||!$('panel').hidden)return;if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.code==='KeyE'&&!e.repeat&&hovered)activate(hovered);if(e.code==='KeyR'&&!e.repeat&&hovered)editPhoto(hovered);});addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>{keys.clear();rightDrag=false;touchMove={x:0,y:0};});document.addEventListener('pointerlockchange',()=>keys.clear());
let touchMove={x:0,y:0};const touches=new Map();canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||!entered)return;canvas.setPointerCapture(e.pointerId);touches.set(e.pointerId,{x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,left:e.clientX<innerWidth/2});});canvas.addEventListener('pointermove',e=>{const t=touches.get(e.pointerId);if(!t)return;if(t.left){touchMove.x=THREE.MathUtils.clamp((e.clientX-t.startX)/65,-1,1);touchMove.y=THREE.MathUtils.clamp((e.clientY-t.startY)/65,-1,1);}else{yaw-=(e.clientX-t.x)*.004;pitch=THREE.MathUtils.clamp(pitch-(e.clientY-t.y)*.004,-1.35,1.35);}t.x=e.clientX;t.y=e.clientY;});function endTouch(e){if(touches.get(e.pointerId)?.left)touchMove={x:0,y:0};touches.delete(e.pointerId);}canvas.addEventListener('pointerup',endTouch);canvas.addEventListener('pointercancel',endTouch);
function blocked(x,z){return x< -6.7||x>6.7||z< -6.7||z>6.7||colliders.some(b=>x>b.minX&&x<b.maxX&&z>b.minZ&&z<b.maxZ);}
const clock=new THREE.Clock();function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);camera.rotation.set(pitch,yaw,0);if(entered&&!$('instructions').open&&$('panel').hidden&&(coarse||document.pointerLockElement===canvas||rightDrag)){let x=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'))+touchMove.x;let z=Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'))+touchMove.y;const len=Math.max(1,Math.hypot(x,z));x/=len;z/=len;const speed=(keys.has('ShiftLeft')||keys.has('ShiftRight')?4.3:2.3)*dt;const dx=(x*Math.cos(yaw)+z*Math.sin(yaw))*speed,dz=(-x*Math.sin(yaw)+z*Math.cos(yaw))*speed;if(!blocked(camera.position.x+dx,camera.position.z))camera.position.x+=dx;if(!blocked(camera.position.x,camera.position.z+dz))camera.position.z+=dz;}
 photos.forEach(p=>{p.level=THREE.MathUtils.damp(p.level,p.on?p.power:0,4,dt);p.light.intensity=p.level*98;p.bounce.intensity=p.level*9;p.mat.emissiveIntensity=.12+p.level*1.1;});
 hovered=entered?pick():null;$('hint').hidden=!hovered||!$('panel').hidden;if(hovered)$('hint').textContent=hovered.title+' · '+(hovered.on?'Выключить':'Включить')+' [E / клик] · R — заменить снимок';if(entered){const room=camera.position.x< -2.5?'Западная комната':camera.position.x>2.5?'Восточная комната':'Гостиная';$('status').textContent=room+' / Свет: '+photos.filter(p=>p.on).length+' из 3';}renderer.render(scene,camera);}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});animate();
}

