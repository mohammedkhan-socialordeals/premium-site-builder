/* Premium Site Builder Pro — generator
   Pure functions: project JSON -> { files: {path: string|Blob}, pages:[...] }
   Works in the browser and in Node (for tests). No frameworks. */
(function (root) {
  "use strict";

  /* ---------- helpers ---------- */
  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const attr = esc;
  const slug = (s) => String(s || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "page";
  const paras = (text) => String(text || "").split(/\n\s*\n/).map(t => t.trim()).filter(Boolean)
    .map(t => `<p>${esc(t).replace(/\n/g, "<br>")}</p>`).join("\n");
  const lines = (text) => String(text || "").split(/\n/).map(t => t.trim()).filter(Boolean);
  const words = (n, t) => n === 1 ? t : t + "s";
  const telHref = (p) => "tel:" + String(p || "").replace(/[^\d+]/g, "");
  const typo = (s) => String(s || "").replace(/'/g, "\u2019");
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pick = (arr, i) => arr.length ? arr[((i % arr.length) + arr.length) % arr.length] : null;

  /* ---------- defaults ---------- */
  const DEFAULT = {
    business: {
      name: "", tagline: "", category: "LocalBusiness", description: "", phone: "", email: "",
      address: { street: "", city: "", state: "", zip: "", country: "US" },
      mapLink: "", mapEmbed: "", lat: "", lng: "", yearFounded: "", priceRange: "",
      hours: [], social: { facebook: "", instagram: "", google: "", yelp: "", linkedin: "", youtube: "", tiktok: "" },
      booking: "",
    },
    brand: { logo: null, primary: "#0f5f5a", accent: "#d8a85b", ink: "#101417", paper: "#f7f4ee", theme: "light",
      fontDisplay: "Fraunces", fontBody: "Inter", style: "snazzy", radius: "18",
      fx: { mesh: true, grain: true, shimmer: true, beam: true, bento: true, chips: true, ticker: true, glass: true, blur: true, shine: true, dots: true, transitions: true } },
    images: [],
    services: [],
    areas: [],
    reviews: [],
    team: [],
    faqs: [],
    financing: { enabled: true, intro: "", options: [], faqs: [] },
    posts: [],
    custom: [],
    pages: { about: true, gallery: true, reviews: true, faq: true, financing: true, blog: true, team: true, careers: false, insurance: false },
    seo: { siteUrl: "", keywords: "", gaId: "", googleVerification: "", bingVerification: "", ogImage: "" },
    forms: { provider: "formspree", endpoint: "" },
    extras: { careersText: "", insuranceText: "", promoText: "", emergency: false, emergencyText: "", languages: "" },
  };

  function merge(base, over) {
    if (Array.isArray(base)) return Array.isArray(over) ? over : base;
    if (base && typeof base === "object") {
      const out = {};
      for (const k of Object.keys(base)) out[k] = merge(base[k], over && over[k]);
      if (over) for (const k of Object.keys(over)) if (!(k in out)) out[k] = over[k];
      return out;
    }
    return over === undefined || over === null ? base : over;
  }
  function normalize(p) {
    p = merge(DEFAULT, p || {});
    p.services = (p.services || []).filter(s => s && s.name).map((s, i) => ({
      ...s, slug: s.slug || slug(s.name), image: s.image || "", bullets: s.bullets || "", faqs: s.faqs || "", id: i
    }));
    p.areas = (p.areas || []).filter(a => a && a.name).map(a => ({ ...a, slug: a.slug || slug(a.name) }));
    p.posts = (p.posts || []).filter(x => x && x.title).map(x => ({ ...x, slug: x.slug || slug(x.title) }));
    p.custom = (p.custom || []).filter(x => x && x.title).map(x => ({ ...x, slug: x.slug || slug(x.title) }));
    p.reviews = (p.reviews || []).filter(r => r && r.text);
    p.team = (p.team || []).filter(t => t && t.name);
    p.faqs = (p.faqs || []).filter(f => f && f.q && f.a);
    p.images = (p.images || []).filter(i => i && i.id);
    return p;
  }

  /* ---------- FAQ parsing: "Q?\nA" blocks ---------- */
  function parseFaqs(text) {
    const out = [];
    String(text || "").split(/\n\s*\n/).forEach(block => {
      const ls = block.split(/\n/).map(x => x.trim()).filter(Boolean);
      if (ls.length >= 2) out.push({ q: ls[0].replace(/^Q[:.]\s*/i, ""), a: ls.slice(1).join(" ").replace(/^A[:.]\s*/i, "") });
    });
    return out;
  }

  /* ---------- page plan ---------- */
  function plan(p) {
    const pages = [];
    const add = (o) => { pages.push(o); return o; };
    const city = p.business.address.city;
    add({ path: "index.html", kind: "home", title: `${p.business.name} | ${primaryKeyword(p)} in ${city}`, nav: "Home", priority: "1.0" });
    if (p.pages.about) add({ path: "about/index.html", kind: "about", title: `About ${p.business.name}`, nav: "About", priority: "0.8" });
    add({ path: "services/index.html", kind: "services", title: `Services | ${p.business.name}`, nav: "Services", priority: "0.9" });
    p.services.forEach(s => {
      add({ path: `services/${s.slug}/index.html`, kind: "service", service: s, title: `${s.name} in ${city}, ${p.business.address.state} | ${p.business.name}`, priority: "0.9" });
      p.areas.forEach(a => add({ path: `services/${s.slug}/${a.slug}/index.html`, kind: "service-area", service: s, area: a, title: `${s.name} in ${a.name}, ${a.state || p.business.address.state} | ${p.business.name}`, priority: "0.7" }));
    });
    if (p.areas.length) {
      add({ path: "areas/index.html", kind: "areas", title: `Service Areas | ${p.business.name}`, nav: "Areas", priority: "0.7" });
      p.areas.forEach(a => add({ path: `areas/${a.slug}/index.html`, kind: "area", area: a, title: `${primaryKeyword(p)} in ${a.name}, ${a.state || p.business.address.state} | ${p.business.name}`, priority: "0.7" }));
    }
    if (p.pages.reviews) add({ path: "reviews/index.html", kind: "reviews", title: `Reviews | ${p.business.name}`, nav: "Reviews", priority: "0.6" });
    if (p.pages.gallery && p.images.length) add({ path: "gallery/index.html", kind: "gallery", title: `Gallery | ${p.business.name}`, nav: "Gallery", priority: "0.5" });
    if (p.pages.team && p.team.length) add({ path: "team/index.html", kind: "team", title: `Our Team | ${p.business.name}`, nav: "Team", priority: "0.6" });
    if (p.pages.financing && p.financing.enabled) add({ path: "financing/index.html", kind: "financing", title: `Financing & Payment Options | ${p.business.name}`, nav: "Financing", priority: "0.7" });
    if (p.pages.insurance && p.extras.insuranceText) add({ path: "insurance/index.html", kind: "insurance", title: `Insurance | ${p.business.name}`, priority: "0.6" });
    if (p.pages.faq) add({ path: "faq/index.html", kind: "faq", title: `Frequently Asked Questions | ${p.business.name}`, nav: "FAQ", priority: "0.7" });
    if (p.pages.blog && p.posts.length) {
      add({ path: "blog/index.html", kind: "blog", title: `Blog & Resources | ${p.business.name}`, nav: "Blog", priority: "0.6" });
      p.posts.forEach(x => add({ path: `blog/${x.slug}/index.html`, kind: "post", post: x, title: `${x.title} | ${p.business.name}`, priority: "0.5", date: x.date }));
    }
    p.custom.forEach(x => add({ path: `${x.slug}/index.html`, kind: "custom", custom: x, title: `${x.title} | ${p.business.name}`, priority: "0.5" }));
    if (p.pages.careers && p.extras.careersText) add({ path: "careers/index.html", kind: "careers", title: `Careers | ${p.business.name}`, priority: "0.4" });
    add({ path: "appointment/index.html", kind: "appointment", title: `Request an Appointment | ${p.business.name}`, nav: "Book", priority: "0.9" });
    add({ path: "contact/index.html", kind: "contact", title: `Contact ${p.business.name} in ${city}`, nav: "Contact", priority: "0.9" });
    add({ path: "privacy/index.html", kind: "privacy", title: `Privacy Policy | ${p.business.name}`, priority: "0.2" });
    add({ path: "terms/index.html", kind: "terms", title: `Terms of Use | ${p.business.name}`, priority: "0.2" });
    add({ path: "accessibility/index.html", kind: "accessibility", title: `Accessibility Statement | ${p.business.name}`, priority: "0.2" });
    add({ path: "sitemap/index.html", kind: "sitemap", title: `Site Map | ${p.business.name}`, priority: "0.3" });
    add({ path: "thank-you/index.html", kind: "thanks", title: `Thank You | ${p.business.name}`, priority: "0.1", noindex: true });
    add({ path: "404.html", kind: "404", title: `Page not found | ${p.business.name}`, noindex: true, nositemap: true });
    pages.forEach(pg => { pg.url = pg.path.replace(/index\.html$/, ""); pg.depth = pg.path.split("/").length - 1; pg.rel = "../".repeat(pg.depth); });
    return pages;
  }
  function primaryKeyword(p) {
    const kw = lines(p.seo.keywords.replace(/,/g, "\n"))[0];
    return kw || (p.services[0] ? p.services[0].name : p.business.category.replace(/([A-Z])/g, " $1").trim());
  }

  /* ---------- images ---------- */
  function imgTag(p, pg, id, opts = {}) {
    const im = p.images.find(i => i.id === id) || (typeof id === "number" ? pick(p.images, id) : null) || pick(p.images, 0);
    if (!im) return `<div class="ph" aria-hidden="true"></div>`;
    const base = pg.rel + "assets/img/" + im.id;
    const sizes = opts.sizes || "(min-width: 900px) 50vw, 100vw";
    return `<img src="${base}.jpg" srcset="${base}-800.jpg 800w, ${base}.jpg 1600w" sizes="${sizes}" width="${im.w || 1600}" height="${im.h || 1067}" alt="${attr(opts.alt || im.alt || "")}" loading="${opts.eager ? "eager" : "lazy"}" decoding="async"${opts.extra || ""}>`;
  }
  function logoTag(p, pg, cls) {
    if (p.brand.logo) return `<img src="${pg.rel}assets/logo.${p.brand.logoExt || "png"}" alt="${attr(p.business.name)} logo" class="${cls}" width="${p.brand.logoW || 160}" height="${p.brand.logoH || 48}" loading="eager" decoding="async">`;
    return `<span class="wordmark ${cls}">${esc(p.business.name)}</span>`;
  }

  /* ---------- schema / JSON-LD ---------- */
  function schema(p, pg, extra = []) {
    const b = p.business, url = (p.seo.siteUrl || "").replace(/\/+$/, "") + "/";
    const org = {
      "@type": [b.category || "LocalBusiness"], "@id": url + "#business", name: b.name, url,
      telephone: b.phone || undefined, email: b.email || undefined, description: b.description || undefined,
      image: p.images[0] ? url + "assets/img/" + p.images[0].id + ".jpg" : undefined,
      logo: p.brand.logo ? url + "assets/logo." + (p.brand.logoExt || "png") : undefined,
      priceRange: b.priceRange || undefined, foundingDate: b.yearFounded || undefined,
      address: { "@type": "PostalAddress", streetAddress: b.address.street, addressLocality: b.address.city, addressRegion: b.address.state, postalCode: b.address.zip, addressCountry: b.address.country || "US" },
      geo: (b.lat && b.lng) ? { "@type": "GeoCoordinates", latitude: +b.lat, longitude: +b.lng } : undefined,
      hasMap: b.mapLink || undefined,
      areaServed: p.areas.length ? p.areas.map(a => ({ "@type": "City", name: a.name })) : (b.address.city ? [{ "@type": "City", name: b.address.city }] : undefined),
      openingHoursSpecification: (b.hours || []).filter(h => h.days && h.open && h.close).map(h => ({ "@type": "OpeningHoursSpecification", dayOfWeek: h.days, opens: h.open, closes: h.close })),
      sameAs: Object.values(b.social || {}).filter(Boolean),
      makesOffer: p.services.map(s => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.name, url: url + "services/" + s.slug + "/" } })),
    };
    if (p.reviews.length) {
      const rated = p.reviews.filter(r => +r.rating);
      if (rated.length) org.aggregateRating = { "@type": "AggregateRating", ratingValue: (rated.reduce((a, r) => a + (+r.rating), 0) / rated.length).toFixed(1), reviewCount: rated.length };
    }
    const site = { "@type": "WebSite", "@id": url + "#website", url, name: b.name, publisher: { "@id": url + "#business" } };
    const crumbs = breadcrumbs(p, pg);
    const bc = { "@type": "BreadcrumbList", itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: url + c.url })) };
    const page = { "@type": "WebPage", "@id": url + pg.url + "#webpage", url: url + pg.url, name: pg.title, isPartOf: { "@id": url + "#website" }, about: { "@id": url + "#business" }, description: pg.description, inLanguage: "en" };
    const graph = [org, site, page, bc, ...extra].filter(Boolean);
    const clean = (o) => JSON.parse(JSON.stringify(o));
    return `<script type="application/ld+json">${JSON.stringify(clean({ "@context": "https://schema.org", "@graph": graph }))}</script>`;
  }
  function faqSchema(faqs) {
    if (!faqs.length) return null;
    return { "@type": "FAQPage", mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  }
  function breadcrumbs(p, pg) {
    const out = [{ name: "Home", url: "" }];
    const parts = pg.url.split("/").filter(Boolean);
    let acc = "";
    parts.forEach((part, i) => {
      acc += part + "/";
      let name = part.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      if (pg.service && part === pg.service.slug) name = pg.service.name;
      if (pg.area && part === pg.area.slug) name = pg.area.name;
      if (pg.post && part === pg.post.slug) name = pg.post.title;
      if (pg.custom && part === pg.custom.slug) name = pg.custom.title;
      out.push({ name, url: acc });
    });
    return out;
  }

  /* ---------- chrome ---------- */
  function header(p, pg, pages) {
    const b = p.business;
    const navPages = pages.filter(x => x.nav && x.kind !== "home" && x.kind !== "appointment" && x.kind !== "contact");
    const link = (x) => `<a href="${pg.rel}${x.url || "./"}"${x.url === pg.url ? ' aria-current="page"' : ""}>${esc(x.nav)}</a>`;
    const svcMenu = p.services.slice(0, 12).map(s => `<li><a href="${pg.rel}services/${s.slug}/">${esc(s.name)}</a></li>`).join("");
    return `<a class="skip-link" href="#main">Skip to content</a>
<header data-header class="site-header">
  <div class="hdr-inner">
    <a class="brand" href="${pg.rel}" aria-label="${attr(b.name)} home">${logoTag(p, pg, "brand-logo")}</a>
    <nav data-nav aria-label="Main" class="nav-desktop">
      ${navPages.map(x => x.kind === "services" ? `<div class="has-menu"><a href="${pg.rel}services/">Services</a><ul class="menu">${svcMenu}<li><a href="${pg.rel}services/">All services →</a></li></ul></div>` : link(x)).join("\n      ")}
    </nav>
    <div class="hdr-actions">
      ${b.phone ? `<a class="hdr-tel" href="${telHref(b.phone)}">${esc(b.phone)}</a>` : ""}
      <a class="btn btn-primary" data-magnetic href="${pg.rel}appointment/">Request Appointment</a>
      <button data-nav-toggle class="nav-toggle" aria-label="Menu"><span></span><span></span></button>
    </div>
  </div>
  <div class="progress" data-progress aria-hidden="true"></div>
  <div class="nav-overlay" aria-label="Mobile menu">
    <nav data-nav class="nav-mobile">
      ${[pages[0], ...navPages, pages.find(x => x.kind === "appointment"), pages.find(x => x.kind === "contact")].filter(Boolean).map(link).join("\n      ")}
    </nav>
    <div class="nav-overlay-meta">
      ${b.phone ? `<a href="${telHref(b.phone)}">${esc(b.phone)}</a>` : ""}
      <p>${esc([b.address.street, b.address.city, b.address.state, b.address.zip].filter(Boolean).join(", "))}</p>
      <p data-open-status></p>
    </div>
  </div>
</header>
<div class="sticky-cta" data-sticky-cta>
  ${b.phone ? `<a href="${telHref(b.phone)}">Call</a>` : ""}
  <a class="primary" href="${pg.rel}appointment/">Book</a>
  ${b.mapLink ? `<a href="${attr(b.mapLink)}" target="_blank" rel="noopener">Directions</a>` : ""}
</div>`;
  }

  function footer(p, pg, pages) {
    const b = p.business, year = new Date().getFullYear();
    const col = (title, items) => items.length ? `<div class="ft-col"><h3>${title}</h3><ul>${items.join("")}</ul></div>` : "";
    const svc = p.services.slice(0, 10).map(s => `<li><a href="${pg.rel}services/${s.slug}/">${esc(s.name)}</a></li>`);
    const areas = p.areas.slice(0, 10).map(a => `<li><a href="${pg.rel}areas/${a.slug}/">${esc(a.name)}</a></li>`);
    const company = pages.filter(x => ["about", "team", "reviews", "gallery", "financing", "insurance", "faq", "blog", "careers", "contact", "appointment"].includes(x.kind)).map(x => `<li><a href="${pg.rel}${x.url}">${esc(x.nav || x.title.split("|")[0].trim())}</a></li>`);
    const social = Object.entries(b.social || {}).filter(([, v]) => v).map(([k, v]) => `<a href="${attr(v)}" target="_blank" rel="noopener">${k[0].toUpperCase() + k.slice(1)}</a>`).join("");
    return `<footer class="site-footer">
  <div class="ft-cta" data-reveal>
    <h2 data-split>Ready when you are.</h2>
    <p>Request an appointment online or call us${b.address.city ? ` in ${esc(b.address.city)}` : ""} today.</p>
    <div class="btn-row"><a class="btn btn-light" data-magnetic href="${pg.rel}appointment/">Request Appointment</a>${b.phone ? `<a class="btn btn-ghost" href="${telHref(b.phone)}">Call ${esc(b.phone)}</a>` : ""}</div>
  </div>
  <div class="ft-grid">
    <div class="ft-col ft-brand">
      ${logoTag(p, pg, "ft-logo")}
      <p>${esc(b.tagline || b.description.slice(0, 160))}</p>
      <address>${esc(b.address.street)}<br>${esc([b.address.city, b.address.state].filter(Boolean).join(", "))} ${esc(b.address.zip)}</address>
      ${b.phone ? `<a href="${telHref(b.phone)}">${esc(b.phone)}</a><br>` : ""}${b.email ? `<a href="mailto:${attr(b.email)}">${esc(b.email)}</a>` : ""}
      <p data-open-status class="open-status"></p>
      <div class="social">${social}</div>
    </div>
    ${col("Services", svc)}${col("Service areas", areas)}${col("Company", company)}
  </div>
  <div class="ft-legal">
    <p>© ${year} ${esc(b.name)}. All rights reserved.</p>
    <p><a href="${pg.rel}privacy/">Privacy</a> · <a href="${pg.rel}terms/">Terms</a> · <a href="${pg.rel}accessibility/">Accessibility</a> · <a href="${pg.rel}sitemap/">Site map</a></p>
  </div>
</footer>
<div class="psb-cursor" aria-hidden="true"><span></span></div>`;
  }

  /* ---------- reusable section builders ---------- */
  const eyebrow = (t) => `<p class="eyebrow">${esc(t)}</p>`;
  function hero(p, pg, { eyebrowText, h1, lead, imgId, small }) {
    return `<section class="hero${small ? " hero-sm" : ""}" data-scroll>
  <div class="hero-bg">${imgTag(p, pg, imgId, { sizes: "100vw", eager: true, alt: "" })}</div>
  <div class="hero-inner">
    ${eyebrowText ? eyebrow(eyebrowText) : ""}
    <h1 data-split>${h1}</h1>
    ${lead ? `<p class="lead" data-reveal style="--delay:300ms">${lead}</p>` : ""}
    <div class="btn-row" data-reveal>
      <a class="btn btn-primary" data-magnetic data-cursor="Book" href="${pg.rel}appointment/">Request Appointment</a>
      ${p.business.phone ? `<a class="btn btn-ghost" href="${telHref(p.business.phone)}">Call ${esc(p.business.phone)}</a>` : ""}
    </div>
    <p class="hero-meta" data-reveal><span data-open-status></span></p>
  </div>
  ${(!small && p.brand.fx.chips) ? heroChips(p) : ""}
  ${!small ? `<a class="scroll-cue" href="#main-content" aria-label="Scroll down"><span></span></a>` : ""}
  ${p.brand.fx.mesh ? `<div class="mesh" aria-hidden="true"><i></i><i></i><i></i></div>` : ""}
</section>`;
  }
  function heroChips(p) {
    const b = p.business, chips = [];
    const rated = p.reviews.filter(r => +r.rating);
    if (rated.length) chips.push(`<span class="chip chip-a"><b>★ ${(rated.reduce((a, r) => a + +r.rating, 0) / rated.length).toFixed(1)}</b> ${rated.length} ${words(rated.length, "review")}</span>`);
    if (b.yearFounded) chips.push(`<span class="chip chip-b"><b>Since ${esc(b.yearFounded)}</b> in ${esc(b.address.city)}</span>`);
    if (p.services.length) chips.push(`<span class="chip chip-c"><b>${p.services.length}</b> ${words(p.services.length, "service")}</span>`);
    if (b.booking) chips.push(`<a class="chip chip-d" href="${attr(b.booking)}" target="_blank" rel="noopener"><b>Book online</b> instant confirmation</a>`);
    return chips.length ? `<div class="chips" aria-hidden="true">${chips.slice(0, 3).join("")}</div>` : "";
  }
  function bentoSection(p, pg) {
    if (!p.brand.fx.bento) return "";
    const b = p.business, cells = [];
    const rated = p.reviews.filter(r => +r.rating);
    cells.push(`<div class="bento-cell bento-big" data-spotlight><p class="eyebrow">Why ${esc(b.name)}</p><h3>${esc(b.tagline || `Care that feels personal, in ${b.address.city}`)}</h3><p>${esc(b.description.split(/\n/)[0].slice(0, 220))}</p><a class="link-arrow" href="${pg.rel}${p.pages.about ? "about/" : "services/"}">Learn more →</a></div>`);
    if (rated.length) cells.push(`<div class="bento-cell bento-stat"><strong data-count="${(rated.reduce((a, r) => a + +r.rating, 0) / rated.length).toFixed(1)}">0.0</strong><span>average of ${rated.length} ${words(rated.length, "review")}</span><em class="stars">★★★★★</em></div>`);
    cells.push(`<div class="bento-cell bento-open"><span class="pulse"></span><strong data-open-status>Hours</strong><span>${esc(b.address.street)}, ${esc(b.address.city)}</span>${b.mapLink ? `<a href="${attr(b.mapLink)}" target="_blank" rel="noopener">Directions →</a>` : ""}</div>`);
    if (p.images[1]) cells.push(`<div class="bento-cell bento-img">${imgTag(p, pg, p.images[1].id, { sizes: "(min-width: 900px) 33vw, 100vw" })}</div>`);
    if (p.financing.enabled) cells.push(`<div class="bento-cell bento-fin"><strong>Flexible payment</strong><span>Plans and options that fit real budgets.</span><a href="${pg.rel}financing/">See financing →</a></div>`);
    cells.push(`<div class="bento-cell bento-cta" data-spotlight><strong>Ready to talk?</strong><span>We confirm every request personally.</span><a class="btn btn-primary" data-magnetic href="${pg.rel}appointment/">Request Appointment</a></div>`);
    return `<section class="bento wrap"><div class="bento-grid" data-reveal="stagger">${cells.join("")}</div></section>`;
  }
  function tickerSection(p) {
    if (!p.brand.fx.ticker || p.services.length < 3) return "";
    return `<div class="ticker" data-marquee data-marquee-scroll aria-hidden="true"><div>${p.services.map(s => `<span><em>${esc(s.name)}</em><i>✦</i></span>`).join("")}</div></div>`;
  }
  function crumbsHtml(p, pg) {
    const c = breadcrumbs(p, pg);
    return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${c.map((x, i) => i === c.length - 1 ? `<li aria-current="page">${esc(x.name)}</li>` : `<li><a href="${pg.rel}${x.url}">${esc(x.name)}</a></li>`).join("")}</ol></nav>`;
  }
  function faqSection(faqs, title = "Questions, answered") {
    if (!faqs.length) return "";
    return `<section class="faq wrap" id="faq">
  ${eyebrow("FAQ")}<h2 data-split>${esc(title)}</h2>
  <div class="faq-list" data-reveal="stagger">
    ${faqs.map(f => `<details class="faq-item"><summary><span>${esc(f.q)}</span><i aria-hidden="true"></i></summary><div class="faq-a"><p>${esc(f.a)}</p></div></details>`).join("\n    ")}
  </div>
</section>`;
  }
  function servicesGrid(p, pg, items, opts = {}) {
    if (!items.length) return "";
    const card = (s, i) => `<a class="svc-card" data-tilt href="${pg.rel}services/${s.slug}/${opts.area ? opts.area.slug + "/" : ""}">
      <div class="svc-media">${imgTag(p, pg, s.image || i + 1, { sizes: "(min-width: 900px) 33vw, 100vw", alt: s.name })}</div>
      <span class="num">${String(i + 1).padStart(2, "0")}</span>
      <h3>${esc(s.name)}</h3>
      <p>${esc(s.short)}</p>
      <span class="arrow" aria-hidden="true">→</span>
    </a>`;
    if (opts.hscroll && items.length >= 4) {
      return `<section class="svcs" id="services"><div class="wrap">${eyebrow(opts.eyebrow || "What we do")}<h2 data-split>${opts.title || "Our services"}</h2></div>
  <div class="hscroll" data-hscroll><div class="hscroll-track" data-hscroll-track>${items.map(card).join("")}</div><div class="hscroll-bar" data-hscroll-progress></div></div>
</section>`;
    }
    return `<section class="svcs wrap" id="services">${eyebrow(opts.eyebrow || "What we do")}<h2 data-split>${opts.title || "Our services"}</h2>
  <div class="svc-grid" data-reveal="stagger">${items.map(card).join("")}</div>
</section>`;
  }
  function reviewsSection(p, pg, limit = 6) {
    const rs = p.reviews.slice(0, limit);
    if (!rs.length) return "";
    const stars = (n) => n ? `<span class="stars" aria-label="${n} out of 5 stars">${"★".repeat(clamp(Math.round(+n), 0, 5))}</span>` : "";
    return `<section class="reviews" id="reviews"><div class="wrap">${eyebrow("Reviews")}<h2 data-split>What ${esc(p.business.address.city || "our")} clients say</h2></div>
  <div class="carousel" data-carousel>
    <div class="carousel-track" data-carousel-track>
      ${rs.map(r => `<figure class="review" data-spotlight>${stars(r.rating)}<blockquote>${esc(typo(r.text))}</blockquote><figcaption>${esc(r.author)}${r.source ? ` <span>· ${esc(r.source)}</span>` : ""}</figcaption></figure>`).join("")}
    </div>
    <div class="carousel-ctl"><button data-carousel-prev aria-label="Previous review">←</button><span data-carousel-count></span><button data-carousel-next aria-label="Next review">→</button></div>
  </div>
</section>`;
  }
  function ctaBand(p, pg, text) {
    return `<section class="cta-band" data-spotlight><div class="wrap"><h2 data-split>${text}</h2><div class="btn-row"><a class="btn btn-light" data-magnetic href="${pg.rel}appointment/">Request Appointment</a>${p.business.phone ? `<a class="btn btn-ghost" href="${telHref(p.business.phone)}">${esc(p.business.phone)}</a>` : ""}</div></div></section>`;
  }
  function areasList(p, pg, serviceSlug) {
    if (!p.areas.length) return "";
    return `<section class="areas wrap" id="areas">${eyebrow("Where we work")}<h2 data-split>Serving ${esc(p.business.address.city)} and nearby communities</h2>
  <ul class="chip-list" data-reveal="stagger">${p.areas.map(a => `<li><a href="${pg.rel}${serviceSlug ? `services/${serviceSlug}/${a.slug}/` : `areas/${a.slug}/`}">${esc(a.name)}</a></li>`).join("")}</ul>
</section>`;
  }
  function contactBlock(p, pg) {
    const b = p.business;
    const hours = (b.hours || []).filter(h => h.days).map(h => `<tr><th scope="row">${esc(h.days)}</th><td>${h.open && h.close ? esc(h.open + " – " + h.close) : "Closed"}</td></tr>`).join("");
    return `<section class="contact-block wrap" id="visit">
  <div class="contact-grid">
    <div data-reveal>
      ${eyebrow("Visit us")}<h2 data-split>Find us in ${esc(b.address.city)}</h2>
      <address>${esc(b.address.street)}<br>${esc(b.address.city)}, ${esc(b.address.state)} ${esc(b.address.zip)}</address>
      ${b.phone ? `<p><a class="big-link" href="${telHref(b.phone)}">${esc(b.phone)}</a></p>` : ""}
      ${b.email ? `<p><a href="mailto:${attr(b.email)}">${esc(b.email)}</a></p>` : ""}
      <p class="open-status" data-open-status></p>
      ${b.mapLink ? `<a class="btn btn-outline" data-magnetic href="${attr(b.mapLink)}" target="_blank" rel="noopener">Get directions</a>` : ""}
    </div>
    <div data-reveal>
      ${hours ? `<table class="hours"><caption class="sr-only">Opening hours</caption><tbody>${hours}</tbody></table>` : ""}
      ${b.mapEmbed ? `<div class="map-wrap"><iframe loading="lazy" title="Map to ${attr(b.name)}" src="${attr(b.mapEmbed)}" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>` : ""}
    </div>
  </div>
</section>`;
  }
  function form(p, pg, kind) {
    const f = p.forms;
    const action = f.provider === "formspree" && f.endpoint ? f.endpoint : f.provider === "mailto" ? `mailto:${p.business.email}` : "";
    const netlify = f.provider === "netlify" ? ` data-netlify="true" name="${kind}"` : "";
    const svcOpts = p.services.map(s => `<option>${esc(s.name)}</option>`).join("");
    const isAppt = kind === "appointment";
    return `<form class="form" method="POST" action="${attr(action)}"${netlify} data-form>
  <input type="hidden" name="_subject" value="${attr((isAppt ? "Appointment request" : "Contact") + " — " + p.business.name)}">
  <input type="hidden" name="_next" value="${attr((p.seo.siteUrl || "").replace(/\/+$/, "") + "/thank-you/")}">
  ${netlify ? `<input type="hidden" name="form-name" value="${kind}">` : ""}
  <p class="hp"><label>Leave this field empty <input name="_gotcha" tabindex="-1" autocomplete="off"></label></p>
  <div class="row2"><label>Full name<input name="name" required autocomplete="name"></label><label>Phone<input name="phone" type="tel" required autocomplete="tel"></label></div>
  <label>Email<input name="email" type="email" required autocomplete="email"></label>
  ${isAppt ? `<div class="row2"><label>Service<select name="service"><option value="">Select a service</option>${svcOpts}<option>Not sure yet</option></select></label><label>Preferred date<input name="date" type="date"></label></div>
  <fieldset><legend>Preferred time</legend><label class="inline"><input type="radio" name="time" value="Morning" checked> Morning</label><label class="inline"><input type="radio" name="time" value="Afternoon"> Afternoon</label><label class="inline"><input type="radio" name="time" value="Evening"> Evening</label></fieldset>
  <label class="inline"><input type="checkbox" name="new_patient" value="yes"> I am a new client</label>` : ""}
  <label>${isAppt ? "Anything we should know?" : "How can we help?"}<textarea name="message" rows="5"${isAppt ? "" : " required"}></textarea></label>
  <label class="inline consent"><input type="checkbox" name="consent" required> I agree to be contacted about my request. See our <a href="${pg.rel}privacy/">privacy policy</a>.</label>
  <button class="btn btn-primary" data-magnetic type="submit">${isAppt ? "Send appointment request" : "Send message"}</button>
  <p class="form-note">${action ? "We typically reply within one business day." : "Form delivery is not configured yet — connect Formspree, Netlify Forms or an email address in the builder."}</p>
</form>`;
  }
  function statsBand(p) {
    const b = p.business, items = [];
    if (b.yearFounded) items.push({ n: new Date().getFullYear() - (+b.yearFounded), s: "+", l: "years serving " + b.address.city });
    if (p.services.length) items.push({ n: p.services.length, s: "", l: "services offered" });
    if (p.reviews.length) items.push({ n: p.reviews.length, s: "+", l: "client reviews" });
    if (p.areas.length) items.push({ n: p.areas.length, s: "", l: "communities served" });
    if (!items.length) return "";
    return `<section class="stats wrap"><ul data-reveal="stagger">${items.map(i => `<li><strong data-count="${i.n}" data-suffix="${i.s}">${i.n}${i.s}</strong><span>${esc(i.l)}</span></li>`).join("")}</ul></section>`;
  }

  /* ---------- page bodies ---------- */
  const bodies = {
    home(p, pg, pages) {
      const b = p.business, city = b.address.city;
      const manifesto = b.description ? `<section class="manifesto wrap"><p class="scrub" data-scrub>${esc(typo(b.description))}</p></section>` : "";
      const about = p.pages.about ? `<section class="split wrap" id="about">
  <div class="split-media" data-reveal="wipe"><div>${imgTag(p, pg, 1, { alt: "" })}</div></div>
  <div class="split-text" data-reveal>${eyebrow("About " + b.name)}<h2 data-split>${esc(b.tagline || `Care that feels personal, in ${city}`)}</h2>${paras(b.description.split(/\n\s*\n/).slice(0, 2).join("\n\n"))}<a class="link-arrow" href="${pg.rel}about/">Our story →</a></div>
</section>` : "";
      const process = p.services.length >= 3 ? `<section class="process wrap">${eyebrow("How it works")}<h2 data-split>Simple from the first call</h2>
  <ol class="stack" data-stack>
    <li><span>01</span><h3>Reach out</h3><p>Request an appointment online or call us. We will confirm a time that works for you.</p></li>
    <li><span>02</span><h3>Your first visit</h3><p>We listen first, then walk you through options and clear next steps — no pressure.</p></li>
    <li><span>03</span><h3>A plan you understand</h3><p>You get a plain-language plan${p.financing.enabled ? " and payment options that fit" : ""} before anything begins.</p></li>
  </ol></section>` : "";
      const gallery = p.images.length >= 4 ? `<section class="gallery-strip" data-lightbox><div class="wrap">${eyebrow("Gallery")}<h2 data-split>A look inside</h2></div><div class="marquee" data-marquee data-marquee-scroll><div>${p.images.slice(0, 8).map((im, i) => `<figure>${imgTag(p, pg, im.id, { sizes: "40vw" })}</figure>`).join("")}</div></div></section>` : "";
      const hoverList = p.services.length ? `<section class="hover-list wrap">${eyebrow("Explore")}<h2 data-split>Find the right service</h2><ul data-hover-reveal>${p.services.slice(0, 8).map((s, i) => `<li><a href="${pg.rel}services/${s.slug}/"><span>${esc(s.name)}</span><small>${esc(s.short)}</small></a>${imgTag(p, pg, s.image || i + 1, { extra: ' data-hover-media', sizes: "320px", alt: "" })}</li>`).join("")}</ul></section>` : "";
      return [
        hero(p, pg, { eyebrowText: `${city}, ${b.address.state}`, h1: `${esc(primaryKeyword(p))} in <em>${esc(city)}</em>`, lead: esc(b.tagline || b.description.split(/\n/)[0].slice(0, 180)), imgId: 0 }),
        tickerSection(p), manifesto, statsBand(p), bentoSection(p, pg), servicesGrid(p, pg, p.services.slice(0, 8), { hscroll: true, title: `${words(p.services.length, "Service")} designed around you` }),
        about, process, hoverList, reviewsSection(p, pg), gallery, areasList(p, pg), faqSection(p.faqs.slice(0, 6)), contactBlock(p, pg), ctaBand(p, pg, `Let’s get started, ${esc(city)}.`)
      ].join("\n");
    },
    about(p, pg) {
      const b = p.business;
      return [hero(p, pg, { eyebrowText: "About", h1: `The people behind <em>${esc(b.name)}</em>`, lead: esc(b.tagline), imgId: 1, small: true }),
        crumbsHtml(p, pg),
        `<section class="prose wrap narrow" data-reveal>${paras(b.description)}${b.yearFounded ? `<p>Serving ${esc(b.address.city)} since ${esc(b.yearFounded)}.</p>` : ""}</section>`,
        statsBand(p),
        p.team.length ? `<section class="team wrap">${eyebrow("Team")}<h2 data-split>Meet the team</h2><div class="team-grid" data-reveal="stagger">${p.team.map(t => `<article class="member" data-tilt>${t.image ? imgTag(p, pg, t.image, { sizes: "300px", alt: t.name }) : ""}<h3>${esc(t.name)}</h3><p class="role">${esc(t.role)}</p>${t.bio ? `<p>${esc(t.bio)}</p>` : ""}</article>`).join("")}</div></section>` : "",
        reviewsSection(p, pg, 4), ctaBand(p, pg, "Come see the difference.")].join("\n");
    },
    services(p, pg) {
      return [hero(p, pg, { eyebrowText: "Services", h1: `Everything we do in <em>${esc(p.business.address.city)}</em>`, lead: "Explore each service to learn what to expect, who it helps, and how to get started.", imgId: 2, small: true }),
        crumbsHtml(p, pg), servicesGrid(p, pg, p.services, { title: "All services", eyebrow: `${p.services.length} ${words(p.services.length, "service")}` }),
        p.financing.enabled ? `<section class="note-band wrap" data-reveal><p>Flexible payment options are available. <a href="${pg.rel}financing/">See financing →</a></p></section>` : "",
        faqSection(p.faqs.slice(0, 5)), ctaBand(p, pg, "Not sure where to start? Ask us.")].join("\n");
    },
    service(p, pg) {
      const s = pg.service, b = p.business, city = pg.area ? pg.area.name : b.address.city;
      const bullets = lines(s.bullets), faqs = parseFaqs(s.faqs);
      const others = p.services.filter(x => x.slug !== s.slug).slice(0, 3);
      const areaIntro = pg.area ? `<p class="area-note">${esc(b.name)} provides ${esc(s.name.toLowerCase())} for clients in ${esc(pg.area.name)}${pg.area.note ? ` — ${esc(pg.area.note)}` : ""}. Our office is located in ${esc(b.address.city)}, ${esc(b.address.state)}${b.mapLink ? ` (<a href="${attr(b.mapLink)}" target="_blank" rel="noopener">directions</a>)` : ""}.</p>` : "";
      return [hero(p, pg, { eyebrowText: pg.area ? `${s.name} · ${pg.area.name}` : "Service", h1: `${esc(s.name)} in <em>${esc(city)}</em>`, lead: esc(s.short), imgId: s.image || s.id + 1, small: true }),
        crumbsHtml(p, pg),
        `<section class="svc-detail wrap"><div class="svc-cols">
  <article class="prose" data-reveal>${areaIntro}${paras(s.body || s.short)}
    ${bullets.length ? `<h2>What’s included</h2><ul class="checks" data-reveal="stagger">${bullets.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
    ${s.priceFrom ? `<p class="price">Starting from <strong>${esc(s.priceFrom)}</strong></p>` : ""}
    ${p.financing.enabled ? `<p>Flexible payment plans may be available — <a href="${pg.rel}financing/">see financing options</a>.</p>` : ""}
  </article>
  <aside class="svc-aside" data-reveal>
    <div class="aside-card" data-spotlight><h3>Book ${esc(s.name)}</h3><p>Request a time online and we will confirm by phone or email.</p><a class="btn btn-primary" data-magnetic href="${pg.rel}appointment/">Request Appointment</a>${b.phone ? `<a class="aside-tel" href="${telHref(b.phone)}">${esc(b.phone)}</a>` : ""}<p class="open-status" data-open-status></p></div>
    ${others.length ? `<div class="aside-links"><h3>Related services</h3><ul>${others.map(o => `<li><a href="${pg.rel}services/${o.slug}/${pg.area ? pg.area.slug + "/" : ""}">${esc(o.name)}</a></li>`).join("")}</ul></div>` : ""}
  </aside></div></section>`,
        pg.area ? "" : areasList(p, pg, s.slug),
        pg.area ? `<section class="wrap areas">${eyebrow("Also serving")}<ul class="chip-list" data-reveal="stagger">${p.areas.filter(a => a.slug !== pg.area.slug).slice(0, 12).map(a => `<li><a href="${pg.rel}services/${s.slug}/${a.slug}/">${esc(s.name)} in ${esc(a.name)}</a></li>`).join("")}<li><a href="${pg.rel}services/${s.slug}/">${esc(s.name)} in ${esc(b.address.city)}</a></li></ul></section>` : "",
        faqSection(faqs.length ? faqs : p.faqs.slice(0, 4), `${s.name}: common questions`),
        reviewsSection(p, pg, 4), ctaBand(p, pg, `Ready for ${esc(s.name.toLowerCase())}?`)].join("\n");
    },
    "service-area"(p, pg) { return bodies.service(p, pg); },
    areas(p, pg) {
      return [hero(p, pg, { eyebrowText: "Service areas", h1: `Proudly serving <em>${esc(p.business.address.city)}</em> and beyond`, lead: `Our office is in ${esc(p.business.address.city)}, ${esc(p.business.address.state)}. Choose your community to see what we offer near you.`, imgId: 3, small: true }),
        crumbsHtml(p, pg),
        `<section class="wrap area-grid-sec"><div class="area-grid" data-reveal="stagger">${p.areas.map(a => `<a class="area-card" data-tilt href="${pg.rel}areas/${a.slug}/"><h2>${esc(a.name)}</h2><p>${esc(a.note || `${p.services.length} ${words(p.services.length, "service")} available`)}</p><span>→</span></a>`).join("")}</div></section>`,
        contactBlock(p, pg), ctaBand(p, pg, "Closer than you think.")].join("\n");
    },
    area(p, pg) {
      const a = pg.area, b = p.business;
      return [hero(p, pg, { eyebrowText: a.name, h1: `${esc(primaryKeyword(p))} for <em>${esc(a.name)}</em>`, lead: esc(a.note || `${b.name} welcomes clients from ${a.name}. Our office is a short drive away in ${b.address.city}.`), imgId: 4, small: true }),
        crumbsHtml(p, pg),
        `<section class="prose wrap narrow" data-reveal><p>${esc(b.name)} is located in ${esc(b.address.city)}, ${esc(b.address.state)} and serves ${esc(a.name)} and the surrounding area. ${esc(b.tagline || "")}</p>${b.mapLink ? `<p><a class="btn btn-outline" href="${attr(b.mapLink)}" target="_blank" rel="noopener">Directions from ${esc(a.name)}</a></p>` : ""}</section>`,
        servicesGrid(p, pg, p.services, { area: a, title: `Services for ${esc(a.name)}`, eyebrow: "What we offer" }),
        reviewsSection(p, pg, 4), faqSection(p.faqs.slice(0, 4)), contactBlock(p, pg), ctaBand(p, pg, `Hello, ${esc(a.name)}.`)].join("\n");
    },
    reviews(p, pg) {
      const stars = (n) => n ? `<span class="stars">${"★".repeat(clamp(Math.round(+n), 0, 5))}</span>` : "";
      return [hero(p, pg, { eyebrowText: "Reviews", h1: `In their <em>own words</em>`, lead: p.reviews.length ? `${p.reviews.length} ${words(p.reviews.length, "review")} from real clients.` : "", imgId: 5, small: true }),
        crumbsHtml(p, pg),
        p.reviews.length ? `<section class="wrap review-wall"><div class="masonry" data-reveal="stagger">${p.reviews.map(r => `<figure class="review" data-tilt>${stars(r.rating)}<blockquote>${esc(typo(r.text))}</blockquote><figcaption>${esc(r.author)}${r.source ? ` <span>· ${esc(r.source)}</span>` : ""}</figcaption></figure>`).join("")}</div></section>` : `<section class="wrap prose narrow"><p>Reviews will appear here. Add them in the builder.</p></section>`,
        p.business.social.google ? `<section class="wrap note-band" data-reveal><p>Read more on <a href="${attr(p.business.social.google)}" target="_blank" rel="noopener">Google</a>.</p></section>` : "",
        ctaBand(p, pg, "Your experience matters to us.")].join("\n");
    },
    gallery(p, pg) {
      return [hero(p, pg, { eyebrowText: "Gallery", h1: `A look <em>inside</em>`, imgId: 6, small: true }), crumbsHtml(p, pg),
        `<section class="wrap gal" data-lightbox><div class="gal-grid" data-reveal="stagger">${p.images.map(im => `<figure data-tilt>${imgTag(p, pg, im.id, { sizes: "(min-width: 900px) 33vw, 50vw" })}${im.alt ? `<figcaption>${esc(im.alt)}</figcaption>` : ""}</figure>`).join("")}</div></section>`,
        ctaBand(p, pg, "See it in person.")].join("\n");
    },
    team(p, pg) {
      return [hero(p, pg, { eyebrowText: "Team", h1: `Meet the <em>people</em>`, imgId: 1, small: true }), crumbsHtml(p, pg),
        `<section class="team wrap"><div class="team-grid" data-reveal="stagger">${p.team.map(t => `<article class="member" data-tilt>${t.image ? imgTag(p, pg, t.image, { sizes: "300px", alt: t.name }) : ""}<h2>${esc(t.name)}</h2><p class="role">${esc(t.role)}</p>${t.bio ? paras(t.bio) : ""}</article>`).join("")}</div></section>`,
        ctaBand(p, pg, "Come say hello.")].join("\n");
    },
    financing(p, pg) {
      const f = p.financing, opts = f.options || [];
      const faqs = parseFaqs(f.faqs);
      return [hero(p, pg, { eyebrowText: "Financing", h1: `Care that fits your <em>budget</em>`, lead: esc(f.intro.split(/\n/)[0]), imgId: 7, small: true }), crumbsHtml(p, pg),
        `<section class="wrap prose narrow" data-reveal>${paras(f.intro)}</section>`,
        opts.length ? `<section class="wrap fin-opts"><h2 data-split>Payment options</h2><div class="fin-grid" data-reveal="stagger">${opts.map(o => `<article class="fin-card" data-spotlight><h3>${esc(o.name)}</h3><p>${esc(o.desc)}</p>${o.link ? `<a href="${attr(o.link)}" target="_blank" rel="noopener">Learn more →</a>` : ""}</article>`).join("")}</div></section>` : "",
        faqSection(faqs, "Financing questions"), ctaBand(p, pg, "Let’s talk about options.")].join("\n");
    },
    insurance(p, pg) {
      return [hero(p, pg, { eyebrowText: "Insurance", h1: `Insurance & <em>coverage</em>`, imgId: 8, small: true }), crumbsHtml(p, pg), `<section class="wrap prose narrow" data-reveal>${paras(p.extras.insuranceText)}</section>`, ctaBand(p, pg, "Questions about coverage? Call us.")].join("\n");
    },
    faq(p, pg) {
      const all = [...p.faqs, ...p.services.flatMap(s => parseFaqs(s.faqs))];
      return [hero(p, pg, { eyebrowText: "FAQ", h1: `Your questions, <em>answered</em>`, imgId: 8, small: true }), crumbsHtml(p, pg), faqSection(all, "Everything people ask us"), ctaBand(p, pg, "Still have a question?")].join("\n");
    },
    blog(p, pg) {
      return [hero(p, pg, { eyebrowText: "Blog", h1: `Resources & <em>insights</em>`, imgId: 9, small: true }), crumbsHtml(p, pg),
        `<section class="wrap post-list" data-reveal="stagger">${p.posts.map((x, i) => `<a class="post-card" data-tilt href="${pg.rel}blog/${x.slug}/">${x.image ? imgTag(p, pg, x.image, { sizes: "400px", alt: "" }) : ""}<time datetime="${attr(x.date || "")}">${esc(x.date || "")}</time><h2>${esc(x.title)}</h2><p>${esc(x.excerpt || String(x.body || "").slice(0, 150))}</p></a>`).join("")}</section>`,
        ctaBand(p, pg, "Want advice tailored to you?")].join("\n");
    },
    post(p, pg) {
      const x = pg.post;
      return [hero(p, pg, { eyebrowText: x.date || "Article", h1: esc(x.title), imgId: x.image || 9, small: true }), crumbsHtml(p, pg), `<article class="wrap prose narrow" data-reveal>${paras(x.body)}</article>`, ctaBand(p, pg, "Ready to take the next step?")].join("\n");
    },
    custom(p, pg) {
      const x = pg.custom;
      return [hero(p, pg, { h1: esc(x.title), imgId: x.image || 10, small: true }), crumbsHtml(p, pg), `<section class="wrap prose narrow" data-reveal>${paras(x.body)}</section>`, ctaBand(p, pg, "We’re here to help.")].join("\n");
    },
    careers(p, pg) {
      return [hero(p, pg, { eyebrowText: "Careers", h1: `Join the <em>team</em>`, imgId: 1, small: true }), crumbsHtml(p, pg), `<section class="wrap prose narrow" data-reveal>${paras(p.extras.careersText)}</section>`, `<section class="wrap form-sec"><h2 data-split>Apply</h2>${form(p, pg, "careers")}</section>`].join("\n");
    },
    appointment(p, pg) {
      return [hero(p, pg, { eyebrowText: "Book", h1: `Request an <em>appointment</em>`, lead: "Tell us what you need and when works best. We confirm every request personally.", imgId: 2, small: true }), crumbsHtml(p, pg),
        `<section class="wrap form-sec"><div class="form-cols"><div data-reveal>${form(p, pg, "appointment")}</div><aside data-reveal class="form-aside">${p.business.booking ? `<div class="aside-card" data-spotlight><h3>Prefer to book instantly?</h3><a class="btn btn-primary" data-magnetic href="${attr(p.business.booking)}" target="_blank" rel="noopener">Open online booking</a></div>` : ""}<div class="aside-card"><h3>What happens next</h3><ol><li>We receive your request.</li><li>We call or email to confirm a time.</li><li>You get a reminder before your visit.</li></ol>${p.business.phone ? `<p>In a hurry? <a href="${telHref(p.business.phone)}">${esc(p.business.phone)}</a></p>` : ""}</div></aside></div></section>`,
        faqSection(p.faqs.slice(0, 4))].join("\n");
    },
    contact(p, pg) {
      return [hero(p, pg, { eyebrowText: "Contact", h1: `Let’s <em>talk</em>`, lead: `We’re happy to answer questions by phone, email or in person at our ${esc(p.business.address.city)} office.`, imgId: 3, small: true }), crumbsHtml(p, pg), contactBlock(p, pg), `<section class="wrap form-sec"><h2 data-split>Send a message</h2><div class="form-cols"><div data-reveal>${form(p, pg, "contact")}</div><aside class="form-aside" data-reveal><div class="aside-card" data-spotlight><h3>Prefer to book?</h3><p>Skip the message and request an appointment directly.</p><a class="btn btn-primary" data-magnetic href="${pg.rel}appointment/">Request Appointment</a></div></aside></div></section>`].join("\n");
    },
    thanks(p, pg) { return `<section class="hero hero-sm" data-scroll><div class="hero-bg">${imgTag(p, pg, 0, { sizes: "100vw", eager: true, alt: "" })}</div><div class="hero-inner"><h1 data-split>Thank you — we’ve received it.</h1><p class="lead" data-reveal>Expect to hear from us within one business day.${p.business.phone ? ` Need us sooner? Call <a href="${telHref(p.business.phone)}">${esc(p.business.phone)}</a>.` : ""}</p><div class="btn-row" data-reveal><a class="btn btn-primary" data-magnetic href="${pg.rel}">Back to home</a></div></div></section>`; },
    "404"(p, pg) { return `<section class="hero hero-sm" data-scroll><div class="hero-bg">${imgTag(p, pg, 0, { sizes: "100vw", eager: true, alt: "" })}</div><div class="hero-inner"><p class="eyebrow">404</p><h1 data-split>That page moved on.</h1><p class="lead" data-reveal>Try the menu, or start with one of these.</p><div class="btn-row" data-reveal><a class="btn btn-primary" data-magnetic href="${pg.rel}">Home</a><a class="btn btn-ghost" href="${pg.rel}services/">Services</a><a class="btn btn-ghost" href="${pg.rel}contact/">Contact</a></div></div></section>`; },
    privacy(p, pg) { return legal(p, pg, "Privacy Policy", privacyText(p)); },
    terms(p, pg) { return legal(p, pg, "Terms of Use", termsText(p)); },
    accessibility(p, pg) { return legal(p, pg, "Accessibility Statement", a11yText(p)); },
    sitemap(p, pg, pages) {
      const groups = {};
      pages.filter(x => !x.nositemap && !x.noindex).forEach(x => { const g = x.url.split("/")[0] || "home"; (groups[g] = groups[g] || []).push(x); });
      return [`<section class="hero hero-sm" data-scroll><div class="hero-bg">${imgTag(p, pg, 0, { sizes: "100vw", eager: true, alt: "" })}</div><div class="hero-inner"><h1 data-split>Site map</h1></div></section>`, crumbsHtml(p, pg),
        `<section class="wrap sitemap-sec"><div class="sitemap-grid" data-reveal="stagger">${Object.entries(groups).map(([g, xs]) => `<div><h2>${esc(g.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()))}</h2><ul>${xs.map(x => `<li><a href="${pg.rel}${x.url}">${esc(x.title.split("|")[0].trim())}</a></li>`).join("")}</ul></div>`).join("")}</div></section>`].join("\n");
    },
  };
  function legal(p, pg, title, html) {
    return [`<section class="hero hero-sm hero-plain" data-scroll><div class="hero-inner"><p class="eyebrow">Legal</p><h1 data-split>${esc(title)}</h1><p class="lead">Last updated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p></div></section>`, crumbsHtml(p, pg), `<section class="wrap prose narrow" data-reveal>${html}</section>`].join("\n");
  }
  function privacyText(p) {
    const n = esc(p.business.name), e = esc(p.business.email || "the contact details on our contact page");
    return `<p>${n} (“we”, “us”) respects your privacy. This policy explains what information we collect through this website and how we use it.</p>
<h2>Information we collect</h2><p>When you submit a contact or appointment form we receive the details you enter, such as your name, phone number, email address and message. Our hosting and form providers may also collect standard technical data such as IP address and browser type.</p>
<h2>How we use it</h2><p>We use your information only to respond to your request, schedule appointments and communicate with you about our services. We do not sell your personal information.</p>
<h2>Analytics and cookies</h2><p>${p.seo.gaId ? "We use Google Analytics to understand how visitors use this site. You can opt out with the Google Analytics opt-out browser add-on." : "This site does not use tracking cookies beyond those strictly necessary for it to function."}</p>
<h2>Third-party services</h2><p>Forms, maps and embedded content may be provided by third parties with their own privacy policies.</p>
<h2>Your choices</h2><p>You may request access to, correction of, or deletion of your personal information by contacting ${e}.</p>
<h2>Contact</h2><p>Questions about this policy can be sent to ${e}.</p>`;
  }
  function termsText(p) {
    const n = esc(p.business.name);
    return `<p>By using this website you agree to these terms. If you do not agree, please do not use the site.</p>
<h2>Information, not advice</h2><p>Content on this site is provided for general information about ${n} and its services. It is not a substitute for a consultation. Submitting a form does not create a client relationship until we confirm your appointment.</p>
<h2>Intellectual property</h2><p>Text, images, logos and design on this site belong to ${n} or their respective owners and may not be reproduced without permission.</p>
<h2>Accuracy</h2><p>We work to keep information current, but services, hours and pricing may change. Please confirm details when you contact us.</p>
<h2>Limitation of liability</h2><p>To the extent permitted by law, ${n} is not liable for any damages arising from use of this website.</p>
<h2>Changes</h2><p>We may update these terms at any time by posting a revised version here.</p>`;
  }
  function a11yText(p) {
    const n = esc(p.business.name), e = esc(p.business.email || p.business.phone || "our contact page");
    return `<p>${n} is committed to making this website usable by everyone, including people with disabilities. We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA.</p>
<h2>What we’ve done</h2><ul><li>Semantic headings, landmarks and a skip link</li><li>Keyboard access for every menu, button and form</li><li>Visible focus states and sufficient color contrast</li><li>Descriptive alternative text for meaningful images</li><li>Respect for reduced-motion preferences</li><li>Layouts that work on phones from 360px wide</li></ul>
<h2>Feedback</h2><p>If you have trouble using any part of this site, please contact us at ${e}. We will do our best to help and to fix the problem.</p>`;
  }

  /* ---------- meta description per page ---------- */
  function describe(p, pg) {
    const b = p.business, city = b.address.city;
    const tail = b.phone ? ` Call ${b.phone} or request an appointment online.` : " Request an appointment online.";
    const cut = (s, n = 155) => s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : s;
    switch (pg.kind) {
      case "home": return cut(`${b.name}: ${primaryKeyword(p).toLowerCase()} in ${city}, ${b.address.state}. ${b.tagline || b.description.split(/\n/)[0]}${tail}`);
      case "service": return cut(`${pg.service.name} in ${city}, ${b.address.state} at ${b.name}. ${pg.service.short}${tail}`);
      case "service-area": return cut(`${pg.service.name} for ${pg.area.name}, ${pg.area.state || b.address.state}. ${b.name} is nearby in ${city}. ${pg.service.short}${tail}`);
      case "area": return cut(`${b.name} serves ${pg.area.name} with ${p.services.slice(0, 3).map(s => s.name.toLowerCase()).join(", ")} and more.${tail}`);
      case "financing": return cut(`Payment plans and financing options at ${b.name} in ${city}. ${p.financing.intro.split(/\n/)[0]}`);
      case "appointment": return cut(`Request an appointment with ${b.name} in ${city}. Choose a service and preferred time; we confirm personally.`);
      case "contact": return cut(`Contact ${b.name} in ${city}, ${b.address.state}: address, hours, phone and directions.${tail}`);
      case "post": return cut(pg.post.excerpt || String(pg.post.body || "").split(/\n/)[0]);
      default: return cut(`${pg.title.split("|")[0].trim()} — ${b.name}, ${city}, ${b.address.state}.${tail}`);
    }
  }

  /* ---------- assemble one page ---------- */
  function renderPage(p, pg, pages, css, js) {
    pg.description = describe(p, pg);
    const base = (p.seo.siteUrl || "").replace(/\/+$/, "");
    const canonical = base ? `<link rel="canonical" href="${base}/${pg.url}">` : "";
    const body = bodies[pg.kind](p, pg, pages);
    const faqs = pg.kind === "faq" ? [...p.faqs, ...p.services.flatMap(s => parseFaqs(s.faqs))]
      : pg.kind === "home" ? p.faqs.slice(0, 6) : (pg.kind === "service" || pg.kind === "service-area") ? (parseFaqs(pg.service.faqs).length ? parseFaqs(pg.service.faqs) : p.faqs.slice(0, 4)) : pg.kind === "financing" ? parseFaqs(p.financing.faqs) : [];
    const extra = [faqSchema(faqs)];
    if (pg.kind === "service" || pg.kind === "service-area") extra.push({ "@type": "Service", name: pg.service.name, description: pg.service.short, provider: { "@id": base + "/#business" }, areaServed: pg.area ? { "@type": "City", name: pg.area.name } : undefined, url: base + "/" + pg.url });
    if (pg.kind === "post") extra.push({ "@type": "BlogPosting", headline: pg.post.title, datePublished: pg.post.date || undefined, author: { "@id": base + "/#business" }, url: base + "/" + pg.url });
    const og = p.images[0] ? `${base}/assets/img/${p.images[0].id}.jpg` : "";
    const fonts = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(p.brand.fontDisplay).replace(/%20/g, "+")}:ital,wght@0,400;0,600;0,700;1,400&family=${encodeURIComponent(p.brand.fontBody).replace(/%20/g, "+")}:wght@400;500;600&display=swap`;
    const ga = p.seo.gaId ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${attr(p.seo.gaId)}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${attr(p.seo.gaId)}');</script>` : "";
    return `<!DOCTYPE html>
<html lang="en" data-theme="${p.brand.theme}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(pg.title)}</title>
<meta name="description" content="${attr(pg.description)}">
${pg.noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">'}
${canonical}
<meta property="og:type" content="website"><meta property="og:site_name" content="${attr(p.business.name)}"><meta property="og:title" content="${attr(pg.title)}"><meta property="og:description" content="${attr(pg.description)}">${og ? `<meta property="og:image" content="${attr(og)}">` : ""}${base ? `<meta property="og:url" content="${base}/${pg.url}">` : ""}
<meta name="twitter:card" content="summary_large_image">
<meta name="geo.region" content="${attr(p.business.address.country || "US")}-${attr(p.business.address.state)}"><meta name="geo.placename" content="${attr(p.business.address.city)}">${p.business.lat && p.business.lng ? `<meta name="geo.position" content="${attr(p.business.lat)};${attr(p.business.lng)}"><meta name="ICBM" content="${attr(p.business.lat)}, ${attr(p.business.lng)}">` : ""}
${p.seo.googleVerification ? `<meta name="google-site-verification" content="${attr(p.seo.googleVerification)}">` : ""}${p.seo.bingVerification ? `<meta name="msvalidate.01" content="${attr(p.seo.bingVerification)}">` : ""}
<meta name="theme-color" content="${attr(p.brand.primary)}">
<link rel="icon" href="${pg.rel}assets/favicon.svg" type="image/svg+xml">${p.brand.logo ? `<link rel="apple-touch-icon" href="${pg.rel}assets/logo.${p.brand.logoExt || "png"}">` : ""}
<link rel="manifest" href="${pg.rel}manifest.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fonts}">
<link rel="stylesheet" href="${pg.rel}assets/site.css">
${schema(p, pg, extra)}
${ga}
</head>
<body class="page-${pg.kind}">
${header(p, pg, pages)}
<main id="main"><span id="main-content"></span>
${body}
</main>
${footer(p, pg, pages)}
<script src="${pg.rel}assets/site.js" defer></script>
</body>
</html>`;
  }

  /* ---------- site-wide files ---------- */
  function sitemapXml(p, pages) {
    const base = (p.seo.siteUrl || "https://example.com").replace(/\/+$/, "");
    const today = new Date().toISOString().slice(0, 10);
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.filter(x => !x.nositemap && !x.noindex).map(x => `  <url><loc>${base}/${x.url}</loc><lastmod>${x.date || today}</lastmod><priority>${x.priority || "0.5"}</priority></url>`).join("\n")}\n</urlset>\n`;
  }
  function robots(p) {
    const base = (p.seo.siteUrl || "").replace(/\/+$/, "");
    return `User-agent: *\nAllow: /\nDisallow: /thank-you/\n\n# AI crawlers welcome to read our public content\nUser-agent: GPTBot\nAllow: /\nUser-agent: ClaudeBot\nAllow: /\nUser-agent: PerplexityBot\nAllow: /\nUser-agent: Google-Extended\nAllow: /\n\n${base ? `Sitemap: ${base}/sitemap.xml\n` : ""}`;
  }
  function llmsTxt(p, pages) {
    const b = p.business, base = (p.seo.siteUrl || "").replace(/\/+$/, "");
    const l = (x) => `- [${x.title.split("|")[0].trim()}](${base}/${x.url}): ${x.description || ""}`;
    return `# ${b.name}\n\n> ${b.tagline || b.description.split(/\n/)[0]}\n\n${b.name} is a ${b.category.replace(/([A-Z])/g, " $1").trim().toLowerCase()} located at ${[b.address.street, b.address.city, b.address.state, b.address.zip].filter(Boolean).join(", ")}.${b.phone ? ` Phone: ${b.phone}.` : ""}${b.email ? ` Email: ${b.email}.` : ""}\n\n${b.description}\n\n## Services\n${pages.filter(x => x.kind === "service").map(l).join("\n")}\n\n## Service areas\n${pages.filter(x => x.kind === "area").map(l).join("\n")}\n\n## Key pages\n${pages.filter(x => ["about", "financing", "faq", "reviews", "appointment", "contact"].includes(x.kind)).map(l).join("\n")}\n\n## Facts\n${(b.hours || []).filter(h => h.days).map(h => `- Hours ${h.days}: ${h.open && h.close ? h.open + "–" + h.close : "Closed"}`).join("\n")}\n${p.faqs.map(f => `- Q: ${f.q} A: ${f.a}`).join("\n")}\n`;
  }
  function manifest(p) {
    return JSON.stringify({ name: p.business.name, short_name: p.business.name.slice(0, 12), start_url: "./", display: "standalone", background_color: p.brand.paper, theme_color: p.brand.primary, icons: p.brand.logo ? [{ src: "assets/logo." + (p.brand.logoExt || "png"), sizes: "512x512", type: "image/" + (p.brand.logoExt === "svg" ? "svg+xml" : "png") }] : [] }, null, 2);
  }
  function favicon(p) {
    const letter = (p.business.name || "A").trim()[0].toUpperCase();
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${p.brand.primary}"/><text x="32" y="43" font-family="Georgia,serif" font-size="36" font-weight="700" text-anchor="middle" fill="#fff">${esc(letter)}</text></svg>`;
  }

  /* ---------- site CSS (design system) ---------- */
  function siteCss(p, runtimeCss) {
    const b = p.brand;
    const dark = b.theme === "dark";
    const paper = dark ? "#0f1214" : b.paper, ink = dark ? "#f3efe8" : b.ink;
    return `${runtimeCss}
:root{--primary:${b.primary};--accent:${b.accent};--ink:${ink};--paper:${paper};--paper-2:${dark ? "#171b1e" : "color-mix(in srgb,var(--paper) 92%,var(--ink))"};--line:color-mix(in srgb,var(--ink) 14%,transparent);--muted:color-mix(in srgb,var(--ink) 62%,transparent);--radius:${b.radius}px;--font-d:"${b.fontDisplay}",Georgia,serif;--font-b:"${b.fontBody}",system-ui,sans-serif;--wrap:1240px;--ease:cubic-bezier(.16,1,.3,1);--cursor-color:#fff;--cursor-label-bg:var(--accent);--cursor-label-ink:#111;--spotlight-color:color-mix(in srgb,var(--accent) 28%,transparent);--scrub-dim:.18;color-scheme:${dark ? "dark" : "light"}}
*,*::before,*::after{box-sizing:border-box}
html{font-size:clamp(15px,.9vw + 11px,18px)}
body{margin:0;background:var(--paper);color:var(--ink);font:400 1rem/1.6 var(--font-b);-webkit-font-smoothing:antialiased;overflow-x:clip}
h1,h2,h3{font-family:var(--font-d);font-weight:600;line-height:1.05;letter-spacing:-.02em;margin:0 0 .5em}
h1{font-size:clamp(2.4rem,6.5vw,5.6rem)}h2{font-size:clamp(1.9rem,3.8vw,3.3rem)}h3{font-size:1.35rem}
h1 em,h2 em{font-style:italic;color:var(--accent)}
p{margin:0 0 1em}a{color:inherit}
:focus-visible{outline:3px solid var(--accent);outline-offset:3px;border-radius:4px}
.wrap{width:min(var(--wrap),calc(100% - 2rem));margin-inline:auto}.narrow{max-width:760px}
section{padding-block:clamp(3.5rem,8vw,7.5rem)}
.eyebrow{font:600 .78rem/1 var(--font-b);letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin:0 0 1.2rem}
.lead{font-size:clamp(1.05rem,1.4vw,1.3rem);max-width:60ch;color:var(--muted)}
.ph{aspect-ratio:3/2;background:linear-gradient(135deg,var(--paper-2),var(--line));border-radius:var(--radius)}
.btn{display:inline-flex;align-items:center;gap:.5rem;padding:.95rem 1.6rem;border-radius:999px;font:600 .95rem/1 var(--font-b);text-decoration:none;border:1px solid transparent;cursor:pointer;transition:background .3s,color .3s,border-color .3s,box-shadow .3s}
.btn-primary{background:var(--primary);color:#fff;box-shadow:0 10px 30px -12px var(--primary)}.btn-primary:hover{background:color-mix(in srgb,var(--primary) 85%,#000)}
.btn-ghost{background:transparent;color:inherit;border-color:currentColor}.btn-ghost:hover{background:color-mix(in srgb,currentColor 10%,transparent)}
.btn-light{background:#fff;color:#111}.btn-light:hover{background:var(--accent)}
.btn-outline{border-color:var(--ink);color:var(--ink)}.btn-outline:hover{background:var(--ink);color:var(--paper)}
.btn-row{display:flex;flex-wrap:wrap;gap:.8rem;align-items:center}
.link-arrow{font-weight:600;text-decoration:none;border-bottom:1px solid var(--accent)}.link-arrow:hover{color:var(--accent)}
/* header */
.site-header{position:fixed;inset:0 0 auto;z-index:100;color:#fff}
.site-header.is-scrolled{color:var(--ink)}.site-header.is-scrolled .hdr-inner{background:color-mix(in srgb,var(--paper) 86%,transparent);backdrop-filter:blur(14px);box-shadow:0 1px 0 var(--line)}
.hdr-inner{display:flex;align-items:center;justify-content:space-between;gap:1.5rem;padding:.9rem clamp(1rem,3vw,2.5rem);transition:background .4s,box-shadow .4s}
.brand{display:flex;align-items:center;text-decoration:none}.brand-logo{height:44px;width:auto;object-fit:contain}
.site-header:not(.is-scrolled) .brand-logo{filter:brightness(0) invert(1)}
.wordmark{font:600 1.4rem/1 var(--font-d);letter-spacing:-.02em}
.nav-desktop{display:none;align-items:center;gap:1.6rem;font-weight:500;font-size:.95rem}.has-menu>a{display:inline-block}.nav-desktop a{text-decoration:none;position:relative;padding:.3rem 0}.nav-desktop a::after{content:"";position:absolute;left:0;right:100%;bottom:0;height:2px;background:var(--accent);transition:right .4s var(--ease)}.nav-desktop a:hover::after,.nav-desktop a[aria-current]::after{right:0}
.has-menu{position:relative}.has-menu .menu{position:absolute;top:100%;left:-1rem;min-width:260px;margin:0;padding:.6rem;list-style:none;background:var(--paper);color:var(--ink);border-radius:14px;box-shadow:0 30px 60px -20px rgba(0,0,0,.35);opacity:0;transform:translateY(8px);pointer-events:none;transition:.3s var(--ease)}.has-menu:hover .menu,.has-menu:focus-within .menu{opacity:1;transform:none;pointer-events:auto}.has-menu .menu a{display:block;padding:.55rem .8rem;border-radius:8px}.has-menu .menu a:hover{background:var(--paper-2)}.has-menu .menu a::after{display:none}
.hdr-actions{display:flex;align-items:center;gap:1rem}.hdr-tel{display:none;text-decoration:none;font-weight:600}.hdr-actions .btn{display:none}
.nav-toggle{width:44px;height:44px;border:0;background:transparent;display:grid;place-items:center;gap:6px;cursor:pointer;color:inherit}.nav-toggle span{width:26px;height:2px;background:currentColor;transition:.35s var(--ease)}
html.nav-open .nav-toggle span:first-child{transform:translateY(4px) rotate(45deg)}html.nav-open .nav-toggle span:last-child{transform:translateY(-4px) rotate(-45deg)}
.progress{height:2px;background:var(--accent);margin-top:-2px}
.nav-overlay{position:fixed;inset:0;background:var(--primary);color:#fff;padding:6rem 2rem 3rem;display:flex;flex-direction:column;justify-content:space-between;opacity:0;visibility:hidden;transition:.45s var(--ease);z-index:-1}
html.nav-open .nav-overlay{opacity:1;visibility:visible}html.nav-open .site-header{color:#fff}html.nav-open .hdr-inner{background:transparent!important;box-shadow:none!important}html.nav-open .brand-logo{filter:brightness(0) invert(1)!important}
.nav-mobile{display:flex;flex-direction:column;gap:.3rem}.nav-mobile a{font:600 clamp(1.6rem,6vw,2.6rem)/1.25 var(--font-d);text-decoration:none;transform:translateY(20px);opacity:0;transition:.6s var(--ease)}html.nav-open .nav-mobile a{opacity:1;transform:none}.nav-mobile a:nth-child(n){transition-delay:calc(var(--n,0)*1ms)}
.nav-overlay-meta a{color:#fff;font-weight:600}.nav-overlay-meta p{opacity:.8;margin:.3rem 0}
@media(min-width:1000px){.nav-desktop{display:flex}.nav-toggle{display:none}.hdr-tel,.hdr-actions .btn{display:inline-flex}.nav-overlay{display:none}}
.sticky-cta{position:fixed;left:.75rem;right:.75rem;bottom:calc(.75rem + env(safe-area-inset-bottom,0px));z-index:90;display:flex;background:var(--ink);color:var(--paper);border-radius:999px;padding:.35rem;box-shadow:0 20px 40px -15px rgba(0,0,0,.5)}.sticky-cta a{flex:1;text-align:center;padding:.8rem;text-decoration:none;font-weight:600;border-radius:999px}.sticky-cta .primary{background:var(--accent);color:#111}
/* hero */
.hero{position:relative;min-height:100svh;display:grid;align-items:end;padding:8rem 0 5rem;color:#fff;overflow:hidden;isolation:isolate}
.hero-sm{min-height:62svh;padding-top:9rem}
.hero-bg{position:absolute;inset:0;z-index:-1;overflow:hidden}.hero-bg img{width:100%;height:100%;object-fit:cover;transform:scale(calc(1 + var(--exit,0)*.12))}
.hero-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,.15) 40%,rgba(0,0,0,.78))}
.hero-plain{color:var(--ink);background:var(--paper-2);min-height:40svh}
.hero-inner{width:min(var(--wrap),calc(100% - 2rem));margin-inline:auto;transform:translateY(calc(var(--exit,0)*-60px));opacity:calc(1 - var(--exit,0)*1.5)}
.hero .lead{color:rgba(255,255,255,.86)}.hero-plain .lead{color:var(--muted)}.hero .btn-row{margin-top:1.5rem}.hero-meta{margin-top:1.5rem;font-size:.9rem;opacity:.85}
.hero-sm h1{font-size:clamp(2.2rem,5.4vw,4.4rem)}
/* crumbs */
.crumbs{width:min(var(--wrap),calc(100% - 2rem));margin:1.2rem auto -2rem;font-size:.85rem;color:var(--muted)}.crumbs ol{list-style:none;display:flex;flex-wrap:wrap;gap:.4rem;padding:0;margin:0}.crumbs li+li::before{content:"/";margin-right:.4rem;opacity:.5}.crumbs a{text-decoration:none}
/* manifesto + stats */
.manifesto{text-align:center}.scrub{font:400 clamp(1.4rem,3vw,2.5rem)/1.3 var(--font-d);max-width:28ch;margin-inline:auto;letter-spacing:-.01em}
.stats{padding-block:0}.stats ul{list-style:none;margin:0;padding:2.5rem 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1.5rem;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}.stats strong{display:block;font:600 clamp(2.4rem,5vw,4rem)/1 var(--font-d);color:var(--primary)}.stats span{color:var(--muted);font-size:.9rem}
/* services */
.svc-card{position:relative;display:flex;flex-direction:column;gap:.6rem;padding:1.2rem;background:var(--paper-2);border-radius:var(--radius);text-decoration:none;overflow:hidden;transition:box-shadow .5s var(--ease)}.svc-card:hover{box-shadow:0 30px 60px -30px rgba(0,0,0,.4)}
.svc-media{aspect-ratio:4/3;border-radius:calc(var(--radius) - 6px);overflow:hidden}.svc-media img{width:100%;height:100%;object-fit:cover;transition:transform 1.2s var(--ease)}.svc-card:hover .svc-media img{transform:scale(1.06)}
.svc-card .num{font:600 .75rem/1 var(--font-b);letter-spacing:.15em;color:var(--accent)}.svc-card h3{margin:0}.svc-card p{color:var(--muted);margin:0;font-size:.95rem}.svc-card .arrow{position:absolute;right:1.2rem;top:1.2rem;width:40px;height:40px;display:grid;place-items:center;border-radius:50%;background:var(--paper);transition:.4s var(--ease)}.svc-card:hover .arrow{background:var(--accent);transform:rotate(-45deg)}
.svc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.4rem}
.hscroll{position:relative}.hscroll-track{padding:1rem clamp(1rem,4vw,4rem) 2rem}.hscroll-track>*{width:min(78vw,420px)}.hscroll-bar{height:3px;background:var(--accent);margin:0 clamp(1rem,4vw,4rem)}
/* split / process / hover list */
.split{display:grid;gap:2.5rem;align-items:center}@media(min-width:900px){.split{grid-template-columns:1.1fr 1fr;gap:5rem}}.split-media img{width:100%;border-radius:var(--radius);aspect-ratio:4/5;object-fit:cover}
.stack{list-style:none;padding:0;margin:0;display:grid;gap:1.2rem}.stack li{position:sticky;top:calc(var(--header-h,80px) + 1rem);background:var(--primary);color:#fff;padding:2.5rem;border-radius:var(--radius);min-height:260px}.stack li:nth-child(2){top:calc(var(--header-h,80px) + 2.5rem);background:color-mix(in srgb,var(--primary) 80%,#000)}.stack li:nth-child(3){top:calc(var(--header-h,80px) + 4rem);background:color-mix(in srgb,var(--primary) 60%,#000)}.stack span{color:var(--accent);font-weight:600;letter-spacing:.15em}.stack h3{font-size:1.9rem;margin:.4rem 0}
.hover-list ul{list-style:none;margin:0;padding:0}.hover-list li{border-top:1px solid var(--line)}.hover-list li:last-child{border-bottom:1px solid var(--line)}.hover-list a{display:flex;align-items:baseline;justify-content:space-between;gap:2rem;padding:1.4rem 0;text-decoration:none;transition:padding .4s var(--ease)}.hover-list a:hover{padding-left:1rem;color:var(--primary)}.hover-list a span{font:600 clamp(1.4rem,3vw,2.4rem)/1.1 var(--font-d)}.hover-list a small{color:var(--muted);text-align:right;max-width:40ch}
/* reviews */
.reviews{background:var(--ink);color:var(--paper);overflow:hidden}.reviews .eyebrow{color:var(--accent)}
.carousel{padding-left:max(1rem,calc((100% - var(--wrap))/2 + 1rem))}.carousel-track{padding-right:2rem}
.review{margin:0;width:min(82vw,460px);padding:2rem;border-radius:var(--radius);background:color-mix(in srgb,var(--paper) 7%,transparent);border:1px solid color-mix(in srgb,var(--paper) 14%,transparent)}.review blockquote{margin:1rem 0;font:400 1.15rem/1.5 var(--font-d)}.review figcaption{font-weight:600}.review figcaption span{font-weight:400;opacity:.6}.stars{color:var(--accent);letter-spacing:.1em}
.carousel-ctl{display:flex;align-items:center;gap:1rem;margin-top:1.5rem}.carousel-ctl button{width:48px;height:48px;border-radius:50%;border:1px solid currentColor;background:transparent;color:inherit;cursor:pointer;font-size:1.1rem}.carousel-ctl span{font-variant-numeric:tabular-nums;opacity:.7}
.review-wall .review{width:auto;background:var(--paper-2);border-color:var(--line)}.masonry{columns:1;column-gap:1.4rem}.masonry .review{break-inside:avoid;margin-bottom:1.4rem}@media(min-width:700px){.masonry{columns:2}}@media(min-width:1100px){.masonry{columns:3}}
/* gallery */
.gallery-strip{overflow:hidden}.marquee figure{margin:0;width:min(60vw,380px);aspect-ratio:4/3;border-radius:var(--radius);overflow:hidden}.marquee img{width:100%;height:100%;object-fit:cover}
.gal-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem}.gal-grid figure{margin:0;border-radius:var(--radius);overflow:hidden;background:var(--paper-2)}.gal-grid img{width:100%;aspect-ratio:4/3;object-fit:cover}.gal-grid figcaption{padding:.6rem .9rem;font-size:.85rem;color:var(--muted)}
/* areas, chips, faq */
.chip-list{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:.6rem}.chip-list a{display:inline-block;padding:.6rem 1.1rem;border:1px solid var(--line);border-radius:999px;text-decoration:none;transition:.3s}.chip-list a:hover{background:var(--primary);color:#fff;border-color:var(--primary)}
.area-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1.2rem}.area-card{display:block;padding:1.8rem;background:var(--paper-2);border-radius:var(--radius);text-decoration:none}.area-card h2{font-size:1.5rem;margin:0 0 .3rem}.area-card p{color:var(--muted);margin:0 0 1rem}.area-card span{color:var(--accent);font-size:1.4rem}
.faq-list{border-top:1px solid var(--line)}.faq-item{border-bottom:1px solid var(--line)}.faq-item summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:1.3rem 0;font:600 1.15rem/1.3 var(--font-d)}.faq-item summary::-webkit-details-marker{display:none}.faq-item summary i{width:28px;height:28px;flex:none;border-radius:50%;border:1px solid currentColor;position:relative;transition:.4s var(--ease)}.faq-item summary i::before,.faq-item summary i::after{content:"";position:absolute;inset:50% auto auto 50%;width:12px;height:1.5px;background:currentColor;transform:translate(-50%,-50%)}.faq-item summary i::after{transform:translate(-50%,-50%) rotate(90deg)}.faq-item[open] summary i{transform:rotate(45deg);background:var(--accent);color:#111}.faq-a{padding:0 0 1.4rem;color:var(--muted);max-width:70ch}
/* cta band */
.cta-band{background:var(--primary);color:#fff;text-align:center}.cta-band h2{max-width:20ch;margin-inline:auto}.cta-band .btn-row{justify-content:center;margin-top:1.5rem}
.note-band{padding-block:1rem}.note-band p{padding:1.2rem 1.5rem;background:var(--paper-2);border-left:4px solid var(--accent);border-radius:8px}
/* contact */
.contact-grid{display:grid;gap:2.5rem}@media(min-width:900px){.contact-grid{grid-template-columns:1fr 1fr;gap:5rem}}.contact-block address{font-style:normal;font-size:1.15rem;margin:1rem 0}.big-link{font:600 clamp(1.4rem,3vw,2.2rem)/1.1 var(--font-d);text-decoration:none}.big-link:hover{color:var(--primary)}
.hours{width:100%;border-collapse:collapse;margin-bottom:1.5rem}.hours th{text-align:left;font-weight:500;padding:.6rem 0;border-bottom:1px solid var(--line)}.hours td{text-align:right;padding:.6rem 0;border-bottom:1px solid var(--line);font-variant-numeric:tabular-nums}
.map-wrap{aspect-ratio:4/3;border-radius:var(--radius);overflow:hidden;background:var(--paper-2)}.map-wrap iframe{width:100%;height:100%;border:0}
.open-status{font-weight:600;color:var(--primary)}
/* forms */
.form-cols{display:grid;gap:2.5rem}@media(min-width:900px){.form-cols{grid-template-columns:1.4fr 1fr;gap:4rem}}
.form label{display:block;font-weight:500;margin-bottom:1rem}.form label.inline{display:flex;gap:.6rem;align-items:flex-start;font-weight:400}.form input:not([type=checkbox]):not([type=radio]),.form select,.form textarea{display:block;width:100%;margin-top:.35rem;padding:.85rem 1rem;border:1px solid var(--line);border-radius:10px;background:var(--paper);color:inherit;font:inherit}.form input:focus,.form textarea:focus,.form select:focus{border-color:var(--primary);outline:none;box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 25%,transparent)}.form .row2{display:grid;gap:0 1rem}@media(min-width:600px){.form .row2{grid-template-columns:1fr 1fr}}.form fieldset{border:0;padding:0;margin:0 0 1rem;display:flex;flex-wrap:wrap;gap:1rem}.form legend{font-weight:500;margin-bottom:.4rem}.form .hp{position:absolute;left:-9999px}.form-note{font-size:.85rem;color:var(--muted);margin-top:1rem}.consent{font-size:.9rem}
.aside-card{padding:1.8rem;border-radius:var(--radius);background:var(--paper-2);margin-bottom:1.2rem}.aside-card h3{margin-top:0}.aside-card .btn{width:100%;justify-content:center;margin:.5rem 0}.aside-tel{display:block;text-align:center;font-weight:600;text-decoration:none}.aside-links ul{list-style:none;padding:0;margin:0}.aside-links li{border-top:1px solid var(--line)}.aside-links a{display:block;padding:.7rem 0;text-decoration:none}.aside-links a:hover{color:var(--primary)}
/* service detail */
.svc-cols{display:grid;gap:3rem}@media(min-width:960px){.svc-cols{grid-template-columns:1.6fr 1fr;gap:5rem}}.svc-aside{position:sticky;top:calc(var(--header-h,80px) + 1rem);align-self:start}
.prose{max-width:70ch}.prose h2{font-size:1.9rem;margin-top:2rem}.prose p{font-size:1.05rem}.checks{list-style:none;padding:0;margin:0 0 1.5rem;display:grid;gap:.6rem}.checks li{padding-left:1.8rem;position:relative}.checks li::before{content:"✓";position:absolute;left:0;color:var(--accent);font-weight:700}.price{font-size:1.2rem}.area-note{padding:1rem 1.2rem;background:var(--paper-2);border-radius:10px;font-size:.95rem}
/* team, financing, blog, sitemap */
.team-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1.5rem}.member{padding:1.2rem;background:var(--paper-2);border-radius:var(--radius)}.member img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:calc(var(--radius) - 6px);margin-bottom:1rem}.member h2,.member h3{font-size:1.3rem;margin:0}.member .role{color:var(--accent);font-weight:600;font-size:.9rem}
.fin-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1.4rem}.fin-card{padding:2rem;border-radius:var(--radius);background:var(--ink);color:var(--paper)}.fin-card h3{margin-top:0}.fin-card a{color:var(--accent);font-weight:600;text-decoration:none}
.post-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.5rem}.post-card{display:block;padding:1.5rem;background:var(--paper-2);border-radius:var(--radius);text-decoration:none}.post-card img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:10px;margin-bottom:1rem}.post-card time{font-size:.8rem;color:var(--muted)}.post-card h2{font-size:1.4rem;margin:.3rem 0}.post-card p{color:var(--muted);margin:0}
.sitemap-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:2rem}.sitemap-grid h2{font-size:1.2rem}.sitemap-grid ul{list-style:none;padding:0;margin:0}.sitemap-grid a{display:block;padding:.3rem 0;text-decoration:none}
/* footer */
.site-footer{background:var(--ink);color:var(--paper);padding-top:1px}.ft-cta{text-align:center;padding:clamp(4rem,10vw,8rem) 1rem;background:var(--primary);color:#fff}.ft-cta .btn-row{justify-content:center;margin-top:1.5rem}
.ft-grid{width:min(var(--wrap),calc(100% - 2rem));margin:0 auto;padding:4rem 0 3rem;display:grid;gap:2.5rem;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}.ft-brand{grid-column:1/-1}@media(min-width:900px){.ft-brand{grid-column:auto;grid-row:auto}.ft-grid{grid-template-columns:1.6fr 1fr 1fr 1fr}}
.ft-logo{height:40px;width:auto;filter:brightness(0) invert(1);margin-bottom:1rem}.ft-brand address{font-style:normal;margin:.5rem 0}.ft-brand a{color:inherit}.social{display:flex;flex-wrap:wrap;gap:1rem;margin-top:1rem}.social a{opacity:.75;text-decoration:none}.social a:hover{opacity:1;color:var(--accent)}
.ft-col h3{font:600 .8rem/1 var(--font-b);letter-spacing:.15em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem}.ft-col ul{list-style:none;padding:0;margin:0}.ft-col li{margin-bottom:.5rem}.ft-col a{text-decoration:none;opacity:.8}.ft-col a:hover{opacity:1}
.ft-legal{width:min(var(--wrap),calc(100% - 2rem));margin:0 auto;padding:1.5rem 0 calc(1.5rem + 70px);display:flex;flex-wrap:wrap;justify-content:space-between;gap:1rem;font-size:.85rem;opacity:.7;border-top:1px solid color-mix(in srgb,var(--paper) 15%,transparent)}.ft-legal a{text-decoration:none}@media(min-width:900px){.ft-legal{padding-bottom:1.5rem}}
@media(prefers-reduced-motion:reduce){.hero-bg img,.hero-inner{transform:none!important;opacity:1!important}.svc-media img{transition:none}}
${fxCss(p)}
`;
  }
  function fxCss(p) {
    const f = p.brand.fx || {}, st = p.brand.style, out = [];
    out.push(`@property --beam{syntax:"<angle>";inherits:false;initial-value:0deg}`);
    if (f.mesh) out.push(`.mesh{position:absolute;inset:-20%;z-index:-1;pointer-events:none;filter:blur(70px) saturate(1.3);opacity:.75;mix-blend-mode:screen}.mesh i{position:absolute;border-radius:50%;width:55vmax;height:55vmax;animation:mesh 18s ease-in-out infinite alternate}.mesh i:nth-child(1){left:-10%;top:10%;background:var(--primary)}.mesh i:nth-child(2){right:-15%;top:-10%;background:var(--accent);animation-duration:23s}.mesh i:nth-child(3){left:30%;bottom:-25%;background:color-mix(in srgb,var(--primary) 60%,#fff);animation-duration:27s}@keyframes mesh{to{transform:translate(12%,8%) scale(1.15) rotate(20deg)}}.hero-bg::after{background:linear-gradient(180deg,rgba(0,0,0,.4),rgba(0,0,0,.2) 40%,rgba(0,0,0,.8))}`);
    if (f.grain) out.push(`.hero::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;opacity:.12;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}`);
    if (f.shimmer) out.push(`.btn-primary{position:relative;overflow:hidden;isolation:isolate}.btn-primary::before{content:"";position:absolute;inset:-150%;z-index:-1;background:conic-gradient(from var(--beam),transparent 0 70%,var(--accent) 80%,transparent 90%);animation:beam 3.2s linear infinite;opacity:.9}.btn-primary::after{content:"";position:absolute;inset:1.5px;z-index:-1;border-radius:inherit;background:var(--primary)}.btn-primary:hover::after{background:color-mix(in srgb,var(--primary) 85%,#000)}@keyframes beam{to{--beam:360deg}}`);
    if (f.beam) out.push(`.svc-card,.aside-card,.fin-card,.area-card,.post-card,.member,.bento-cell{position:relative;isolation:isolate}.svc-card::after,.aside-card::after,.fin-card::after,.area-card::after,.post-card::after,.member::after,.bento-cell::after{content:"";position:absolute;inset:0;border-radius:inherit;padding:1.5px;z-index:-1;background:conic-gradient(from var(--beam),transparent 0 80%,var(--accent) 92%,transparent 100%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:0;transition:opacity .5s}.svc-card:hover::after,.aside-card:hover::after,.fin-card:hover::after,.area-card:hover::after,.post-card:hover::after,.member:hover::after,.bento-cell:hover::after{opacity:1;animation:beam 2.4s linear infinite}`);
    if (f.chips) out.push(`.chips{position:absolute;right:clamp(1rem,5vw,6rem);top:50%;display:none;flex-direction:column;gap:.9rem;z-index:2}@media(min-width:1000px){.chips{display:flex}}.chip{display:inline-flex;gap:.5rem;align-items:center;padding:.7rem 1rem;border-radius:999px;background:rgba(255,255,255,.12);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.25);color:#fff;font-size:.85rem;text-decoration:none;box-shadow:0 20px 50px -20px rgba(0,0,0,.6);animation:float 6s ease-in-out infinite}.chip b{font-weight:700}.chip-b{animation-delay:-2s;margin-left:2.5rem}.chip-c{animation-delay:-4s;margin-left:1rem}.chip-d{animation-delay:-1s;margin-left:3rem}@keyframes float{50%{transform:translateY(-10px)}}`);
    out.push(`.scroll-cue{position:absolute;left:50%;bottom:1.6rem;width:26px;height:42px;margin-left:-13px;border:2px solid rgba(255,255,255,.5);border-radius:14px;z-index:2}.scroll-cue span{position:absolute;left:50%;top:7px;width:4px;height:8px;margin-left:-2px;border-radius:2px;background:#fff;animation:cue 1.8s ease-in-out infinite}@keyframes cue{50%{transform:translateY(14px);opacity:.3}}`);
    if (f.ticker) out.push(`.ticker{padding:1.1rem 0;background:var(--ink);color:var(--paper);--marquee-gap:0;font:500 1.05rem var(--font-d)}.ticker span{display:inline-flex;align-items:center;gap:1.5rem;padding:0 .75rem}.ticker em{font-style:italic}.ticker i{color:var(--accent);font-style:normal;font-size:.8rem}`);
    if (f.glass) out.push(`.site-header.is-scrolled .hdr-inner{background:color-mix(in srgb,var(--paper) 62%,transparent);backdrop-filter:blur(22px) saturate(1.5);-webkit-backdrop-filter:blur(22px) saturate(1.5)}`);
    if (f.blur) out.push(`.js [data-split] .w>span{filter:blur(10px);opacity:0;transition:transform 1.1s cubic-bezier(.16,1,.3,1),filter .9s,opacity .6s;transition-delay:calc(var(--i,0)*55ms + var(--delay,0ms))}.js [data-split].is-in .w>span{filter:blur(0);opacity:1}h1 em,h2 em,h1 em .w>span,h2 em .w>span{background:linear-gradient(100deg,var(--accent),color-mix(in srgb,var(--accent) 55%,#fff),var(--accent));background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:sheen 5s linear infinite}@keyframes sheen{to{background-position:200% 0}}`);
    if (f.shine) out.push(`.svc-media,.gal-grid figure,.split-media>div,.bento-img{position:relative;overflow:hidden}.svc-media::after,.gal-grid figure::after,.split-media>div::after,.bento-img::after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,.35) 50%,transparent 65%);transform:translateX(-120%);transition:transform 1.1s var(--ease);pointer-events:none}.svc-card:hover .svc-media::after,.gal-grid figure:hover::after,.split-media:hover>div::after,.bento-img:hover::after{transform:translateX(120%)}`);
    if (f.dots) out.push(`.cta-band,.ft-cta{position:relative;overflow:hidden}.cta-band::after,.ft-cta::after{content:"";position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(rgba(255,255,255,.22) 1px,transparent 1.5px);background-size:22px 22px;mask-image:radial-gradient(ellipse at center,#000 20%,transparent 75%);opacity:.6}.cta-band .wrap,.ft-cta>*{position:relative;z-index:1}`);
    if (f.transitions) out.push(`@view-transition{navigation:auto}::view-transition-old(root){animation:vt-out .35s ease forwards}::view-transition-new(root){animation:vt-in .55s cubic-bezier(.16,1,.3,1) forwards}@keyframes vt-out{to{opacity:0;transform:scale(.985)}}@keyframes vt-in{from{opacity:0;transform:translateY(14px)}}`);
    if (f.bento) out.push(`.bento-grid{display:grid;gap:1rem;grid-template-columns:repeat(2,1fr);grid-auto-rows:minmax(150px,auto)}@media(min-width:900px){.bento-grid{grid-template-columns:repeat(4,1fr)}.bento-big{grid-column:span 2;grid-row:span 2}.bento-img{grid-row:span 2}.bento-cta{grid-column:span 2}}.bento-cell{display:flex;flex-direction:column;gap:.4rem;justify-content:flex-end;padding:1.6rem;border-radius:var(--radius);background:var(--paper-2);overflow:hidden}.bento-cell strong{font:600 1.3rem/1.15 var(--font-d)}.bento-cell>span{color:var(--muted);font-size:.9rem}.bento-cell a:not(.btn){color:var(--primary);font-weight:600;text-decoration:none}.bento-big{background:var(--ink);color:var(--paper);justify-content:center}.bento-big h3{font-size:clamp(1.5rem,2.6vw,2.3rem);margin:.2rem 0 .6rem}.bento-big p{color:color-mix(in srgb,var(--paper) 75%,transparent)}.bento-big .link-arrow{border-color:var(--accent);color:var(--accent)}.bento-stat strong{font-size:clamp(3rem,6vw,4.6rem);color:var(--primary)}.bento-stat .stars{color:var(--accent);font-style:normal}.bento-open{position:relative}.pulse{position:absolute;top:1.3rem;right:1.3rem;width:10px;height:10px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 0 rgba(34,197,94,.6);animation:pulse 2s infinite}@keyframes pulse{70%{box-shadow:0 0 0 12px rgba(34,197,94,0)}100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}}.bento-img{padding:0}.bento-img img{width:100%;height:100%;object-fit:cover}.bento-cta{background:var(--primary);color:#fff;align-items:flex-start}.bento-cta>span{color:rgba(255,255,255,.8)}.bento-cta .btn{margin-top:.6rem;background:#fff;color:#111}.bento-cta .btn::after{background:#fff}.bento-cta .btn:hover::after{background:var(--accent)}`);
    if (st === "snazzy") out.push(`.hero{background:#0b0e12}h1{letter-spacing:-.035em;font-weight:700}.svc-card{background:color-mix(in srgb,var(--paper-2) 70%,var(--paper))}.site-header .btn-primary{box-shadow:0 0 0 1px rgba(255,255,255,.15),0 10px 40px -10px var(--accent)}.reviews{background:radial-gradient(900px 500px at 10% 0%,color-mix(in srgb,var(--primary) 45%,var(--ink)),var(--ink) 60%)}.stats strong{background:linear-gradient(90deg,var(--primary),var(--accent));-webkit-background-clip:text;background-clip:text;color:transparent}`);
    if (st === "minimal") out.push(`.mesh,.chips,.ticker,.scroll-cue{display:none!important}.btn-primary::before{display:none}h1 em,h2 em{animation:none;background:none;color:var(--accent);-webkit-text-fill-color:var(--accent)}`);
    out.push(`@media(prefers-reduced-motion:reduce){.mesh i,.chip,.scroll-cue span,.btn-primary::before,.pulse,h1 em,h2 em,.ticker>*{animation:none!important}.js [data-split] .w>span{filter:none!important}::view-transition-old(root),::view-transition-new(root){animation:none!important}}`);
    return out.join("\n");
  }

  /* ---------- the build ---------- */
  function build(project, runtime) {
    const p = normalize(project);
    const pages = plan(p);
    const files = {};
    pages.forEach(pg => { pg.description = describe(p, pg); });
    pages.forEach(pg => { files[pg.path] = renderPage(p, pg, pages); });
    files["assets/site.css"] = siteCss(p, runtime.css || "");
    files["assets/site.js"] = (runtime.js || "") + "\n/* form UX */\ndocument.querySelectorAll('[data-form]').forEach(f=>{f.addEventListener('submit',()=>{const b=f.querySelector('button[type=submit]');if(b){b.disabled=true;b.textContent='Sending…'}})});\n";
    files["assets/favicon.svg"] = favicon(p);
    files["sitemap.xml"] = sitemapXml(p, pages);
    files["robots.txt"] = robots(p);
    files["llms.txt"] = llmsTxt(p, pages);
    files["manifest.webmanifest"] = manifest(p);
    files[".nojekyll"] = "";
    files["CNAME"] = p.seo.customDomain ? p.seo.customDomain : undefined;
    if (!p.seo.customDomain) delete files["CNAME"];
    files["README.md"] = `# ${p.business.name} — website\n\nGenerated with Premium Site Builder Pro. ${pages.length} pages, static HTML. Upload this folder to GitHub Pages, Netlify, Vercel or any host.\n`;
    return { project: p, pages, files };
  }

  const api = { build, plan, normalize, slug, parseFaqs, DEFAULT };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.PSB = api;
})(typeof window !== "undefined" ? window : globalThis);
