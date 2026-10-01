const freshState=()=>({gold:12500,food:8000,essence:250,power:1250,level:1,seals:0,crystals:0,wins:0,buildings:{Keep:1,Farm:1,Barracks:1,Forge:1,"Dragon Sanctuary":1},troops:{Swordsmen:120,Archers:80,Guardians:30},dragons:{Drago:1,Nyx:0,Tharros:0,Kaelith:0,Veyra:0}});
let S=freshState();
try{const saved=localStorage.getItem("forgedDragonSave");if(saved)S=Object.assign(freshState(),JSON.parse(saved))}catch(e){}
function saveGame(){try{localStorage.setItem("forgedDragonSave",JSON.stringify(S))}catch(e){}}
const buildings={Keep:["🏰","Heart of Emberhold",1800,900],Farm:["🌾","Feeds the war host",900,300],Barracks:["⚔️","Raises warriors for clan war",1200,600],Forge:["🔥","Forges weapons against corrupted armies",1400,500],"Dragon Sanctuary":["🐉","Strengthens bonds with ancient dragons",2200,800]};
const troopData={Swordsmen:["🗡️",100,45,12],Archers:["🏹",130,55,15],Guardians:["🛡️",220,90,28]};
const dragonData={Drago:["🔥","First Flame • bonded",0,0],Nyx:["🌑","Shadow Wing • found beyond the Mist",180,1],Tharros:["⚡","Storm Dragon • waits beyond the Second Seal",260,2],Kaelith:["❄️","Frost Guardian • crystal-bound",340,4],Veyra:["✨","Crystal Seer • ancient bond",450,5]};
const realms=[
["Emberhold","🔥","Ash Raiders","Drago guards the road to the First Seal.",850,0,0],
["Mistwood","🌫️","Clan Nightfang","Nyx moves unseen beneath the black trees.",1450,1,1],
["Stormspire","⚡","Clan Iron Crown","Tharros answers from the mountain storm.",2200,2,2],
["Zephyr's Crossing","🪽","Xarath's Legion","Zephyr's path is revealed where the realms divide.",3000,3,3],
["Malaki's Reach","🗡️","Malaki's Shadow Guard","An old power waits behind the Fifth Seal.",3900,4,4],
["The Black Citadel","🏯","Xarath","The final crystal burns beneath the throne.",5200,6,6]
];
const clans=[["🔥","House Ember","Keepers of the First Flame"],["🌑","Nightfang","Hunters of the Mist Roads"],["⚔️","Iron Crown","Warriors of Stormspire"],["👹","Legion of Xarath","Corrupted armies of the Black Citadel"],["🗡️","Shadow Guard","Malaki's hidden war host"],["🐉","The Forged","A clan united by dragons, seals and mercy"]];
const $=s=>document.querySelector(s),fmt=n=>Math.floor(n).toLocaleString();
function card(ic,n,d,a,b,act,label,dis=false){return `<article class="card"><div class="icon">${ic}</div><h3>${n}</h3><p>${d}</p><div class="meta"><span>${a}</span><span>${b}</span></div>${act?`<button class="action" ${dis?"disabled":""} onclick="${act}">${label}</button>`:""}</article>`}
function sync(){saveGame();["gold","food","essence","power","level"].forEach(k=>$("#"+k).textContent=fmt(S[k]));$("#sealCount").textContent=`${S.seals} / 7`;$("#crystalCount").textContent=`${S.crystals} / 7`;document.querySelectorAll(".mirrorSeal").forEach(x=>x.textContent=`${S.seals} / 7`);document.querySelectorAll(".mirrorCrystal").forEach(x=>x.textContent=`${S.crystals} / 7`);$("#sealDots").innerHTML=dots(S.seals);$("#crystalDots").innerHTML=dots(S.crystals);render()}
function dots(n){return Array.from({length:7},(_,i)=>`<i class="relic ${i<n?"on":""}"></i>`).join("")}
function render(){let b="";for(const[n,d]of Object.entries(buildings)){let l=S.buildings[n],g=d[2]*l,f=d[3]*l;b+=card(d[0],n,d[1],`Level ${l}`,`🪙 ${fmt(g)} • 🌾 ${fmt(f)}`,`upgrade('${n}')`,"UPGRADE")}$("#buildings").innerHTML=b;
$("#troops").innerHTML=Object.entries(troopData).map(([n,d])=>card(d[0],n,`Attack ${d[3]} each`,`${fmt(S.troops[n])} troops`,`🪙 ${d[1]*10} • 🌾 ${d[2]*10}`,`train('${n}')`,"TRAIN 10")).join("");
$("#dragonList").innerHTML=Object.entries(dragonData).map(([n,d])=>{let l=S.dragons[n],locked=S.seals<d[3],cost=l?80*l:d[2];return card(d[0],n,d[1],l?`Level ${l}`:locked?`Needs ${d[3]} Seals`:"Sleeping",cost?`💎 ${cost}`:"Bonded",locked?"":`dragon('${n}')`,l?"TRAIN":"AWAKEN",locked)}).join("");
$("#realmMap").innerHTML=realms.map((r,i)=>{let locked=S.seals<r[5]||S.crystals<r[6];return `<article class="realm ${locked?"locked":""}"><div class="realm-icon">${r[1]}</div><h3>${r[0]}</h3><p class="story">${r[3]}</p><div class="meta"><span>⚔️ ${r[2]}</span><span>Power ${fmt(r[4])}</span></div><button class="action" ${locked?"disabled":""} onclick="realmFight(${i})">${locked?"SEALED":"MARCH TO BATTLE"}</button></article>`}).join("");
$("#clanList").innerHTML=clans.map((c,i)=>card(c[0],c[1],c[2],i<3?"Rival Clan":i<5?"Enemy Faction":"Player Clan",i<5?"Territory War":"Form / Join","","")).join("");
let q=[["The First Seal",S.seals>=1,"Defeat the Ash Raiders"],["Bond with Nyx",S.dragons.Nyx>0,"Find Nyx beyond the Mist"],["Awaken Tharros",S.dragons.Tharros>0,"Break the Second Seal"],["Find Zephyr's Path",S.seals>=3&&S.crystals>=3,"Reach Zephyr's Crossing"],["Face Malaki's Guard",S.seals>=4,"Open the road to Malaki's Reach"],["Seven Crystals",S.crystals>=7,"Recover all Seven Crystals"]];$("#questList").innerHTML=q.map(x=>card(x[1]?"✅":"📜",x[0],x[2],x[1]?"Complete":"In progress",x[1]?"FORGED":"LOCKED","","")).join("")}
function armyPower(){return Object.entries(S.troops).reduce((a,[n,c])=>a+c*troopData[n][3],0)+Object.values(S.dragons).reduce((a,l)=>a+l*350,0)+S.buildings.Forge*100}
function realmFight(i){let r=realms[i],strength=armyPower()*(.8+Math.random()*.45);if(strength>=r[4]){S.wins++;S.gold+=900+i*500;S.food+=450+i*250;S.essence+=35+i*10;S.power+=150+i*90;S.crystals=Math.min(7,S.crystals+1);if(i<5)S.seals=Math.min(7,Math.max(S.seals,i+1));msg(`🔥 VICTORY AT ${r[0]} — ${r[2]} has fallen. Relic recovered: Seal ${S.seals}/7 • Crystal ${S.crystals}/7.`)}else{Object.keys(S.troops).forEach(n=>S.troops[n]=Math.floor(S.troops[n]*.94));S.power=Math.max(0,S.power-60);msg(`⚔️ DEFEAT AT ${r[0]} — ${r[2]} holds the realm. Strengthen your army and dragons before returning.`)}sync()}
function upgrade(n){let l=S.buildings[n],d=buildings[n],g=d[2]*l,f=d[3]*l;if(S.gold<g||S.food<f)return msg("Not enough resources.");S.gold-=g;S.food-=f;S.buildings[n]++;S.power+=250*l;if(n==="Keep")S.level++;msg(`${n} rises to Level ${l+1}.`);sync()}
function train(n){let d=troopData[n],g=d[1]*10,f=d[2]*10;if(S.gold<g||S.food<f)return msg("The stores cannot support those troops.");S.gold-=g;S.food-=f;S.troops[n]+=10;S.power+=d[3]*10;msg(`10 ${n} join the Forged war host.`);sync()}
function dragon(n){let d=dragonData[n],l=S.dragons[n],cost=l?80*l:d[2];if(S.seals<d[3])return msg(`${n} cannot be reached until more Seals are broken.`);if(S.essence<cost)return msg("Not enough Dragon Essence.");S.essence-=cost;S.dragons[n]=l+1;S.power+=500*(l+1);msg(`🐉 ${n} answers the call. The bond grows stronger.`);sync()}
function msg(t){$("#battleLog").textContent=t}
document.querySelectorAll(".tabs button").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".tabs button,.tab").forEach(x=>x.classList.remove("active"));btn.classList.add("active");$("#"+btn.dataset.tab).classList.add("active")}));
sync();

// BABYLON.JS — 3D EMBERHOLD
(function initEmberhold3D(){
 const canvas=document.getElementById("realmCanvas"); if(!canvas||!window.BABYLON)return;
 const engine=new BABYLON.Engine(canvas,true,{preserveDrawingBuffer:true,stencil:true});
 const scene=new BABYLON.Scene(engine); scene.clearColor=new BABYLON.Color4(.035,.018,.01,1);
 scene.fogMode=BABYLON.Scene.FOGMODE_EXP2; scene.fogDensity=.018; scene.fogColor=new BABYLON.Color3(.09,.045,.02);
 const camera=new BABYLON.ArcRotateCamera("ForgedCamera",-Math.PI/2,1.05,34,new BABYLON.Vector3(0,2,0),scene);
 camera.attachControl(canvas,true); camera.lowerRadiusLimit=16; camera.upperRadiusLimit=48; camera.lowerBetaLimit=.55; camera.upperBetaLimit=1.35; camera.wheelDeltaPercentage=.01; camera.pinchDeltaPercentage=.01;
 const hemi=new BABYLON.HemisphericLight("moon",new BABYLON.Vector3(0,1,0),scene); hemi.intensity=.48; hemi.diffuse=new BABYLON.Color3(.75,.5,.3);
 const fire=new BABYLON.PointLight("ember",new BABYLON.Vector3(0,8,2),scene); fire.diffuse=new BABYLON.Color3(1,.28,.04); fire.intensity=2.2; fire.range=28;
 function mat(name,color,emissive){const m=new BABYLON.StandardMaterial(name,scene);m.diffuseColor=BABYLON.Color3.FromHexString(color);m.specularColor=new BABYLON.Color3(.08,.06,.04);if(emissive)m.emissiveColor=BABYLON.Color3.FromHexString(emissive);return m}
 const basalt=mat("Forged basalt","#3b2920"),stone=mat("ember stone","#6a4933"),bronze=mat("ancient bronze","#7a451d"),lava=mat("forged fire","#7a1905","#ff3b05"),crystal=mat("crystal","#164a5a","#19d3ff");
 const ground=BABYLON.MeshBuilder.CreateCylinder("Emberhold",{height:1.8,diameterTop:29,diameterBottom:24,tessellation:8},scene);ground.position.y=-1;ground.material=basalt;
 const ring=BABYLON.MeshBuilder.CreateTorus("Seal Ring",{diameter:20,thickness:.45,tessellation:32},scene);ring.rotation.x=Math.PI/2;ring.position.y=.05;ring.material=bronze;
 function box(n,x,y,z,w,h,d,material=stone){const b=BABYLON.MeshBuilder.CreateBox(n,{width:w,height:h,depth:d},scene);b.position.set(x,y,z);b.material=material;b.metadata={building:n};return b}
 function tower(n,x,z,h=5){const t=BABYLON.MeshBuilder.CreateCylinder(n,{height,diameter:3.1,tessellation:6},scene);t.position.set(x,h/2,z);t.material=stone;t.metadata={building:n};const crown=BABYLON.MeshBuilder.CreateCylinder(n+" crown",{height:.9,diameterTop:3.8,diameterBottom:3.2,tessellation:6},scene);crown.position.set(x,h+.2,z);crown.material=bronze;crown.metadata=t.metadata;return t}
 box("Keep",0,2.6,0,7,5.2,6);box("Keep",-0,5.8,0,4.6,1.3,4.1,bronze);
 tower("Keep",-4,-3,5.5);tower("Keep",4,-3,5.5);tower("Keep",-4,3,5.5);tower("Keep",4,3,5.5);
 box("Barracks",-8,1.35,3,5,2.7,4);box("Forge",8,1.35,3,5,2.7,4);box("Dragon Sanctuary",7,1.2,-5,5.5,2.4,4.5);box("Farm",-7,.7,-5,5,1.4,4);
 for(let i=0;i<7;i++){const a=i/7*Math.PI*2;const c=BABYLON.MeshBuilder.CreatePolyhedron("Crystal "+(i+1),{type:1,size:.65},scene);c.position.set(Math.cos(a)*11,1,Math.sin(a)*11);c.material=i<S.crystals?crystal:basalt}
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const p=BABYLON.MeshBuilder.CreateCylinder("wall",{height:2.5,diameter:2.3,tessellation:6},scene);p.position.set(Math.cos(a)*12,1.25,Math.sin(a)*12);p.material=stone}
 scene.onPointerObservable.add(pi=>{if(pi.type!==BABYLON.PointerEventTypes.POINTERPICK)return;const pick=pi.pickInfo;if(!pick?.hit)return;let m=pick.pickedMesh;const n=m?.metadata?.building;if(n&&buildings[n]){document.getElementById("buildingInfo").textContent=n.toUpperCase()+" — "+buildings[n][1].toUpperCase()+" • LEVEL "+S.buildings[n];}});
 engine.runRenderLoop(()=>{fire.intensity=1.8+Math.sin(performance.now()/180)*.35;scene.render()});window.addEventListener("resize",()=>engine.resize());
})();