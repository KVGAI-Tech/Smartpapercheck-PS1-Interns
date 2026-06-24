# Smart Paper Check — Frontend (Landing Page Redesign Guide)

This is the **frontend** of Smart Paper Check, built with **Vite + React 18 + Tailwind CSS + Framer Motion**.

> 📌 **For the redesign task:** You only need this folder. The **landing page is fully self-contained and does NOT require the backend** to run, view, or redesign. You will not be given the backend, and you don't need it.

---

## 1. Quick Start

```bash
# 1. Install dependencies
yarn install        # or: npm install

# 2. Start the dev server
yarn dev            # or: npm run dev

# 3. Open in your browser
http://localhost:5173
```

The **landing page is what loads at `/`** (the home route, shown when no user is logged in). No login or backend is needed to see it.

> If `yarn install` shows an error from a `postinstall` / PDF-viewer setup step, you can ignore it — it relates to the exam dashboard, **not** the landing page.

---

## 2. Your Task — Redesign the Landing Page

You are redesigning the **entire landing page**. Everything you need lives in just two places:

| What | Where |
|------|-------|
| The page that assembles all sections | `src/components/LandingPage.jsx` |
| The individual section components | `src/components/LandingPage/` |

You can redesign each section **independently** — they are modular and don't depend on each other.

### Section map (`src/components/LandingPage/`)

These render top-to-bottom in this order (see `LandingPage.jsx`):

| Order | File | What it is |
|-------|------|------------|
| 1 | `Navbar.jsx` | Top navigation bar + mobile menu |
| 2 | `Hero.jsx` | Main hero section (headline + demo video) |
| 3 | `SmartEvaluationSystem.jsx` | Intro / value section |
| 4 | `Clientele.jsx` | Logos of universities / clients |
| 5 | `LandingHighlights.jsx` | Key highlights strip |
| 6 | `DepartmentAnalytics.jsx` | Analytics showcase (largest section) |
| 7 | `ComparisonMetrics.jsx` | Before/after comparison + charts |
| 8 | `Testimonials.jsx` | Customer testimonials |
| 9 | `VideoDemo.jsx` | Product demo video block |
| 10 | `Features.jsx` | Feature grid (uses images from `public/images/landing/`) |
| 11 | `USP.jsx` | Unique selling points |
| 12 | `Insights.jsx` | Insights / data section |
| 13 | `Pricing.jsx` | Pricing plans |
| 14 | `FAQ.jsx` | Frequently asked questions |
| 15 | `ContactForm.jsx` | "Get in touch" form |
| 16 | `Footer.jsx` | Footer |

Other helpers in the folder: `Feedbacks.jsx`, `Glow.jsx` (visual effects).

> **Tip:** Start by changing one section (e.g. `Hero.jsx`), save, and watch it hot-reload in the browser. Then move section by section.

---

## 3. Styling & Theming

- **Tailwind CSS** is used for all styling — config is in `tailwind.config.js`.
- **Framer Motion** powers the animations (the `motion.div`, `whileInView`, etc.).
- The **brand/accent color** is a CSS variable in `src/index.css`:

  ```css
  --accent-color: #166D70;   /* teal — change this to re-theme the whole site */
  --accent-rgb: 22 109 112;
  ```

  In Tailwind classes this color is used as `accent` (e.g. `bg-accent`, `text-accent`, `border-accent`). Change the variable above to re-theme everything at once.

- **Images** live in `public/` and `public/images/landing/` (e.g. `analytics.jpeg`, `feedback.jpeg`, `vlmGrading.jpeg`). Reference them with absolute paths like `/images/landing/analytics.jpeg`. To add your own, drop files into `public/` and reference them with a leading `/`.

---

## 4. Things to Know (so you don't get confused)

1. **3-second loading animation on first load** — the landing page intentionally shows a "Smart Paper Check" loading animation for ~3 seconds before appearing. This is set in `LandingPage.jsx` (`setTimeout(... 3000)`). It's **not a bug**. Feel free to shorten it while developing.

2. **The Contact form does not send anywhere** — it just shows a "Thank you" message via a timer (`ContactForm.jsx`). There's no backend submit, so don't worry about wiring it up.

3. **The demo video** in `Hero.jsx` loads from `/api/public/landing-video`. Since you don't have the backend, **this one video won't load** — that's expected. Everything else works fully. You can swap it for a local/placeholder video during the redesign.

4. **"Get Started" buttons** just navigate to `/auth` (the login page). Leave that behavior as-is unless told otherwise.

5. **Don't split out only the `LandingPage/` folder** — the components rely on shared setup (Tailwind config, `index.css`, Framer Motion, icons). Keep the whole `smartqna-fe` folder together.

6. **Ignore the rest of the codebase** — folders like `src/components/Dashboard/`, exam/grading screens, etc., are the logged-in product and are **not** part of this task.

---

## 5. Useful Commands

```bash
yarn dev        # start dev server with hot reload
yarn build      # production build (output in dist/)
yarn preview    # preview the production build locally
yarn lint       # run ESLint
```

---

## 6. Project Structure (high level)

```
smartqna-fe/
├─ public/                  # static assets (images, logos, fonts)
│  └─ images/landing/       # landing page section images
├─ src/
│  ├─ main.jsx              # app entry point
│  ├─ App.jsx               # routes (landing page is the "/" route)
│  ├─ index.css             # global styles + theme variables (accent color)
│  └─ components/
│     ├─ LandingPage.jsx        # ← assembles the landing page
│     └─ LandingPage/           # ← all landing page sections (YOUR WORK)
├─ tailwind.config.js       # Tailwind theme config
├─ vite.config.js           # Vite config
└─ package.json
```

**Focus your work on `src/components/LandingPage.jsx` and everything inside `src/components/LandingPage/`.**
