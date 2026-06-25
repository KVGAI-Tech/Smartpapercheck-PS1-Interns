# Smart Paper Check — Frontend (Landing Page Redesign Guide)

This is the **frontend** of Smart Paper Check, built with **Vite + React 18 + Tailwind CSS + Framer Motion**.

> 📌 **For the redesign task:** You only need this folder. The **landing page is fully self-contained and does NOT require the backend** to run, view, or redesign. You will not be given the backend, and you don't need it.

---

## ⚠️ Contributing — Git Workflow (READ THIS FIRST)

**Never develop on, or push to, `main`.** `main` is the protected, reviewed code. All your work happens on **your own branch**, and changes only reach `main` through a Pull Request that an **admin reviews and merges**.

Follow these steps exactly:

```bash
# 1. Clone the repository (you've been added as a collaborator)
git clone https://github.com/KVGAI-Tech/Smartpapercheck-PS1-Interns.git

# 2. Go into the project folder
cd Smartpapercheck-PS1-Interns

# 3. Make sure your local main is up to date with the latest code
git checkout main
git pull origin main

# 4. Create YOUR OWN branch off main — just use your name
#    e.g. rahul
git checkout -b <your-name>

# 5. Develop locally on YOUR branch. When committing, mention the feature you worked on
git add .
git commit -m "<feature you worked on> — what you changed"

# 6. Push YOUR branch to GitHub (NOT main)
git push -u origin <your-name>
```

Then on GitHub:

7. Open a **Pull Request** from your branch → into `main`.
8. The **admin reviews** your PR. If changes are requested, push more commits to the **same branch** (the PR updates automatically).
9. Once approved, the **admin merges** it into `main`. ✅

**Rules:**
- ✅ Always work on your own branch named after you (e.g. `rahul`).
- ✅ Mention the feature you worked on in your commit messages.
- ✅ Push only your branch; raise a PR for review.
- ❌ Do **not** commit, develop, or push directly to `main`.
- ❌ Do **not** merge your own PR — only an admin merges into `main`.
- 🔄 Before starting new work, run `git checkout main && git pull` so your branch starts from the latest code.

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

> **Backend URL (optional):** The backend URL is **not committed** to this repo. If you need to talk to the backend, copy `.env.example` to `.env` and set `VITE_API_URL` to the value shared privately by the admin. For the landing-page redesign you can skip this.

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

3. **The demo video** in `Hero.jsx` loads from the backend (`${API_BASE_URL}/public/landing-video`). Since the landing-page task doesn't include the backend, **this one video won't load locally** — that's expected. Everything else works fully. Swap it for a local/placeholder video during the redesign: drop a file in `public/` and set `src="/your-video.mp4"`.

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
