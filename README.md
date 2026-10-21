# Premium Site Builder Pro

A browser-based generator that turns a guided questionnaire (business facts, logo, 10+ photos, services, service areas, reviews, FAQs, financing, blog) into a complete **50–120 page static website** that is:

- **SEO-optimized** – unique title/meta description per page, canonical URLs, Open Graph, breadcrumbs, `sitemap.xml`, `robots.txt`, one `<h1>` per page with keyword + city, internal linking between services ↔ areas ↔ FAQs.
- **GEO-optimized** (local/geographic) – `LocalBusiness` schema with address, geo coordinates, hours, `areaServed`; `geo.*`/ICBM meta; a page for every service area and for every service × area combination.
- **AEO-optimized** (answer engines / AI search) – `FAQPage` + `Service` + `BlogPosting` JSON-LD, direct-answer meta descriptions, and an `llms.txt` file that AI crawlers (GPTBot, ClaudeBot, PerplexityBot…) can read.
- **Style presets & effects** – Snazzy / Editorial / Minimal, with toggles for gradient-mesh hero, film grain, shimmer buttons, border-beam cards, bento grid, floating chips, service ticker, glass header, blur-in headlines with gradient italics, photo shine sweep, dot-grid bands and page transitions (all disabled automatically under reduced-motion).
- **Fast & premium** – no frameworks, inline design system, responsive images (1600/800 px), lazy loading, Google Fonts only; and the interaction engine from the Premium Site Builder skill: split-word headlines, scroll-scrub manifesto, pinned sideways service scroller, stacking process cards, hover photo reveal, magnetic buttons, tilt cards, spotlight, review carousel, lightbox gallery, scroll-speed marquee, "Open now" status, custom cursor, sticky mobile CTA.
- **Accessible** – skip link, landmarks, visible focus, alt text, reduced-motion fallbacks, works at 360 px.

Everything runs in the browser. No server. Nothing leaves your machine until you choose to download the zip or push to GitHub.

---

## 1. Put the builder on GitHub (one time)

1. Create a new repository on GitHub, e.g. `premium-site-builder` (public is fine; private also works with GitHub Pages on paid plans).
2. Unzip this package and upload **all** of its files to the repository root (drag-and-drop in the GitHub web UI → *Add file → Upload files*), or:
   ```bash
   git init && git add . && git commit -m "Premium Site Builder Pro"
   git branch -M main
   git remote add origin https://github.com/YOUR-USER/premium-site-builder.git
   git push -u origin main
   ```
3. In the repository go to **Settings → Pages** and set *Source* to **GitHub Actions** (the included workflow `.github/workflows/deploy.yml` publishes automatically).  
   Alternative: set *Source* to **Deploy from a branch → main → / (root)**.
4. After ~1 minute the builder is live at `https://YOUR-USER.github.io/premium-site-builder/`.

> You can also just open `index.html` locally – but Chrome blocks `fetch()` of local files, so use a tiny server (`python3 -m http.server`) or the GitHub Pages URL.

## 2. Generate a client website

1. Open the builder URL and walk through the 8 steps:
   1. **Business** – name, type, description, phone, email, address, Google Maps link / embed, coordinates, hours, social profiles.
   2. **Brand & logo** – upload the logo (click *Pick colors from logo*), choose fonts, theme, radius.
   3. **Photos** – drop at least 10 real photos; write alt text for each. First photo = home hero.
   4. **Services** – one card per service (name, summary, full description, inclusions, FAQs, price-from, photo). *Paste a list* adds many at once.
   5. **Service areas** – cities/neighborhoods. Services × areas = location pages (8 × 10 = 80).
   6. **Content** – reviews (verbatim!), site FAQs, team, financing options, insurance, careers, blog posts, custom pages.
   7. **SEO & forms** – final site URL, keywords, analytics, Search Console, form delivery (Formspree endpoint), optional AI copy-assist with your own Anthropic API key.
   8. **Build & deploy** – checklist, page plan, *Generate website*, preview (desktop/phone), *Download .zip*, or *Publish to GitHub Pages*.
2. Your work autosaves in the browser. Use **Save project** to download a `.zip` (project + images) you can reload later or on another machine.

## 3. Put the generated website live

### Option A – one click from the builder (recommended)
1. Create a GitHub **personal access token** (Settings → Developer settings → Tokens (classic) → `repo` scope).
2. In step 8 enter the token, the repository `owner/name` (it will be created if it doesn't exist) and click **Create / update repo & publish**. The builder uploads every file with the Git Data API, commits, and enables GitHub Pages.
3. The site is live at `https://OWNER.github.io/NAME/` within 1–2 minutes. Set that URL as *Final site URL* in step 7 before building so canonical links, sitemap and schema match.

### Option B – manual
1. Click **Download site .zip**, unzip.
2. Create a repo, upload the unzipped files to the root (including the hidden `.nojekyll`).
3. Settings → Pages → Deploy from a branch → `main` / root.

### Custom domain
Enter it in step 7 (*Custom domain*): a `CNAME` file is written. Then add the DNS records GitHub shows under Settings → Pages.

## 4. After launch (SEO checklist)
- Submit `https://your-site/sitemap.xml` in **Google Search Console** and **Bing Webmaster Tools** (verification codes can be entered in step 7).
- Add the site URL to the **Google Business Profile**.
- Test a service page with Google's **Rich Results Test** – `LocalBusiness`, `FAQPage`, `BreadcrumbList`, `Service` should validate.
- Run **PageSpeed Insights**; images are already resized and lazy-loaded.
- Set up **Formspree** (or Netlify Forms) so contact and appointment requests reach the inbox; test one submission.

## 5. Editing later
Reload the saved project zip in the builder, change anything, rebuild and publish again (the GitHub publish replaces the previous tree). `psb-project.json` is also committed with each site so the project can be restored from the repo.

## Files
```
index.html                 builder UI
app/app.js                 wizard, image processing, AI assist, zip, GitHub publish
app/generator.js           page planner, templates, schema, SEO files, design system
app/site-runtime.js/.css   interaction engine embedded in every generated site
app/styles.css             builder styles
sample-project.json        example project you can load to see everything working
.github/workflows/deploy.yml  publishes the builder itself to GitHub Pages
```

## Honesty rules baked in
Nothing is invented. Reviews, awards, years in business, prices and credentials appear only if you enter them. Stock/atmosphere photos should not be captioned as the real team or premises. The optional AI assist is instructed not to add facts and everything it drafts is marked for your review.
