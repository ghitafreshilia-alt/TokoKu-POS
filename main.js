/* main.js — logika website: slide, tombol aplikasi, pengaturan admin. */
/* ================= PENYIMPANAN ================= */
const KEY = "gf_site_settings_v1";
const store = {
  get(){ try{ return JSON.parse(localStorage.getItem(KEY)) || {}; }catch(e){ return {}; } },
  set(v){ try{ localStorage.setItem(KEY, JSON.stringify(v)); return true; }catch(e){ return false; } }
};
let S = Object.assign({}, DEFAULTS, store.get());

async function hash(txt){
  try{
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt));
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
  }catch(e){ return "plain:" + txt; } // cadangan jika crypto tidak tersedia
}
async function checkPass(input, hashKey, defPlain){
  const target = S[hashKey] || await hash(defPlain);
  return (await hash(input)) === target;
}

/* ================= RENDER ================= */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function renderContact(){
  const digits = S.phone.replace(/[^\d]/g,"").replace(/^0/,"62");
  $("#cPhone").textContent = S.phone;
  $("#cPhone").href = "https://wa.me/" + digits;
  $("#cEmail").textContent = S.email;
  $("#cEmail").href = "mailto:" + S.email;
  $("#footBrand").textContent = S.brand;
  $("#year").textContent = new Date().getFullYear();
}
renderContact();

/* ================= SMOOTH SLIDING ================= */
const track = $("#track"), slides = [...document.querySelectorAll(".slide")];
const navBtns = [...document.querySelectorAll("#navLinks button")];
const dots = $("#dots");
let cur = 0, busy = false;
slides.forEach((_,i)=>{ const b=document.createElement("button"); b.setAttribute("aria-label","Halaman "+(i+1)); b.onclick=()=>go(i); dots.appendChild(b); });

function go(i){
  if(i<0 || i>=slides.length || i===cur && track.style.transform) return;
  cur = i;
  track.style.transform = `translateX(-${i*100/slides.length}%)`;
  slides.forEach((s,k)=>s.classList.toggle("current",k===i));
  navBtns.forEach((b,k)=>b.classList.toggle("active",k===i));
  [...dots.children].forEach((d,k)=>d.classList.toggle("active",k===i));
  $("#prev").disabled = i===0; $("#next").disabled = i===slides.length-1;
  busy = true; setTimeout(()=>busy=false, 900);
}
navBtns.forEach(b=>b.onclick=()=>go(+b.dataset.go));
$("#prev").onclick=()=>go(cur-1); $("#next").onclick=()=>go(cur+1);
document.addEventListener("keydown",e=>{
  if(document.querySelector(".modal.open")) return;
  if(e.key==="ArrowRight") go(cur+1);
  if(e.key==="ArrowLeft") go(cur-1);
});
// geser (swipe) di layar sentuh
let sx=0, sy=0;
track.addEventListener("touchstart",e=>{sx=e.touches[0].clientX; sy=e.touches[0].clientY},{passive:true});
track.addEventListener("touchend",e=>{
  const dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy;
  if(Math.abs(dx)>60 && Math.abs(dx)>Math.abs(dy)*1.5) go(cur + (dx<0?1:-1));
});
// geser horizontal dengan trackpad
window.addEventListener("wheel",e=>{
  if(busy || document.querySelector(".modal.open")) return;
  if(Math.abs(e.deltaX)>40 && Math.abs(e.deltaX)>Math.abs(e.deltaY)) go(cur + (e.deltaX>0?1:-1));
},{passive:true});
go(0);

/* ================= MODAL ================= */
function openM(id){ const m=$(id); m.classList.add("open"); setTimeout(()=>{ const f=m.querySelector("input"); f&&f.focus(); },200); }
function closeM(m){ m.classList.remove("open"); m.querySelectorAll(".err").forEach(e=>e.textContent=""); m.querySelectorAll("input[type=password]").forEach(i=>i.value=""); }
document.querySelectorAll(".modal").forEach(m=>{
  m.addEventListener("click",e=>{ if(e.target===m || e.target.hasAttribute("data-close")) closeM(m); });
});
document.addEventListener("keydown",e=>{ if(e.key==="Escape") document.querySelectorAll(".modal.open").forEach(closeM); });
document.querySelectorAll("[data-eye]").forEach(b=>b.onclick=()=>{ const i=document.getElementById(b.dataset.eye); i.type = i.type==="password"?"text":"password"; });

function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2600); }
function fail(form, errEl, msg){ errEl.textContent=msg; form.classList.remove("shake"); void form.offsetWidth; form.classList.add("shake"); }

/* ===== Tombol TokoKu POS → langsung ke Google Play ===== */
$("#btnTokoku").onclick = () => { window.location.href = S.playUrl; };

/* ===== Tombol Akunia → langsung ke website Akunia ===== */
$("#btnAkunia").onclick = () => { window.location.href = S.akuniaUrl; };

/* ===== Pengaturan (dilindungi sandi admin) ===== */
$("#openSettings").onclick = () => openM("#mAdmin");
$("#fAdmin").onsubmit = async e => {
  e.preventDefault();
  const ok = await checkPass($("#adPass").value, "adminHash", DEFAULTS.adminPass);
  if(!ok) return fail(e.target, $("#adErr"), "Kata sandi administrator salah.");
  closeM($("#mAdmin"));
  $("#sPhone").value = S.phone; $("#sEmail").value = S.email;
  $("#sPlay").value = S.playUrl; $("#sAkunia").value = S.akuniaUrl;
  openM("#mSettings");
};

$("#fSettings").onsubmit = async e => {
  e.preventDefault();
  const err = $("#sErr");
  const email = $("#sEmail").value.trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(e.target, err, "Format email tidak valid.");
  const next = Object.assign({}, store.get(), {
    phone: $("#sPhone").value.trim() || DEFAULTS.phone,
    email,
    playUrl: $("#sPlay").value.trim() || DEFAULTS.playUrl,
    akuniaUrl: $("#sAkunia").value.trim() || DEFAULTS.akuniaUrl
  });
  const ad=$("#sAdPass").value;
  if(ad){ if(ad.length<6) return fail(e.target, err, "Sandi admin minimal 6 karakter."); next.adminHash = await hash(ad); }
  if(!store.set(next)) return fail(e.target, err, "Penyimpanan penuh / diblokir browser.");
  S = Object.assign({}, DEFAULTS, next);
  renderContact(); closeM($("#mSettings"));
  toast("Pengaturan berhasil disimpan");
};

$("#resetAll").onclick = () => {
  if(!confirm("Kembalikan semua pengaturan ke nilai awal?")) return;
  try{ localStorage.removeItem(KEY); }catch(e){}
  S = Object.assign({}, DEFAULTS);
  renderContact(); closeM($("#mSettings"));
  toast("Pengaturan dikembalikan ke awal");
};
