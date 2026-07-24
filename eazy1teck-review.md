# Eazy1teck — Code & Product Review

*Prepared by Claude · 24 July 2026 · based on the source in `Documents/EAZY1TECK Ref`*

## What Eazy1teck is

Eazy1teck is a mobile-first electronics storefront for the Kigali market — phones, laptops, watches, audio and accessories, with RWF pricing and a "browse → add to cart → order on WhatsApp" flow rather than online payment. It's built as a **React 19 + Vite single-page app** with a small **serverless API** (`api/`, Vercel-style functions, also runnable locally via an Express dev server) backed by **MongoDB**. There's a hidden admin panel at `/e1t-secure-panel` for managing the catalog and store settings.

The code is genuinely solid in shape: clean, readable, consistently structured components; a sensible API layer with shared helpers; graceful image fallbacks; and thoughtful UX for the local market (WhatsApp-first ordering is exactly right here). Every file parses and transforms cleanly, and there's no `dangerouslySetInnerHTML` anywhere, so React's escaping protects you from stored cross-site-scripting through product fields. Good foundation.

The issues below are mostly about **security and go-to-market readiness**, not structure. I've ordered them by how much they matter. The security items in particular I'd treat as blockers before promoting this widely.

---

## Critical — fix before you push this further

**1. Customer passwords are stored in plain text.**
In `api/auth/signup.js` the raw password is written straight to MongoDB (`password: payload.password`), and `api/auth/signin.js` checks it with a direct string compare (`user.password !== password`). If your database is ever exposed — a leaked connection string, a misconfigured cluster, a backup — every customer's password is readable, and people reuse passwords across sites. This should be hashed with **bcrypt or argon2** (hash on signup, compare the hash on signin). It's a small change with a big payoff.

**2. The default admin email and PIN ship inside the public JavaScript bundle.**
`src/lib/localStore.js` defines `defaultAdminSettings = { email: 'admin@eazy1teck.com', pin: '0788', … }`, and that file is imported by client-side code (`App.jsx`). That means anyone who opens your site's JS in the browser can read the default admin login. If the PIN was never changed in the database, the admin panel is wide open. Move admin defaults to **server-only code / environment variables**, never the client, and change the live PIN immediately.

**3. The admin "PIN" is 4 digits with no rate limiting.**
`/api/admin/login` accepts unlimited attempts, and a 4-digit PIN is only 10,000 combinations — a script guesses it in seconds. The admin panel controls your entire catalog and pricing. Use a **longer passphrase**, and add **rate limiting / lockout** on the login endpoint (and ideally on customer signin too).

**4. No `.gitignore`, and `.env` files with your MongoDB credentials sit in the project root.**
The folder has `.env` and `.env.local` (which normally hold the `MONGODB_URI` and secrets) but **no `.gitignore`**, plus a `.git` repo and a committed-looking `dist/`. If you've run `git add .` and pushed to GitHub, your database connection string is now public. Action: add a `.gitignore` (ignoring `.env*`, `node_modules`, `dist`, `*.log`), confirm `.env` isn't tracked (`git ls-files | grep env`), and if it was ever pushed, **rotate the MongoDB password** — don't just delete the file, the history keeps it.

**5. Session tokens live in `localStorage` and never expire.**
Both user and admin tokens are kept in `localStorage` (readable by any script that runs on the page, so an XSS bug becomes a full account/admin takeover), and the `sessions` / `adminSessions` collections have no expiry — a token, once issued or stolen, works forever. Prefer **httpOnly cookies** for session tokens, and add a **TTL** (Mongo TTL index or an `expiresAt` check) so sessions age out.

---

## High — correctness and data robustness

**Uploaded images are stored as base64 data URLs inside the product document.** In the admin editor, `fileToDataUrl` inlines each image as a giant string saved on the product record. MongoDB documents cap at 16MB, and a few gallery photos will bloat documents, API responses, and the `localStorage` copy fast. Use an image host (Cloudinary, S3, Vercel Blob) and store **URLs** instead of raw image data.

**Gallery upload replaces instead of appends.** `handleExtraImagesUpload` sets `extraImages` to just the newly selected files, so re-uploading drops the previous gallery. Merge with the existing array.

**The catalog is cached in `localStorage` and can go stale.** Products are read from `localStorage` first (the built-in 52) and only then overwritten by the server fetch. If the API is unreachable, shoppers keep seeing the old cached catalog — including **old prices** — with only a small error banner. Consider treating the server as the source of truth and showing a clearer loading/failed state rather than silently serving stale pricing.

**A single product is special-cased in code.** `normalizeProductImages` in `App.jsx` hardcodes Unsplash image URLs for the product id `airpods-pro-2nd-gen`. That's a brittle patch that belongs in the product data, not the render path.

**Admin category assignment is heuristic.** `getCategoryForProduct` guesses a product's admin bucket from string matching, "Add category" always files new categories under `Accessories`, and the sidebar "Accessories" maps only to `speakers`. It works for the seeded data but will misfile things as the catalog grows. A stored `adminCategoryId` on each product would be sturdier.

---

## Medium — SEO, performance, accessibility

**SEO and link previews are the biggest growth gap.** The site is fully client-rendered — I confirmed this externally: a plain fetch of `eazy1teck.com` returns only the generic homepage title and meta description, with no product content. Two consequences: search engines index every product page with the *same* title/description, and — importantly for you — when someone shares a product link on **WhatsApp or Facebook, the preview shows the generic homepage text and no product image**, every time. For a store that runs on WhatsApp sharing, that's a real loss. Fixes, roughly in order of value: add **per-page titles and Open Graph / Twitter meta tags** (via `react-helmet-async`), add **JSON-LD `Product` structured data** (price, availability, image) so Google can show rich results, and consider **pre-rendering or SSR** for product pages (Vercel supports this well).

**Missing favicon.** `index.html` links `/favicon.svg`, but `public/` contains only a `products/` folder — so the favicon 404s. Add the file or fix the path.

**No `robots.txt` or `sitemap.xml`** in `public/`, which weakens crawlability. A generated sitemap of product URLs would help indexing.

**`vercel.json` carries unused rules.** It sets headers for `.mp4` / `.m4a` / `.weba` files that don't exist in the project, and — more notably — sets **no security headers** for your HTML (no Content-Security-Policy, `X-Content-Type-Options`, `X-Frame-Options`, or HSTS). Adding those is a quick, high-value hardening step.

**One 6,100-line CSS file (~109KB) ships on every route.** `src/index.css` is a single monolith loaded everywhere. It works, but it's hard to maintain and not code-split. Splitting per area (or CSS modules) would help both maintainability and load.

**Two icon libraries.** Both `lucide-react` and `react-icons` are dependencies; standardizing on one trims the bundle. (`canvas-confetti` is also listed — worth confirming it's actually used.)

**Accessibility is mostly attended to but has gaps.** Icon-only buttons generally have `aria-label`s (good), and `PRODUCT.md` targets WCAG AA. But the admin "Phone" group button has `aria-expanded="true"` hardcoded regardless of state, and native `window.alert` / `confirm` / `prompt` are used for checkout validation and adding categories — functional, but worth replacing with in-page UI. Contrast I couldn't verify without rendering the live site.

---

## Low — polish

The footer's Privacy, Refund and Terms links point to **`thenewspecies.com`**, an unrelated site — those should be Eazy1teck's own policies. `public/products/` has a duplicate `redmi-watch-5-active` in both `.jpg` and `.png`. Dev artifacts (`dev-server.err.log`, `dev-server.out.log`, `dist/`) are sitting in the working folder and should be ignored by git. And there's no server-side record of orders — checkout is a WhatsApp deep link only, which is fine by design, but means you have no order history in the system if you ever want reporting.

---

## What I'd suggest we tackle first

If you want to work through this together, a sensible order:

1. **Lock down security** — hash passwords, move admin defaults off the client and change the PIN, add a `.gitignore` and rotate DB credentials if `.env` was ever pushed. (Highest risk, mostly small changes.)
2. **Fix the favicon + SEO/OG meta and structured data** — this directly improves how your product links look when shared and how you rank. (Highest growth payoff.)
3. **Move product images to a host and store URLs** — prevents the data-URL bloat problem before your catalog grows.
4. **Then polish** — session expiry, security headers, the footer policy links, CSS cleanup.

Tell me which of these you'd like to start with and I can make the actual code changes and hand them back to you. I'd suggest we begin with the password hashing and the admin-credential fix, since those are quick and close the biggest holes.
