# Deploying EcomNivo to Vercel

Everything the site needs to run in production, and the two things it cannot do there yet.

---

## 1. Import the repository

1. Go to <https://vercel.com/new>
2. Import **`calvixlabs7197/Ecomnivo`**
3. Framework preset: **Next.js** — detected automatically. Leave the build command, output directory and install command on their defaults.
4. **Do not deploy yet.** Set the environment variables below first, or the build fails on purpose (see §2).

Production deploys come from `main`. Every other branch gets a preview URL automatically.

---

## 2. Environment variables

### Required — the build fails without this

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` — absolute, **no trailing slash** |

This is deliberately fatal rather than defaulted. Every canonical URL, Open Graph tag and sitemap entry is built from it, so a wrong value silently poisons the site's SEO instead of throwing. Better to fail the build.

**Set it per environment.** On the Production environment use your real domain. On Preview, Vercel exposes `VERCEL_URL`, but it changes per deployment — the simplest correct thing is to point Preview at your production domain too, and accept that preview canonicals refer to production. Do not leave it unset.

### Optional — everything below is inert until set

| Variable | Effect when set |
|---|---|
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | Shows the consent banner. **Nothing loads until a visitor accepts.** Format `G-XXXXXXXXXX`. |
| `NEXT_PUBLIC_AD_CLIENT_ID` | Enables ad slots, also gated behind consent. Format `ca-pub-…`. |

### Deliberately **not** set in production

| Variable | Why to leave it unset |
|---|---|
| `ADMIN_PASSWORD` | See §4 — the admin cannot save on Vercel, and leaving it unset disables the panel entirely rather than shipping a broken one with a login form attached to the internet. |
| `AUTH_SECRET` | Same. Admin is disabled unless **both** are present. |

---

## 3. Before you point a real domain at it

Two things are outstanding and neither is a code problem:

1. **`siteConfig.contactEmail` is `null`.** The privacy policy currently says contact details are not yet published, which is honest but not sufficient once the site is public — a privacy policy has to name a way to reach the data controller. Set it in [`config/site.ts`](../config/site.ts) (or via admin settings locally, then commit `data/settings.json`). One value updates every legal page.
2. **The legal pages have not been reviewed by anyone qualified.** They are specific and accurate about what this site actually does, which beats a template, but that is not the same as review.

Also worth doing before launch: submit `https://your-domain.com/sitemap.xml` to Google Search Console, and re-run Lighthouse against the deployed site — the local numbers were measured on a busy machine and are not representative.

---

## 4. The admin panel in production

**Admin content editing does not work on Vercel, by design of the current storage backend.**

The admin writes to `data/*.json` on disk. Serverless filesystems are read-only, so a save there fails. It fails *gracefully* — the form shows an explanatory message rather than a 500 — but it fails.

### The workflow that does work today

```
edit locally in /admin  →  data/*.json changes  →  commit  →  push  →  Vercel deploys it
```

That is a legitimate file-based CMS workflow, and it has a real advantage: every content change is a reviewable diff with history. `data/` is committable for exactly this reason (only `data/activity.json`, the local audit log, is ignored).

### The workflow that will work

Introducing Supabase replaces `lib/db/repositories.ts` and `lib/auth/*` with database-backed implementations behind the same interface. The schema, RLS policies and the JWT role hook are already written in [`supabase/migrations/`](../supabase/migrations/) and just need applying. At that point admin works in production and `ADMIN_PASSWORD` is replaced by real per-user accounts and roles.

---

## 5. What deploys perfectly well right now

- All 22 calculators — they run entirely in the browser, so they are unaffected by any of the above
- All guides, legal pages, `/about`, `/faq` and search
- The full SEO surface: metadata, canonicals, per-page OG images, sitemap, robots, structured data
- Consent-gated analytics and ad slots, if you set the IDs

The site is a static build of 81 routes. Content added via local admin ships with the next deploy.

---

## 6. If the build fails

| Symptom | Cause |
|---|---|
| `Invalid environment configuration: NEXT_PUBLIC_SITE_URL` | Not set, or not an absolute URL. This is the intended failure. |
| Out-of-memory during static generation | The build worker pool is capped at 2 in [`next.config.ts`](../next.config.ts). Vercel's default builder has ample memory; if you hit this on a constrained runner, lower `experimental.cpus` to 1. |
| Type errors | `npm run build` runs TypeScript. Reproduce locally with `npm run build` — note that `npm run typecheck` alone reads generated route types, so run the build first after adding routes. |
