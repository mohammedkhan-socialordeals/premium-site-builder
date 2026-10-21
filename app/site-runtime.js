(()=>{"use strict";
const d=document,h=d.documentElement,W=window,rm=matchMedia("(prefers-reduced-motion: reduce)").matches,fine=matchMedia("(hover: hover) and (pointer: fine)").matches,desk=()=>innerWidth>=900,IO="IntersectionObserver"in W,$$=(s,r)=>[...(r||d).querySelectorAll(s)],clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
h.classList.add("js");
/* one shared scroll loop */
const loops=new Set();let tick=0;const frame=()=>{tick=0;loops.forEach(f=>f())};const req=()=>{if(!tick){tick=1;requestAnimationFrame(frame)}};
addEventListener("scroll",req,{passive:true});addEventListener("resize",req);
const whenVisible=(el,f)=>{if(!IO){loops.add(f);return}new IntersectionObserver(es=>es.forEach(e=>{e.isIntersecting?loops.add(f):loops.delete(f);req()}),{rootMargin:"200px 0px"}).observe(el)};
/* header, page progress */
const hd=d.querySelector("[data-header]");let ly=scrollY;
loops.add(()=>{const y=scrollY;if(hd){hd.classList.toggle("is-scrolled",y>24);hd.classList.toggle("is-hidden",y>ly&&y>360&&!h.classList.contains("nav-open"));h.style.setProperty("--header-h",hd.offsetHeight+"px")}ly=y;const max=d.documentElement.scrollHeight-innerHeight;h.style.setProperty("--page-progress",max>0?(y/max).toFixed(4):0)});
/* mobile nav */
const tg=$$("[data-nav-toggle]"),setNav=o=>{h.classList.toggle("nav-open",o);tg.forEach(b=>b.setAttribute("aria-expanded",o))};
tg.forEach(b=>{b.setAttribute("aria-expanded","false");b.addEventListener("click",()=>setNav(!h.classList.contains("nav-open")))});
$$("[data-nav] a").forEach(a=>a.addEventListener("click",()=>setNav(false)));
addEventListener("keydown",e=>{if(e.key==="Escape")setNav(false)});
/* word splitting (split headlines and scrub text) */
const split=(el,cls)=>{let i=0;const out=[];const walk=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===3){const f=d.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(p=>{if(!p)return;if(/^\s+$/.test(p)){f.appendChild(d.createTextNode(p));return}const s=d.createElement("span");if(cls){s.className=cls;s.textContent=p;out.push(s);f.appendChild(s)}else{const w=d.createElement("span");w.className="w";s.textContent=p;s.style.setProperty("--i",i++);w.appendChild(s);f.appendChild(w)}});c.replaceWith(f)}else if(c.nodeType===1&&!c.matches("br,svg,img"))walk(c)})};walk(el);return out};
$$("[data-split]").forEach(el=>split(el));
/* entrances */
const io=IO&&!rm?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("is-in");io.unobserve(e.target)}}),{rootMargin:"0px 0px -8% 0px",threshold:.06}):null;
$$("[data-reveal],[data-split]").forEach(el=>{if(el.dataset.reveal==="stagger")[...el.children].forEach((c,i)=>c.style.setProperty("--i",i));io?io.observe(el):el.classList.add("is-in")});
/* scrub text */
$$("[data-scrub]").forEach(el=>{const ws=split(el,"sw");if(rm){ws.forEach(w=>w.classList.add("on"));return}whenVisible(el,()=>{const r=el.getBoundingClientRect(),vh=innerHeight,p=clamp((vh*.85-r.top)/(r.height+vh*.35),0,1),n=Math.round(p*ws.length);ws.forEach((w,i)=>w.classList.toggle("on",i<n))})});
/* --progress for scroll-linked CSS */
$$("[data-scroll]").forEach(el=>{if(rm){el.style.setProperty("--progress",0);el.style.setProperty("--exit",0);return}whenVisible(el,()=>{const r=el.getBoundingClientRect(),vh=innerHeight;el.style.setProperty("--progress",clamp((vh-r.top)/(vh+r.height),0,1).toFixed(4));el.style.setProperty("--exit",clamp(-r.top/Math.max(1,r.height),0,1).toFixed(4))})});
/* parallax */
if(!rm){$$("[data-parallax]").forEach(el=>whenVisible(el,()=>{if(!desk()){el.style.transform="";return}const r=el.getBoundingClientRect(),f=parseFloat(el.dataset.parallax)||.12;el.style.transform="translate3d(0,"+((r.top+r.height/2-innerHeight/2)*-f).toFixed(1)+"px,0)"}))}
/* pinned horizontal scroll */
$$("[data-hscroll]").forEach(w=>{const tr=w.querySelector("[data-hscroll-track]"),bar=w.querySelector("[data-hscroll-progress]");if(!tr)return;let dist=0;
const setup=()=>{const on=desk()&&!rm;w.classList.toggle("is-pinned",on);tr.style.transform="";w.style.height="";if(!on){dist=0;return}dist=Math.max(0,tr.scrollWidth-w.clientWidth);w.style.height=(innerHeight+dist)+"px"};
setup();addEventListener("resize",setup);addEventListener("load",setup);
whenVisible(w,()=>{if(!dist)return;const p=clamp(-w.getBoundingClientRect().top/dist,0,1);tr.style.transform="translate3d("+(-p*dist).toFixed(1)+"px,0,0)";bar&&bar.style.setProperty("--progress",p.toFixed(4))})});
/* stacking cards */
if(!rm){$$("[data-stack]").forEach(st=>{const cs=[...st.children];whenVisible(st,()=>{cs.forEach((c,i)=>{const nx=cs[i+1];if(!nx){c.style.transform="";return}const gap=nx.getBoundingClientRect().top-c.getBoundingClientRect().top,p=clamp(1-gap/c.offsetHeight,0,1);c.style.transform="scale("+(1-p*.06).toFixed(4)+")";c.style.filter=p>0?"brightness("+(1-p*.3).toFixed(3)+")":""})})})}
/* sticky mobile CTA (moved to <body> so a hiding or blurred header can't drag it along) */
const sc=$$("[data-sticky-cta]");sc.forEach(el=>d.body.appendChild(el));const _sc=sc,first=d.querySelector("main>section");if(sc.length&&first&&IO){new IntersectionObserver(es=>sc.forEach(b=>b.classList.toggle("is-visible",!es[0].isIntersecting))).observe(first)}
/* rotating phrases */
$$("[data-rotate]").forEach(el=>{const ws=el.dataset.rotate.split("|").map(s=>s.trim()).filter(Boolean);if(ws.length<2)return;const sr=d.createElement("span");sr.className="sr-only";sr.textContent=ws.join(", ");el.after(sr);el.setAttribute("aria-hidden","true");if(rm)return;let i=Math.max(0,ws.indexOf(el.textContent.trim()));setInterval(()=>{el.classList.add("is-out");setTimeout(()=>{i=(i+1)%ws.length;el.textContent=ws[i];el.classList.remove("is-out")},400)},2800)});
/* count up */
$$("[data-count]").forEach(el=>{const raw=el.dataset.count,to=parseFloat(raw),sx=el.dataset.suffix||"",dec=(raw.split(".")[1]||"").length;if(isNaN(to)||rm||!IO){el.textContent=raw+sx;return}const o=new IntersectionObserver(es=>{if(!es[0].isIntersecting)return;o.disconnect();const t0=performance.now();const st=t=>{const p=Math.min(1,(t-t0)/1700);el.textContent=(to*(1-Math.pow(1-p,3))).toFixed(dec)+sx;if(p<1)requestAnimationFrame(st)};requestAnimationFrame(st)},{threshold:.4});el.textContent=(0).toFixed(dec)+sx;o.observe(el)});
/* open now, from the business hours in the structured data */
(()=>{const els=$$("[data-open-status]");if(!els.length)return;let hrs=[];$$('script[type="application/ld+json"]').forEach(s=>{try{const g=JSON.parse(s.textContent)["@graph"]||[];g.forEach(n=>{if(n.openingHoursSpecification)hrs=hrs.concat(n.openingHoursSpecification)})}catch(e){}});if(!hrs.length){els.forEach(e=>e.textContent="");return}
const days=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],m=d.querySelector('meta[name="psb-utc-offset"]'),off=m?parseInt(m.content,10):null,now=new Date(),loc=off==null||isNaN(off)?now:new Date(now.getTime()+(off+now.getTimezoneOffset())*6e4),mins=t=>{const[a,b]=t.split(":").map(Number);return a*60+b},fmt=t=>{let[a,b]=t.split(":").map(Number);const pm=a>=12;a=a%12||12;return a+(b?":"+String(b).padStart(2,"0"):"")+(pm?" pm":" am")};
const today=days[loc.getDay()],cur=loc.getHours()*60+loc.getMinutes(),todays=hrs.filter(x=>[].concat(x.dayOfWeek).some(v=>String(v).endsWith(today)));const open=todays.find(x=>cur>=mins(x.opens)&&cur<mins(x.closes));let txt,cls;
if(open){txt="Open now until "+fmt(open.closes);cls="is-open"}else{let nx=null;for(let k=0;k<8&&!nx;k++){const dn=days[(loc.getDay()+k)%7];const c=hrs.filter(x=>[].concat(x.dayOfWeek).some(v=>String(v).endsWith(dn))&&(k>0||mins(x.opens)>cur)).sort((a,b)=>mins(a.opens)-mins(b.opens))[0];if(c)nx={k,dn,t:c.opens}}txt=nx?"Closed now, opens "+(nx.k===0?"today":nx.k===1?"tomorrow":nx.dn.slice(0,3))+" at "+fmt(nx.t):"Closed now";cls="is-closed"}
els.forEach(e=>{e.textContent=txt;e.classList.add(cls)})})();
/* marquee */
$$("[data-marquee]").forEach(el=>{const t=el.firstElementChild;if(!t||el.dataset.ready)return;const c=t.cloneNode(true);c.setAttribute("aria-hidden","true");c.querySelectorAll("a,button").forEach(x=>x.tabIndex=-1);el.appendChild(c);el.dataset.ready="1";if(el.hasAttribute("data-marquee-scroll")&&!rm){let last=scrollY,boost=1;whenVisible(el,()=>{const v=Math.abs(scrollY-last);last=scrollY;boost=clamp(1+v/18,1,4);const rate=b=>[...el.children].forEach(x=>x.getAnimations&&x.getAnimations().forEach(a=>a.playbackRate=b));rate(boost);clearTimeout(el._t);el._t=setTimeout(()=>rate(1),160)})}});
/* carousel */
$$("[data-carousel]").forEach(c=>{const tr=c.querySelector("[data-carousel-track]");if(!tr)return;const it=[...tr.children],pv=c.querySelector("[data-carousel-prev]"),nx=c.querySelector("[data-carousel-next]"),ct=c.querySelector("[data-carousel-count]"),pad=n=>String(n).padStart(2,"0");
const cur=()=>{let b=0,bd=1e9;it.forEach((x,i)=>{const dd=Math.abs(x.offsetLeft-tr.scrollLeft);if(dd<bd){bd=dd;b=i}});return b};
const up=()=>{const end=tr.scrollLeft+tr.clientWidth>=tr.scrollWidth-4,i=end?it.length-1:cur();if(ct)ct.textContent=pad(i+1)+" / "+pad(it.length);if(pv)pv.disabled=tr.scrollLeft<4;if(nx)nx.disabled=end};
const go=s=>{const i=clamp(cur()+s,0,it.length-1);tr.scrollTo({left:it[i].offsetLeft,behavior:rm?"auto":"smooth"})};
pv&&pv.addEventListener("click",()=>go(-1));nx&&nx.addEventListener("click",()=>go(1));let r=0;tr.addEventListener("scroll",()=>{cancelAnimationFrame(r);r=requestAnimationFrame(up)},{passive:true});addEventListener("resize",up);up()});
/* tabs */
let uid=0;$$("[data-tabs]").forEach(w=>{const tb=$$("[data-tab]",w),pn=$$("[data-panel]",w);if(!tb.length)return;tb[0].parentElement.setAttribute("role","tablist");
const sel=(t,f)=>{tb.forEach(x=>{const on=x===t;x.setAttribute("aria-selected",on);x.tabIndex=on?0:-1;x.classList.toggle("is-active",on)});pn.forEach(p=>{const on=p.dataset.panel===t.dataset.tab;p.hidden=!on;p.classList.toggle("is-active",on)});if(f)t.focus()};
tb.forEach((t,i)=>{uid++;t.setAttribute("role","tab");t.id=t.id||"psb-tab-"+uid;const p=pn.find(p=>p.dataset.panel===t.dataset.tab);if(p){p.setAttribute("role","tabpanel");p.id=p.id||"psb-panel-"+uid;p.setAttribute("aria-labelledby",t.id);t.setAttribute("aria-controls",p.id)}t.addEventListener("click",()=>sel(t));t.addEventListener("keydown",e=>{if(e.key!=="ArrowRight"&&e.key!=="ArrowLeft")return;e.preventDefault();sel(tb[(i+(e.key==="ArrowRight"?1:-1)+tb.length)%tb.length],1)})});
sel(tb.find(t=>t.classList.contains("is-active"))||tb[0])});
/* smooth FAQ accordions */
$$(".faq-item").forEach(dt=>{const sm=dt.querySelector("summary");if(!sm||rm||!dt.animate)return;let an=null;sm.addEventListener("click",e=>{e.preventDefault();an&&an.cancel();const start=dt.offsetHeight;if(dt.open){const end=sm.offsetHeight;an=dt.animate({height:[start+"px",end+"px"]},{duration:380,easing:"cubic-bezier(.16,1,.3,1)"});an.onfinish=()=>{dt.open=false;dt.style.overflow="";an=null}}else{dt.style.height=start+"px";dt.open=true;const end=dt.scrollHeight;dt.style.height="";an=dt.animate({height:[start+"px",end+"px"]},{duration:460,easing:"cubic-bezier(.16,1,.3,1)"});an.onfinish=()=>{dt.style.overflow="";an=null}}dt.style.overflow="hidden"})});
/* before/after */
$$("[data-ba]").forEach(w=>{const r=w.querySelector("input[type=range]");if(!r)return;const s=()=>w.style.setProperty("--ba",r.value+"%");r.addEventListener("input",s);s()});
/* lightbox */
$$("[data-lightbox]").forEach(g=>{const ims=$$("img",g);if(!ims.length||!W.HTMLDialogElement)return;let dl,img,cnt,i=0;const show=n=>{i=(n+ims.length)%ims.length;const s=ims[i];img.src=s.currentSrc||s.src;img.alt=s.alt;cnt.textContent=(i+1)+" / "+ims.length};
const build=()=>{dl=d.createElement("dialog");dl.className="psb-lightbox";dl.setAttribute("aria-label","Photo viewer");dl.innerHTML='<img alt=""><button class="lb-close" aria-label="Close">\u2715</button><button class="lb-prev" aria-label="Previous photo">\u2039</button><button class="lb-next" aria-label="Next photo">\u203A</button><p class="lb-count"></p>';d.body.appendChild(dl);img=dl.querySelector("img");cnt=dl.querySelector(".lb-count");dl.querySelector(".lb-close").onclick=()=>dl.close();dl.querySelector(".lb-prev").onclick=()=>show(i-1);dl.querySelector(".lb-next").onclick=()=>show(i+1);dl.addEventListener("keydown",e=>{if(e.key==="ArrowLeft")show(i-1);if(e.key==="ArrowRight")show(i+1)});dl.addEventListener("click",e=>{if(e.target===dl)dl.close()})};
ims.forEach((im,n)=>{im.tabIndex=0;im.setAttribute("role","button");const open=()=>{dl||build();show(n);dl.showModal()};im.addEventListener("click",open);im.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open()}})})});
/* pointer effects (mouse only) */
if(fine&&!rm){
$$("[data-magnetic]").forEach(el=>{el.addEventListener("pointermove",e=>{const r=el.getBoundingClientRect();el.style.transform="translate("+((e.clientX-r.left-r.width/2)*.28).toFixed(1)+"px,"+((e.clientY-r.top-r.height/2)*.35).toFixed(1)+"px)"});el.addEventListener("pointerleave",()=>el.style.transform="")});
$$("[data-tilt]").forEach(el=>{el.addEventListener("pointermove",e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform="perspective(900px) rotateX("+(-y*7).toFixed(2)+"deg) rotateY("+(x*9).toFixed(2)+"deg)"});el.addEventListener("pointerleave",()=>el.style.transform="")});
$$("[data-spotlight]").forEach(el=>el.addEventListener("pointermove",e=>{const r=el.getBoundingClientRect();el.style.setProperty("--sx",(e.clientX-r.left)+"px");el.style.setProperty("--sy",(e.clientY-r.top)+"px")}));
$$("[data-hover-reveal]").forEach(l=>{let tx=0,ty=0,x=0,y=0,raf=0;const loop=()=>{x+=(tx-x)*.16;y+=(ty-y)*.16;l.style.setProperty("--mx",x.toFixed(1)+"px");l.style.setProperty("--my",y.toFixed(1)+"px");raf=Math.abs(tx-x)+Math.abs(ty-y)>.5?requestAnimationFrame(loop):0};
l.addEventListener("pointermove",e=>{tx=e.clientX;ty=e.clientY;if(!x&&!y){x=tx;y=ty}raf||(raf=requestAnimationFrame(loop))});[...l.children].forEach(li=>{li.addEventListener("pointerenter",()=>li.classList.add("is-hover"));li.addEventListener("pointerleave",()=>li.classList.remove("is-hover"))})});
const cu=d.querySelector(".psb-cursor");if(cu){const lab=cu.querySelector("span");let tx=-100,ty=-100,x=-100,y=-100,on=0;const lp=()=>{x+=(tx-x)*.2;y+=(ty-y)*.2;cu.style.transform="translate3d("+x.toFixed(1)+"px,"+y.toFixed(1)+"px,0)";requestAnimationFrame(lp)};requestAnimationFrame(lp);
addEventListener("pointermove",e=>{tx=e.clientX;ty=e.clientY;if(!on){on=1;x=tx;y=ty;cu.classList.add("is-on")}const t=e.target.closest&&e.target.closest("[data-cursor],a,button,summary,[role=button],input,label");const txt=t&&t.dataset?t.dataset.cursor:"";cu.classList.toggle("is-label",!!txt);cu.classList.toggle("is-link",!!t&&!txt);if(lab)lab.textContent=txt||""},{passive:true});d.addEventListener("pointerleave",()=>{cu.classList.remove("is-on");on=0})}}
/* active nav link */
const lk=$$("[data-nav] a[href^='#']");if(lk.length&&IO){const mp=new Map(lk.map(a=>[a.getAttribute("href").slice(1),a]));const so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){lk.forEach(a=>a.classList.remove("is-current"));lk.filter(a=>a.getAttribute("href")==="#"+e.target.id).forEach(a=>a.classList.add("is-current"))}}),{rootMargin:"-45% 0px -50% 0px"});mp.forEach((a,id)=>{const s=id&&d.getElementById(id);s&&so.observe(s)})}
/* hero video */
const v=d.querySelector("video[data-hero-video][data-src]"),cn=navigator.connection;if(v&&!rm&&!(cn&&cn.saveData)&&matchMedia("(min-width: 768px)").matches){const go=()=>setTimeout(()=>{v.src=v.dataset.src;v.muted=true;v.addEventListener("playing",()=>v.classList.add("is-playing"),{once:true});v.play().catch(()=>{})},700);d.readyState==="complete"?go():addEventListener("load",go)}
req();
})();
