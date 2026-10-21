/* Premium Site Builder Pro — app.js (wizard, state, images, AI assist, build, zip, GitHub publish) */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RUNTIME = { js: "", css: "" };
  const IMAGES = new Map(); // id -> { full: Blob, small: Blob, w, h, thumb: dataURL }
  let project = structuredClone(PSB.DEFAULT);
  let built = null; // { pages, files, blobs }
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  /* ---------- small utils ---------- */
  const get = (o, path) => path.split(".").reduce((a, k) => (a == null ? a : a[k]), o);
  const set = (o, path, v) => { const ks = path.split("."); const last = ks.pop(); const t = ks.reduce((a, k) => (a[k] = a[k] || {}), o); t[last] = v; };
  const uid = () => "img-" + Math.random().toString(36).slice(2, 8);
  const toast = (m) => { const t = document.createElement("div"); t.className = "toast"; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); };
  const log = (el, m) => { el.hidden = false; el.textContent += m + "\n"; el.scrollTop = el.scrollHeight; };
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

  /* ---------- persistence (localStorage for data, IndexedDB for images) ---------- */
  const db = {
    open() { return new Promise((res, rej) => { const r = indexedDB.open("psb-pro", 1); r.onupgradeneeded = () => r.result.createObjectStore("images"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); },
    async put(id, v) { const d = await this.open(); return new Promise((res, rej) => { const t = d.transaction("images", "readwrite"); t.objectStore("images").put(v, id); t.oncomplete = res; t.onerror = () => rej(t.error); }); },
    async del(id) { const d = await this.open(); d.transaction("images", "readwrite").objectStore("images").delete(id); },
    async all() { const d = await this.open(); return new Promise((res) => { const out = new Map(); const c = d.transaction("images").objectStore("images").openCursor(); c.onsuccess = () => { const cur = c.result; if (cur) { out.set(cur.key, cur.value); cur.continue(); } else res(out); }; c.onerror = () => res(out); }); },
    async clear() { const d = await this.open(); d.transaction("images", "readwrite").objectStore("images").clear(); },
  };
  let saveT;
  function persist() {
    if (!$("#autosave").checked) return;
    clearTimeout(saveT);
    saveT = setTimeout(() => { try { localStorage.setItem("psb-pro-project", JSON.stringify(project)); } catch (e) { } }, 400);
  }
  async function restore() {
    try { const j = localStorage.getItem("psb-pro-project"); if (j) project = PSB.normalize(JSON.parse(j)); } catch (e) { }
    const imgs = await db.all();
    imgs.forEach((v, k) => IMAGES.set(k, v));
    project.images = project.images.filter(i => IMAGES.has(i.id));
    if (IMAGES.has("logo")) project.brand.logo = true; else project.brand.logo = null;
  }

  /* ---------- binding ---------- */
  function bindAll() {
    $$("[data-bind]").forEach(el => {
      const path = el.dataset.bind;
      const v = get(project, path);
      if (el.type === "checkbox") el.checked = !!v; else if (v != null) el.value = v;
      el.addEventListener(el.tagName === "SELECT" || el.type === "checkbox" || el.type === "color" ? "change" : "input", () => {
        set(project, path, el.type === "checkbox" ? el.checked : el.value);
        if (path.startsWith("brand")) swatch();
        updateCounts(); persist();
      });
    });
    swatch();
  }
  function refreshBinds() { $$("[data-bind]").forEach(el => { const v = get(project, el.dataset.bind); if (el.type === "checkbox") el.checked = !!v; else el.value = v ?? ""; }); swatch(); }
  function swatch() {
    const b = project.brand, s = $("#swatch");
    s.style.setProperty("--sw-primary", b.primary); s.style.setProperty("--sw-accent", b.accent);
    s.style.setProperty("--sw-display", `"${b.fontDisplay}",Georgia,serif`); s.style.setProperty("--sw-body", `"${b.fontBody}",sans-serif`);
    const link = $("#swatch-fonts") || Object.assign(document.head.appendChild(document.createElement("link")), { id: "swatch-fonts", rel: "stylesheet" });
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(b.fontDisplay).replace(/%20/g, "+")}:wght@600&family=${encodeURIComponent(b.fontBody).replace(/%20/g, "+")}:wght@600&display=swap`;
  }

  /* ---------- steps ---------- */
  function go(step) {
    $$(".steps button[data-step]").forEach(b => b.classList.toggle("is-active", b.dataset.step === step));
    $$(".panel>section").forEach(s => s.classList.toggle("is-active", s.dataset.panel === step));
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (step === "build") renderBuildPanel();
  }
  $$(".steps button[data-step]").forEach(b => b.addEventListener("click", () => go(b.dataset.step)));
  document.addEventListener("click", e => { const b = e.target.closest("[data-next]"); if (b) go(b.dataset.next); });
  $("#btn-go-build").addEventListener("click", () => go("build"));

  /* ---------- hours ---------- */
  function renderHours() {
    const wrap = $("#hours"); wrap.innerHTML = "";
    if (!project.business.hours.length) project.business.hours = DAYS.map(d => ({ days: d, open: d === "Sunday" ? "" : "09:00", close: d === "Sunday" ? "" : "17:00" }));
    project.business.hours.forEach((h, i) => {
      const row = document.createElement("div"); row.className = "hours-row";
      row.innerHTML = `<label><input value="${esc(h.days)}" data-h="days" placeholder="Monday"></label><label><input value="${esc(h.open)}" data-h="open" placeholder="09:00"></label><label><input value="${esc(h.close)}" data-h="close" placeholder="17:00"></label><button class="ghost" type="button" aria-label="Remove">×</button>`;
      row.querySelectorAll("input").forEach(inp => inp.addEventListener("input", () => { h[inp.dataset.h] = inp.value; persist(); }));
      row.querySelector("button").addEventListener("click", () => { project.business.hours.splice(i, 1); renderHours(); persist(); });
      wrap.appendChild(row);
    });
    const add = document.createElement("button"); add.className = "ghost"; add.textContent = "+ Add row"; add.type = "button";
    add.addEventListener("click", () => { project.business.hours.push({ days: "", open: "", close: "" }); renderHours(); });
    wrap.appendChild(add);
  }

  /* ---------- generic card lists ---------- */
  function cardList(listSel, arr, fields, opts = {}) {
    const wrap = $(listSel); wrap.innerHTML = "";
    arr.forEach((item, i) => {
      const c = document.createElement("div"); c.className = "card";
      c.innerHTML = `<h3>${esc(opts.title ? opts.title(item, i) : (item.name || item.title || item.q || "Item " + (i + 1)))}</h3>` +
        fields.map(f => {
          if (f.type === "image") return `<label>${f.label}<select data-f="${f.key}"><option value="">(auto)</option>${project.images.map(im => `<option value="${im.id}" ${item[f.key] === im.id ? "selected" : ""}>${esc(im.alt || im.id)}</option>`).join("")}</select></label>`;
          if (f.type === "textarea") return `<label>${f.label}<textarea data-f="${f.key}" rows="${f.rows || 3}" placeholder="${esc(f.ph || "")}">${esc(item[f.key])}</textarea></label>`;
          return `<label>${f.label}<input data-f="${f.key}" value="${esc(item[f.key])}" placeholder="${esc(f.ph || "")}" ${f.type ? `type="${f.type}"` : ""}></label>`;
        }).join("") +
        (opts.ai ? `<button class="ghost ai" type="button" title="Draft with AI">✦ AI</button>` : "") +
        `<button class="mv" type="button" title="Move up">↑</button><button class="rm" type="button" aria-label="Remove">×</button>`;
      c.querySelectorAll("[data-f]").forEach(el => el.addEventListener("input", () => { item[el.dataset.f] = el.value; if (el.dataset.f === "name" || el.dataset.f === "title" || el.dataset.f === "q") c.querySelector("h3").textContent = el.value || "Item"; updateCounts(); persist(); }));
      c.querySelector(".rm").addEventListener("click", () => { arr.splice(i, 1); cardList(listSel, arr, fields, opts); updateCounts(); persist(); });
      c.querySelector(".mv").addEventListener("click", () => { if (i > 0) { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; cardList(listSel, arr, fields, opts); persist(); } });
      if (opts.ai) c.querySelector(".ai").addEventListener("click", () => opts.ai(item, () => cardList(listSel, arr, fields, opts)));
      wrap.appendChild(c);
    });
    updateCounts();
  }
  const SVC_FIELDS = [
    { key: "name", label: "Service name *", ph: "Dental implants" },
    { key: "short", label: "One-sentence summary (cards, meta description) *", ph: "Permanent, natural-looking replacements for missing teeth." },
    { key: "body", label: "Full description (paragraphs)", type: "textarea", rows: 6, ph: "What it is, who it's for, what to expect, how long it takes…" },
    { key: "bullets", label: "What's included (one per line)", type: "textarea", rows: 3, ph: "Free consultation\n3D imaging\nSame-day temporaries" },
    { key: "faqs", label: "Service FAQs (question line, answer line, blank line between)", type: "textarea", rows: 4, ph: "Does it hurt?\nMost patients report only mild soreness…" },
    { key: "priceFrom", label: "Price from (optional, only if accurate)", ph: "$199" },
    { key: "image", label: "Photo", type: "image" },
  ];
  const AREA_FIELDS = [{ key: "name", label: "City / neighborhood *", ph: "San Dimas" }, { key: "state", label: "State", ph: "CA" }, { key: "note", label: "Local note (optional, keeps the page specific)", ph: "About 10 minutes from our office via Arrow Hwy." }];
  const REV_FIELDS = [{ key: "author", label: "Name as shown", ph: "Maria G." }, { key: "rating", label: "Rating (1–5)", type: "number" }, { key: "text", label: "Review text (verbatim)", type: "textarea" }, { key: "source", label: "Source", ph: "Google" }];
  const FAQ_FIELDS = [{ key: "q", label: "Question" }, { key: "a", label: "Answer (2–4 sentences, direct — this is what AI search engines quote)", type: "textarea" }];
  const TEAM_FIELDS = [{ key: "name", label: "Name" }, { key: "role", label: "Role / credentials" }, { key: "bio", label: "Short bio", type: "textarea" }, { key: "image", label: "Photo", type: "image" }];
  const FIN_FIELDS = [{ key: "name", label: "Option name", ph: "CareCredit" }, { key: "desc", label: "Description", type: "textarea", rows: 2 }, { key: "link", label: "Link (optional)", type: "url" }];
  const POST_FIELDS = [{ key: "title", label: "Title" }, { key: "date", label: "Date (YYYY-MM-DD)", type: "date" }, { key: "excerpt", label: "Excerpt" }, { key: "body", label: "Article (paragraphs)", type: "textarea", rows: 8 }, { key: "image", label: "Photo", type: "image" }];
  const CUSTOM_FIELDS = [{ key: "title", label: "Page title" }, { key: "slug", label: "URL slug (optional)", ph: "new-patients" }, { key: "body", label: "Content (paragraphs)", type: "textarea", rows: 6 }, { key: "image", label: "Photo", type: "image" }];

  function renderLists() {
    cardList("#svc-list", project.services, SVC_FIELDS, { ai: aiDraftService });
    cardList("#area-list", project.areas, AREA_FIELDS);
    cardList("#rev-list", project.reviews, REV_FIELDS, { title: r => r.author || "Review" });
    cardList("#faq-list", project.faqs, FAQ_FIELDS);
    cardList("#team-list", project.team, TEAM_FIELDS);
    cardList("#fin-list", project.financing.options, FIN_FIELDS);
    cardList("#post-list", project.posts, POST_FIELDS, { ai: aiDraftPost });
    cardList("#custom-list", project.custom, CUSTOM_FIELDS);
  }
  const adders = {
    "#svc-add": () => project.services.push({ name: "", short: "", body: "", bullets: "", faqs: "", priceFrom: "", image: "" }),
    "#area-add": () => project.areas.push({ name: "", state: project.business.address.state, note: "" }),
    "#rev-add": () => project.reviews.push({ author: "", rating: 5, text: "", source: "Google" }),
    "#faq-add": () => project.faqs.push({ q: "", a: "" }),
    "#team-add": () => project.team.push({ name: "", role: "", bio: "", image: "" }),
    "#fin-add": () => project.financing.options.push({ name: "", desc: "", link: "" }),
    "#post-add": () => project.posts.push({ title: "", date: new Date().toISOString().slice(0, 10), excerpt: "", body: "", image: "" }),
    "#custom-add": () => project.custom.push({ title: "", slug: "", body: "", image: "" }),
  };
  Object.entries(adders).forEach(([sel, fn]) => $(sel).addEventListener("click", () => { fn(); renderLists(); persist(); const last = $(sel.replace("-add", "-list")).lastElementChild; last && last.scrollIntoView({ behavior: "smooth", block: "center" }); last && last.querySelector("input,textarea").focus(); }));

  function bulk(title, hint, cb) {
    const d = $("#dlg"); $("#dlg-title").textContent = title; $("#dlg-hint").textContent = hint; $("#dlg-text").value = "";
    d.showModal();
    d.querySelector("form").onsubmit = (e) => { if (e.submitter && e.submitter.value === "ok") cb($("#dlg-text").value); };
  }
  $("#svc-bulk").addEventListener("click", () => bulk("Paste services", "One per line. Optionally add a colon and a short summary: 'Dental implants: Permanent replacements for missing teeth'", txt => {
    txt.split(/\n/).map(l => l.trim()).filter(Boolean).forEach(l => { const [n, ...rest] = l.split(":"); project.services.push({ name: n.trim(), short: rest.join(":").trim(), body: "", bullets: "", faqs: "", priceFrom: "", image: "" }); });
    renderLists(); persist();
  }));
  $("#area-bulk").addEventListener("click", () => bulk("Paste service areas", "One city or neighborhood per line.", txt => {
    txt.split(/\n/).map(l => l.trim()).filter(Boolean).forEach(l => project.areas.push({ name: l, state: project.business.address.state, note: "" }));
    renderLists(); persist();
  }));

  function updateCounts() {
    const p = PSB.normalize(structuredClone(project));
    const n = PSB.plan(p).length;
    $("#pagecount").textContent = `${n} pages planned`;
    $("#svc-count").textContent = `${project.services.length} services`;
    $("#area-count").textContent = `${project.areas.length} areas → ${project.services.length * project.areas.length} location pages`;
    $("#rev-count").textContent = `(${project.reviews.length})`; $("#faq-count").textContent = `(${project.faqs.length})`;
    $("#img-count").textContent = project.images.length;
  }

  /* ---------- images ---------- */
  async function resize(file, max, q = 0.82) {
    const bmp = await createImageBitmap(file);
    const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * s), h = Math.round(bmp.height * s);
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    c.getContext("2d").drawImage(bmp, 0, 0, w, h);
    const blob = await new Promise(r => c.toBlob(r, "image/jpeg", q));
    return { blob, w, h };
  }
  async function addImages(files) {
    for (const f of files) {
      if (!f.type.startsWith("image/")) continue;
      const id = uid();
      try {
        const full = await resize(f, 1600), small = await resize(f, 800, 0.8), th = await resize(f, 320, 0.7);
        const thumb = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(th.blob); });
        const rec = { full: full.blob, small: small.blob, w: full.w, h: full.h, thumb };
        IMAGES.set(id, rec); await db.put(id, rec);
        project.images.push({ id, alt: f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "), w: full.w, h: full.h });
      } catch (e) { toast("Could not process " + f.name); }
    }
    renderImages(); renderLists(); persist();
  }
  function renderImages() {
    const g = $("#img-grid"); g.innerHTML = "";
    project.images.forEach((im, i) => {
      const rec = IMAGES.get(im.id); if (!rec) return;
      const c = document.createElement("div"); c.className = "img-card";
      c.innerHTML = `<img src="${rec.thumb}" alt=""><input value="${esc(im.alt)}" placeholder="Describe this photo (alt text)"><div class="bar"><span>${i === 0 ? "★ Hero" : "#" + (i + 1)} · ${rec.w}×${rec.h}</span><span><button type="button" title="Move up">↑</button><button type="button" title="Remove">×</button></span></div>`;
      c.querySelector("input").addEventListener("input", e => { im.alt = e.target.value; persist(); });
      const [up, rm] = c.querySelectorAll(".bar button");
      up.addEventListener("click", () => { if (i > 0) { [project.images[i - 1], project.images[i]] = [project.images[i], project.images[i - 1]]; renderImages(); persist(); } });
      rm.addEventListener("click", async () => { project.images.splice(i, 1); IMAGES.delete(im.id); await db.del(im.id); renderImages(); renderLists(); persist(); });
      g.appendChild(c);
    });
    updateCounts();
  }
  $("#img-files").addEventListener("change", e => addImages([...e.target.files]));
  const drop = $("#drop");
  ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("is-over"); }));
  ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("is-over"); if (ev === "drop") addImages([...e.dataTransfer.files]); }));

  /* stock photos via Pexels (user's own key, CORS-enabled API) */
  $("#px-search").addEventListener("click", async () => {
    const key = $("#px-key").value.trim(), q = $("#px-q").value.trim(), out = $("#px-results");
    if (!key || !q) { toast("Enter a Pexels key and a search"); return; }
    localStorage.setItem("psb-px-key", key);
    out.innerHTML = "<p class='muted'>Searching…</p>";
    try {
      const r = await fetch("https://api.pexels.com/v1/search?per_page=18&orientation=landscape&query=" + encodeURIComponent(q), { headers: { Authorization: key } });
      if (!r.ok) throw new Error("Pexels " + r.status);
      const j = await r.json(); out.innerHTML = "";
      j.photos.forEach(ph => {
        const c = document.createElement("div"); c.className = "img-card px-card";
        c.innerHTML = `<img src="${ph.src.medium}" alt="${esc(ph.alt || "")}"><div class="bar"><span>Photo by ${esc(ph.photographer)} · click to add</span></div>`;
        c.addEventListener("click", async () => {
          if (c.classList.contains("is-added")) return;
          c.querySelector(".bar span").textContent = "Adding…";
          try { const b = await (await fetch(ph.src.large2x)).blob(); const f = new File([b], "stock-" + ph.id + ".jpg", { type: "image/jpeg" }); await addImages([f]); const im = project.images[project.images.length - 1]; im.alt = ph.alt || q; im.credit = "Photo by " + ph.photographer + " on Pexels"; renderImages(); persist(); c.classList.add("is-added"); c.querySelector(".bar span").textContent = "Added ✓"; }
          catch (e) { c.querySelector(".bar span").textContent = "Could not add: " + e.message; }
        });
        out.appendChild(c);
      });
      if (!j.photos.length) out.innerHTML = "<p class='muted'>No results.</p>";
    } catch (e) { out.innerHTML = "<p class='muted'>" + esc(e.message) + "</p>"; }
  });
  $("#px-key").value = localStorage.getItem("psb-px-key") || "";
  /* logo */
  $("#logo-file").addEventListener("change", async e => {
    const f = e.target.files[0]; if (!f) return;
    const ext = f.type === "image/svg+xml" ? "svg" : "png";
    let blob = f, w = 160, h = 48;
    if (ext === "png") {
      const bmp = await createImageBitmap(f); const s = Math.min(1, 1024 / Math.max(bmp.width, bmp.height));
      const c = document.createElement("canvas"); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s); c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
      blob = await new Promise(r => c.toBlob(r, "image/png")); w = c.width; h = c.height;
    }
    const rec = { full: blob, ext, w, h, thumb: await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); }) };
    IMAGES.set("logo", rec); await db.put("logo", rec);
    project.brand.logo = true; project.brand.logoExt = ext; project.brand.logoW = w; project.brand.logoH = h;
    renderLogo(); persist();
  });
  function renderLogo() {
    const rec = IMAGES.get("logo"), pv = $("#logo-preview");
    if (rec) { pv.innerHTML = `<img src="${rec.thumb}" alt="Logo preview">`; $("#logo-colors").hidden = rec.ext === "svg"; }
    else { pv.innerHTML = "<span>No logo yet — a typographic wordmark will be used.</span>"; $("#logo-colors").hidden = true; }
  }
  $("#logo-colors").addEventListener("click", async () => {
    const rec = IMAGES.get("logo"); if (!rec) return;
    const bmp = await createImageBitmap(rec.full); const c = document.createElement("canvas"); c.width = 64; c.height = 64;
    const ctx = c.getContext("2d"); ctx.drawImage(bmp, 0, 0, 64, 64); const d = ctx.getImageData(0, 0, 64, 64).data;
    const buckets = {};
    for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 128) continue; const r = d[i], g = d[i + 1], b = d[i + 2]; const lum = (r + g + b) / 3; if (lum > 235 || lum < 20) continue; const k = [r >> 5, g >> 5, b >> 5].join(","); (buckets[k] = buckets[k] || { n: 0, r: 0, g: 0, b: 0 }); const bk = buckets[k]; bk.n++; bk.r += r; bk.g += g; bk.b += b; }
    const top = Object.values(buckets).sort((a, b) => b.n - a.n).slice(0, 2).map(bk => "#" + [bk.r, bk.g, bk.b].map(v => Math.round(v / bk.n).toString(16).padStart(2, "0")).join(""));
    if (top[0]) project.brand.primary = top[0]; if (top[1]) project.brand.accent = top[1];
    refreshBinds(); persist(); toast("Colors picked from logo — adjust if needed");
  });

  /* ---------- AI assist (user's own key, browser only) ---------- */
  async function ai(system, user, maxTokens = 2000) {
    const key = $("#ai-key").value.trim(); if (!key) throw new Error("Add your Anthropic API key in step 7 first.");
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
      body: JSON.stringify({ model: $("#ai-model").value, max_tokens: maxTokens, system, messages: [{ role: "user", content: user }] }),
    });
    if (!r.ok) throw new Error("API error " + r.status + ": " + (await r.text()).slice(0, 300));
    const j = await r.json(); return j.content.filter(c => c.type === "text").map(c => c.text).join("");
  }
  const SYS = () => `You write website copy for ${project.business.name}, a ${project.business.category} in ${project.business.address.city}, ${project.business.address.state}. Tagline: ${project.business.tagline}. About: ${project.business.description}\nRules: plain, specific, warm, no hype, no superlatives like "best", no invented facts, numbers, credentials, prices, awards, guarantees or years. If a detail is unknown, leave it out. Write for a local customer who is deciding whether to call. Respond ONLY with the JSON requested, no markdown fences.`;
  const parseJson = (t) => JSON.parse(t.replace(/```json|```/g, "").trim());
  async function aiDraftService(s, rerender) {
    const l = $("#ai-log"); l.hidden = false;
    try {
      log(l, "Drafting " + s.name + "…");
      const out = parseJson(await ai(SYS(), `Service: ${s.name}. Notes from the owner: ${s.short} ${s.body} ${s.bullets}\nReturn JSON {"short": one sentence under 160 chars, "body": 3-4 paragraphs separated by blank lines explaining what it is, who it helps, what to expect, "bullets": 4-6 short items separated by newlines, "faqs": 4 Q&A pairs formatted as question line, answer line, blank line between pairs}`));
      s.short = s.short || out.short; s.body = s.body || out.body; s.bullets = s.bullets || out.bullets; s.faqs = s.faqs || out.faqs;
      log(l, "✓ " + s.name + " drafted — please review for accuracy."); rerender(); persist();
    } catch (e) { log(l, "✗ " + e.message); }
  }
  async function aiDraftPost(x, rerender) {
    const l = $("#ai-log");
    try { log(l, "Drafting post " + x.title + "…"); const out = parseJson(await ai(SYS(), `Write a helpful 500-700 word article titled "${x.title}" for local readers. Notes: ${x.body}. Return JSON {"excerpt": one sentence, "body": paragraphs separated by blank lines, with 2-3 short H2-style lines written as plain sentences ending with a colon}`, 3000)); x.excerpt = out.excerpt; x.body = out.body; rerender(); persist(); log(l, "✓ done — review before publishing."); } catch (e) { log(l, "✗ " + e.message); }
  }
  $("#ai-services").addEventListener("click", async () => { for (const s of project.services) if (!s.body || !s.faqs) await aiDraftService(s, renderLists); });
  $("#ai-faqs").addEventListener("click", async () => {
    const l = $("#ai-log");
    try { log(l, "Drafting FAQs…"); const out = parseJson(await ai(SYS(), `Services: ${project.services.map(s => s.name).join(", ")}. Write 8 FAQs real local customers ask (hours, first visit, parking, payment, what to bring, how to book, insurance in general terms, emergencies). Answers 2-4 direct sentences. Return JSON [{"q":"","a":""}]`)); project.faqs.push(...out); renderLists(); persist(); log(l, "✓ 8 FAQs added — edit any that aren't accurate."); } catch (e) { log(l, "✗ " + e.message); }
  });
  $("#ai-about").addEventListener("click", async () => {
    const l = $("#ai-log");
    try { log(l, "Expanding About…"); const out = parseJson(await ai(SYS(), `Expand the About text into 3 paragraphs (blank line between) without adding any new facts. Return JSON {"description": "..."}`)); project.business.description = out.description; refreshBinds(); persist(); log(l, "✓ About expanded."); } catch (e) { log(l, "✗ " + e.message); }
  });
  $("#ai-posts").addEventListener("click", async () => {
    const l = $("#ai-log");
    try { log(l, "Choosing topics…"); const out = parseJson(await ai(SYS(), `Suggest 4 evergreen blog post titles that answer real questions about: ${project.services.map(s => s.name).join(", ")}. Return JSON ["title",...]`, 500)); for (const t of out) { const x = { title: t, date: new Date().toISOString().slice(0, 10), excerpt: "", body: "", image: "" }; project.posts.push(x); await aiDraftPost(x, renderLists); } project.pages.blog = true; refreshBinds(); } catch (e) { log(l, "✗ " + e.message); }
  });

  /* ---------- build ---------- */
  function checks() {
    const p = project, out = [];
    const c = (ok, warn, msg) => out.push({ cls: ok ? "ok" : warn ? "warn" : "fail", msg: (ok ? "✓ " : warn ? "⚠ " : "✗ ") + msg });
    c(!!p.business.name, false, "Business name"); c(!!p.business.address.city && !!p.business.address.state, false, "City and state");
    c(!!p.business.address.street, true, "Street address (LocalBusiness schema needs it)");
    c(p.services.length >= 1, false, `${p.services.length} services (each needs at least a name and one-sentence summary)`);
    c(p.services.every(s => s.short), true, "Every service has a summary");
    c(p.images.length >= 10, p.images.length >= 3, `${p.images.length} photos (10+ recommended)`);
    c(p.images.every(i => i.alt), true, "Every photo has alt text");
    c(!!p.brand.logo, true, "Logo uploaded (otherwise a wordmark is used)");
    c(!!p.seo.siteUrl, true, "Final site URL set (needed for canonical URLs, sitemap and Open Graph)");
    c(p.areas.length >= 3, true, `${p.areas.length} service areas (more areas = more location pages)`);
    c(p.faqs.length >= 4, true, `${p.faqs.length} FAQs (powers FAQ rich results and AI answers)`);
    c(!!p.forms.endpoint || p.forms.provider !== "formspree", true, "Form delivery configured");
    c(p.reviews.length >= 3, true, `${p.reviews.length} reviews`);
    return out;
  }
  function renderBuildPanel() {
    const cs = checks(); $("#checks").innerHTML = cs.map(x => `<div class="${x.cls}">${esc(x.msg)}</div>`).join("");
    const pages = PSB.plan(PSB.normalize(structuredClone(project)));
    const count = (k) => pages.filter(x => x.kind === k).length;
    $("#plan").innerHTML = [["Total pages", pages.length], ["Service pages", count("service")], ["Service × area", count("service-area")], ["Area pages", count("area")], ["Blog posts", count("post")], ["Core pages", pages.length - count("service") - count("service-area") - count("area") - count("post")]]
      .map(([l, n]) => `<div><strong>${n}</strong><span>${l}</span></div>`).join("");
    $("#btn-build").disabled = cs.some(x => x.cls === "fail");
  }
  async function loadRuntime() {
    if (RUNTIME.js) return;
    if (window.PSB_RUNTIME) { RUNTIME.js = window.PSB_RUNTIME.js; RUNTIME.css = window.PSB_RUNTIME.css; return; }
    const [js, css] = await Promise.all([fetch("app/site-runtime.js").then(r => r.text()), fetch("app/site-runtime.css").then(r => r.text())]);
    RUNTIME.js = js; RUNTIME.css = css;
  }
  $("#btn-build").addEventListener("click", async () => {
    const l = $("#build-log"); l.textContent = ""; l.hidden = false;
    try {
      await loadRuntime();
      log(l, "Planning pages…");
      const res = PSB.build(structuredClone(project), RUNTIME);
      const blobs = {};
      Object.entries(res.files).forEach(([k, v]) => { blobs[k] = new Blob([v], { type: k.endsWith(".html") ? "text/html" : k.endsWith(".css") ? "text/css" : k.endsWith(".js") ? "text/javascript" : k.endsWith(".svg") ? "image/svg+xml" : "text/plain" }); });
      res.project.images.forEach(im => { const rec = IMAGES.get(im.id); if (rec) { blobs[`assets/img/${im.id}.jpg`] = rec.full; blobs[`assets/img/${im.id}-800.jpg`] = rec.small; } });
      if (res.project.brand.logo && IMAGES.get("logo")) blobs[`assets/logo.${res.project.brand.logoExt || "png"}`] = IMAGES.get("logo").full;
      built = { ...res, blobs };
      log(l, `✓ Generated ${res.pages.length} pages, ${Object.keys(blobs).length} files.`);
      log(l, "SEO: canonical + Open Graph + geo meta on every page; LocalBusiness, Service, FAQPage, BreadcrumbList, BlogPosting JSON-LD; sitemap.xml; robots.txt.");
      log(l, "AEO/GEO: FAQ answers in schema, llms.txt for AI crawlers, direct-answer meta descriptions, city/area entity pages.");
      $("#btn-zip").disabled = $("#btn-preview").disabled = $("#btn-publish").disabled = false;
      const sel = $("#preview-page"); sel.innerHTML = res.pages.map(pg => `<option value="${pg.path}">${esc(pg.title.split("|")[0].trim())} — /${pg.url}</option>`).join("");
    } catch (e) { log(l, "✗ " + e.message); console.error(e); }
  });

  /* zip */
  $("#btn-zip").addEventListener("click", async () => {
    const zip = new JSZip();
    Object.entries(built.blobs).forEach(([k, v]) => zip.file(k, v));
    zip.file("psb-project.json", JSON.stringify(project, null, 2));
    const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = PSB.slug(project.business.name) + "-website.zip"; a.click();
    toast("Zip downloaded — unzip and upload to any host");
  });

  /* preview: rewrite relative asset links to blob URLs for the chosen page */
  const urlCache = new Map();
  const blobUrl = (k) => { if (!urlCache.has(k)) urlCache.set(k, URL.createObjectURL(built.blobs[k])); return urlCache.get(k); };
  function showPreview() {
    const path = $("#preview-page").value; const pg = built.pages.find(x => x.path === path);
    let html = built.files[path];
    html = html.replace(/(src|href|srcset)="((?:\.\.\/)*)(assets\/[^"\s,]+)([^"]*)"/g, (m, a, rel, asset, rest) => {
      if (a === "srcset") return `${a}="${(asset + rest).split(",").map(x => x.trim()).map(x => { const [u, w] = x.split(/\s+/); const key = u.replace(/^(\.\.\/)*/, ""); return built.blobs[key] ? blobUrl(key) + " " + (w || "") : x; }).join(", ")}"`;
      return built.blobs[asset] ? `${a}="${blobUrl(asset)}"` : m;
    });
    html = html.replace(/href="((?:\.\.\/)*)([^"#:]*\/|)"/g, (m, rel, p) => `href="#" data-nav-to="${p}index.html"`).replace("<head>", "<head><base target=\"_self\">");
    const frame = $("#preview-frame"); frame.srcdoc = html + `<script>document.addEventListener('click',e=>{const a=e.target.closest('[data-nav-to]');if(a){e.preventDefault();parent.postMessage({psbNav:a.dataset.navTo},'*')}})</script>`;
    $("#preview").hidden = false; $("#preview").scrollIntoView({ behavior: "smooth" });
  }
  addEventListener("message", e => { if (e.data && e.data.psbNav && built) { const p = e.data.psbNav === "index.html" ? "index.html" : e.data.psbNav; if (built.files[p]) { $("#preview-page").value = p; showPreview(); } } });
  $("#btn-preview").addEventListener("click", showPreview);
  $("#preview-page").addEventListener("change", showPreview);
  $("#preview-mobile").addEventListener("click", () => $("#preview").classList.toggle("is-mobile"));
  $("#preview-close").addEventListener("click", () => $("#preview").hidden = true);

  /* ---------- GitHub publish via Git Data API ---------- */
  $("#btn-publish").addEventListener("click", async () => {
    const l = $("#publish-log"); l.textContent = ""; l.hidden = false;
    const token = $("#gh-token").value.trim(), repo = $("#gh-repo").value.trim(), branch = $("#gh-branch").value.trim() || "main";
    if (!token || !/^[\w.-]+\/[\w.-]+$/.test(repo)) { log(l, "✗ Enter a token and repo as owner/name"); return; }
    const [owner, name] = repo.split("/");
    const gh = async (path, opts = {}) => {
      const r = await fetch("https://api.github.com" + path, { ...opts, headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...(opts.body ? { "content-type": "application/json" } : {}), ...(opts.headers || {}) } });
      if (r.status === 204) return {}; const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(path + " → " + r.status + " " + (j.message || "")); return j;
    };
    const b64 = (blob) => new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result.split(",")[1]); fr.readAsDataURL(blob); });
    try {
      let exists = true;
      try { await gh(`/repos/${owner}/${name}`); } catch (e) { exists = false; }
      if (!exists) {
        if (!$("#gh-create").checked) throw new Error("Repository not found and auto-create is off.");
        log(l, "Creating repository…");
        const me = await gh("/user");
        if (me.login.toLowerCase() === owner.toLowerCase()) await gh("/user/repos", { method: "POST", body: JSON.stringify({ name, auto_init: true, description: project.business.name + " website" }) });
        else await gh(`/orgs/${owner}/repos`, { method: "POST", body: JSON.stringify({ name, auto_init: true }) });
        await new Promise(r => setTimeout(r, 2500));
      }
      let baseSha = null, baseTree = null;
      try { const ref = await gh(`/repos/${owner}/${name}/git/ref/heads/${branch}`); baseSha = ref.object.sha; baseTree = (await gh(`/repos/${owner}/${name}/git/commits/${baseSha}`)).tree.sha; }
      catch (e) { log(l, "Branch " + branch + " not found; it will be created."); const info = await gh(`/repos/${owner}/${name}`); if (info.default_branch) { try { const ref = await gh(`/repos/${owner}/${name}/git/ref/heads/${info.default_branch}`); baseSha = ref.object.sha; } catch (e2) { } } }
      const entries = Object.entries(built.blobs); let i = 0; const tree = [];
      log(l, `Uploading ${entries.length} files…`);
      for (const [path, blob] of entries) {
        const isText = /\.(html|css|js|txt|xml|json|svg|webmanifest|md)$/.test(path) || path === "CNAME" || path === ".nojekyll";
        const body = isText ? { content: await blob.text(), encoding: "utf-8" } : { content: await b64(blob), encoding: "base64" };
        const bl = await gh(`/repos/${owner}/${name}/git/blobs`, { method: "POST", body: JSON.stringify(body) });
        tree.push({ path, mode: "100644", type: "blob", sha: bl.sha });
        if (++i % 10 === 0) log(l, `  ${i}/${entries.length}`);
      }
      tree.push({ path: "psb-project.json", mode: "100644", type: "blob", sha: (await gh(`/repos/${owner}/${name}/git/blobs`, { method: "POST", body: JSON.stringify({ content: JSON.stringify(project, null, 2), encoding: "utf-8" }) })).sha });
      const t = await gh(`/repos/${owner}/${name}/git/trees`, { method: "POST", body: JSON.stringify({ tree }) }); // fresh tree: removes stale files
      const commit = await gh(`/repos/${owner}/${name}/git/commits`, { method: "POST", body: JSON.stringify({ message: `Publish ${project.business.name} website (${built.pages.length} pages)`, tree: t.sha, parents: baseSha ? [baseSha] : [] }) });
      try { await gh(`/repos/${owner}/${name}/git/refs/heads/${branch}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha, force: true }) }); }
      catch (e) { await gh(`/repos/${owner}/${name}/git/refs`, { method: "POST", body: JSON.stringify({ ref: "refs/heads/" + branch, sha: commit.sha }) }); }
      log(l, "✓ Committed " + commit.sha.slice(0, 7));
      log(l, "Enabling GitHub Pages…");
      let pagesUrl = `https://${owner}.github.io/${name}/`;
      try { const pg = await gh(`/repos/${owner}/${name}/pages`, { method: "POST", body: JSON.stringify({ source: { branch, path: "/" } }) }); pagesUrl = pg.html_url || pagesUrl; }
      catch (e) { try { const pg = await gh(`/repos/${owner}/${name}/pages`, { method: "PUT", body: JSON.stringify({ source: { branch, path: "/" } }) }); pagesUrl = pg.html_url || pagesUrl; } catch (e2) { log(l, "  (Pages may already be enabled, or enable it in Settings → Pages: " + e2.message + ")"); } }
      if (project.seo.customDomain) pagesUrl = "https://" + project.seo.customDomain + "/";
      log(l, "✓ Live in ~1–2 minutes at " + pagesUrl);
      log(l, "Tip: set that URL as the Final site URL in step 7 and rebuild if it differs, so canonical links and the sitemap match.");
      log(l, "Next: submit " + pagesUrl + "sitemap.xml in Google Search Console and Bing Webmaster Tools.");
    } catch (e) { log(l, "✗ " + e.message); }
  });

  /* ---------- save / load / reset ---------- */
  $("#btn-save").addEventListener("click", async () => {
    const zip = new JSZip(); zip.file("project.json", JSON.stringify(project, null, 2));
    for (const [id, rec] of IMAGES) zip.file(`images/${id}.${rec.ext || "jpg"}`, rec.full);
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = (PSB.slug(project.business.name) || "project") + "-psb-project.zip"; a.click();
  });
  async function importFile(f) {
      if (!f) return;
      if (f.name.endsWith(".json")) { project = PSB.normalize(JSON.parse(await f.text())); }
      else {
        const zip = await JSZip.loadAsync(f); project = PSB.normalize(JSON.parse(await zip.file("project.json").async("string")));
        IMAGES.clear(); await db.clear();
        for (const [path, entry] of Object.entries(zip.files)) {
          if (entry.dir || !path.startsWith("images/")) continue;
          const id = path.slice(7).replace(/\.[^.]+$/, ""); const blob = await entry.async("blob");
          const file = new File([blob], path, { type: path.endsWith(".svg") ? "image/svg+xml" : path.endsWith(".png") ? "image/png" : "image/jpeg" });
          if (id === "logo") { const rec = { full: file, ext: path.endsWith(".svg") ? "svg" : "png", thumb: await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(file); }) }; IMAGES.set("logo", rec); await db.put("logo", rec); }
          else { const full = await resize(file, 1600), small = await resize(file, 800, .8), th = await resize(file, 320, .7); const rec = { full: full.blob, small: small.blob, w: full.w, h: full.h, thumb: await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(th.blob); }) }; IMAGES.set(id, rec); await db.put(id, rec); }
        }
      }
      project.images = project.images.filter(i => IMAGES.has(i.id)); project.brand.logo = IMAGES.has("logo") ? true : null;
      refreshBinds(); renderHours(); renderLists(); renderImages(); renderLogo(); updateCounts(); persist(); toast("Project loaded — " + project.services.length + " services, " + project.areas.length + " areas");
  }
  $("#btn-load").addEventListener("click", () => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".zip,.json"; inp.onchange = () => importFile(inp.files[0]); inp.click(); });
  $("#import-file").addEventListener("change", e => importFile(e.target.files[0]));
  const idrop = $("#import-drop");
  ["dragenter", "dragover"].forEach(ev => idrop.addEventListener(ev, e => { e.preventDefault(); idrop.classList.add("is-over"); }));
  ["dragleave", "drop"].forEach(ev => idrop.addEventListener(ev, e => { e.preventDefault(); idrop.classList.remove("is-over"); if (ev === "drop") importFile(e.dataTransfer.files[0]); }));
  $("#btn-reset").addEventListener("click", async () => { if (!confirm("Clear everything in this browser?")) return; localStorage.removeItem("psb-pro-project"); await db.clear(); location.reload(); });

  /* ---------- init ---------- */
  (async () => {
    await restore();
    bindAll(); renderHours(); renderLists(); renderImages(); renderLogo(); updateCounts();
    const h = location.hash.slice(1); if (h) go(h);
  })();
})();
