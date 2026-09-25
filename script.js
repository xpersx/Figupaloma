const KEY="figupaloma_v6";
const PALOMAS={
  comun:{nombre:"Paloma común",precio:0,ganancia:1,img:"imagen/Paloma.svg"},
  urbana:{nombre:"Paloma urbana",precio:100,ganancia:3,img:"imagen/PalomaUrbana.svg"},
  mensajera:{nombre:"Paloma mensajera",precio:750,ganancia:10,img:"imagen/PalomaMensajera.svg"},
  imperial:{nombre:"Paloma imperial",precio:5000,ganancia:35,img:"imagen/PalomaImperial.svg"},
  figueroa:{nombre:"Figueroa",precio:25000,ganancia:100,img:"imagen/PalomaFigueroa.svg"}
};
const SPEED={facil:1100,medio:650,dificil:350};
const DIFFICULTY_REWARD={facil:1,medio:2,dificil:3};
let state=JSON.parse(localStorage.getItem(KEY)||"null")||{alas:0,racha:0,dificultad:"facil",activa:"comun",coleccion:["comun"],mejora:0};
const $=s=>document.querySelector(s);
const captureSound=new Audio("sonidos/captura.wav");
captureSound.preload="auto";
const alas=$("#alas"),racha=$("#racha"),nombre=$("#nombrePaloma"),ganancia=$("#ganancia"),pigeon=$("#paloma"),zone=$("#zonaJuego"),img=$("#imagenPaloma"),reloj=$("#reloj"),reward=$("#recompensa");
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function fmt(n){return Math.floor(n).toLocaleString("es-ES")}
function render(){
  const p=PALOMAS[state.activa]; alas.textContent=fmt(state.alas);racha.textContent=state.racha;
  nombre.textContent=p.nombre;ganancia.textContent="+"+fmt(p.ganancia*(1+state.mejora*.25))+" 🪽";img.src=p.img;
  document.querySelectorAll(".difficulty-btn").forEach(b=>b.classList.toggle("active",b.dataset.dificultad===state.dificultad));
  renderShop();renderCollection();$("#nivelMejora").textContent=state.mejora;
  const cost=Math.floor(250*Math.pow(1.65,state.mejora));$("#comprarMejora").textContent="Comprar · "+fmt(cost)+" 🪽";
}
function movePigeon(){
  const r=zone.getBoundingClientRect(),w=pigeon.offsetWidth,h=pigeon.offsetHeight,pad=8;
  const x=pad+Math.random()*Math.max(1,r.width-w-pad*2),y=pad+Math.random()*Math.max(1,r.height-h-pad*2);
  pigeon.style.left=x+"px";pigeon.style.top=y+"px";reloj.textContent="EN MOVIMIENTO";
}
function schedule(){clearTimeout(window.moveTimer);movePigeon();window.moveTimer=setTimeout(schedule,SPEED[state.dificultad])}
function playCaptureSound(){try{captureSound.currentTime=0;captureSound.play().catch(()=>{});}catch(e){}}\nfunction capture(){
  const p=PALOMAS[state.activa];state.racha++;playCaptureSound();
  const base=p.ganancia*(1+state.mejora*.25),streak=1+Math.min(state.racha,20)*.05;
  const earned=Math.max(1,Math.floor(base*streak));state.alas+=earned;save();render();
  reward.textContent="+"+fmt(earned)+" 🪽";reward.classList.remove("show");void reward.offsetWidth;reward.classList.add("show");
  setTimeout(()=>reward.classList.remove("show"),600);movePigeon();
}
pigeon.addEventListener("click",capture);
document.querySelectorAll(".difficulty-btn").forEach(b=>b.addEventListener("click",()=>{state.dificultad=b.dataset.dificultad;state.racha=0;save();render();schedule()}));
document.querySelectorAll(".nav-btn").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".nav-btn").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("#panel"+b.dataset.panel.charAt(0).toUpperCase()+b.dataset.panel.slice(1)).classList.add("active")}));
function renderShop(){
  $("#productos").innerHTML=Object.entries(PALOMAS).map(([id,p])=>`<article class="shop-card"><img src="${p.img}" alt=""><div class="card-info"><h4>${p.nombre}</h4><p>+${fmt(p.ganancia)} 🪽 por captura</p></div><button class="primary-btn" data-buy="${id}" ${state.coleccion.includes(id)?"disabled":""}>${state.coleccion.includes(id)?"Comprada":fmt(p.precio)+" 🪽"}</button></article>`).join("");
  document.querySelectorAll("[data-buy]").forEach(b=>b.addEventListener("click",()=>buy(b.dataset.buy)));
}
function buy(id){const p=PALOMAS[id];if(state.alas<p.precio)return;if(state.coleccion.includes(id))return;state.alas-=p.precio;state.coleccion.push(id);state.activa=id;save();render()}
function renderCollection(){
  $("#coleccion").innerHTML=state.coleccion.map(id=>{const p=PALOMAS[id];return `<button class="collection-card" data-select="${id}"><img src="${p.img}" alt=""><div class="card-info"><h4>${p.nombre}</h4><p>+${fmt(p.ganancia)} 🪽</p></div></button>`}).join("");
  document.querySelectorAll("[data-select]").forEach(b=>b.addEventListener("click",()=>{state.activa=b.dataset.select;save();render()}));
}
$("#comprarMejora").addEventListener("click",()=>{const cost=Math.floor(250*Math.pow(1.65,state.mejora));if(state.alas>=cost){state.alas-=cost;state.mejora++;save();render()}});
window.addEventListener("resize",movePigeon);
render();schedule();
