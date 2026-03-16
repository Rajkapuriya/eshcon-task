# 🎨 Page Studio

A schema-driven, WYSIWYG-lite page editor built with **Next.js (App Router)**, **Redux Toolkit**, **Contentful**, and **Vercel**. Authorised users can load, edit, preview, and publish immutable versioned page releases with automated Semantic Versioning.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Section Types](#-section-types)
- [Role-Based Access Control](#-role-based-access-control-rbac)
- [Running Locally](#-running-locally)
- [How the Studio Works](#-how-the-studio-works)
- [Publishing & SemVer](#-publishing--semver)
- [Contentful Integration](#-contentful-integration)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)

---

## 🔍 Overview

Page Studio allows authorised users to:

1. **Load** a page definition from Contentful (or a built-in mock adapter for development)
2. **Edit** it via a lightweight WYSIWYG-lite studio editor
3. **Preview** it as a fully rendered landing page
4. **Publish** it as an immutable, versioned release (stored in Vercel Blob or local filesystem)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| State Management | Redux Toolkit |
| CMS | Contentful (headless) |
| Styling | Tailwind CSS + shadcn/ui |
| Validation | Zod |
| Storage | Vercel Blob (production) / Local FS (dev) |
| Testing | Vitest + Playwright + axe-core (WCAG AAA) |
| CI/CD | GitHub Actions + Vercel |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js App Router                     │
│                                                             │
│  /               → redirects to /preview/welcome-page       │
│  /preview/[slug] → Server component, reads published snap   │
│  /studio/[slug]  → Client editor (Redux powered)            │
│  /api/publish    → POST endpoint (publisher role only)      │
└──────────────────┬──────────────────────────────────────────┘
                   │
     ┌─────────────┴──────────────┐
     │                            │
┌────▼────┐               ┌──────▼──────┐
│Contentful│               │ Vercel Blob │
│ Adapter │               │  Storage   │
└──────────┘               └────────────┘
     │                            │
     └────────────┬───────────────┘
                  │
           ┌──────▼──────┐
           │  Redux Store │
           │  draftPage   │
           │  ui / publish│
           └─────────────┘
```

---

## 📦 Section Types

Each page is composed of ordered **sections**. The following types are supported:

| Type | Description | Key Props |
|---|---|---|
| `hero` | Full-width hero banner | `title`, `subtitle` |
| `featureGrid` | 3-column feature cards | `features[]` (title, description) |
| `testimonial` | Customer quote block | `quote`, `author` |
| `cta` | Call-to-action button | `label`, `url` |

Any unknown section type is gracefully degraded to an `UnsupportedSection` fallback via an `ErrorBoundary`.

---

## 🔐 Role-Based Access Control (RBAC)

Access is enforced at the **Next.js Middleware** level on every request.

| Role | Can View `/preview` | Can Access `/studio` | Can Publish |
|---|---|---|---|
| `viewer` (default) | ✅ | ❌ 403 Forbidden | ❌ |
| `editor` | ✅ | ✅ | ❌ 403 Forbidden |
| `publisher` | ✅ | ✅ | ✅ |

### Setting Your Role (Demo / Development)

Pass a `?role=` query parameter on any URL. The role is then persisted as a cookie for subsequent requests:

```
# Access studio as an editor:
http://localhost:3000/studio/welcome-page?role=editor

# Access studio as a publisher (can deploy):
http://localhost:3000/studio/welcome-page?role=publisher

# View only (default):
http://localhost:3000/preview/welcome-page
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js 20+
- npm 9+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Rajkapuriya/eshcon-task.git
cd eshcon-task

# 2. Install dependencies
npm install

# 3. (Optional) Add environment variables
# Copy .env.example to .env.local and fill in Contentful credentials
# The app works without them using built-in mock data

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it automatically redirects to the Preview page.

---

## 🎬 How the Studio Works

### 1. Open the Studio Editor
Navigate to `/studio/[slug]?role=editor` (or `publisher`).

### 2. Canvas (Left Panel)
- The page renders a live interactive canvas.
- Click any section to **select** it — a blue outline indicates the selected section.
- Use the **↑ / ↓ arrows** to reorder sections.
- Use the **🗑 trash icon** to delete a section.

### 3. Sidebar (Right Panel)
- Once a section is selected, the sidebar shows **editable fields**.
- Edit text fields to make changes — the canvas updates in real time via Redux.
- Use the **"Add Section"** dropdown at the bottom to insert new section types.

### 4. Publishing
- Click the **"Publish"** button in the top-right header (visible to `publisher` role only).
- A diff is calculated between the current draft and the last published version.
- A new **immutable JSON snapshot** is saved with an auto-bumped SemVer version.
- The preview page instantly reflects the newly published content.

---

## 📌 Publishing & SemVer

Every publish automatically computes a **Semantic Version bump** based on what changed:

| Change Type | Version Bump | Example |
|---|---|---|
| Text / prop update | **Patch** | `1.0.0` → `1.0.1` |
| Section added | **Minor** | `1.0.1` → `1.1.0` |
| Section removed or type changed | **Major** | `1.1.0` → `2.0.0` |
| No changes detected | None | Returns existing version |

Published snapshots are stored as immutable JSON files (e.g., `releases/welcome-page/2.0.0.json`) and never overwritten.

---

## 📡 Contentful Integration

The app fetches pages from Contentful if credentials are configured. Without them, it **automatically falls back to built-in mock data** — fully functional for development and demos.

### Contentful Content Model (Page type)
Your Contentful `page` content type should have:
- `slug` (Short text)
- `title` (Short text)
- `sections` (References, Many) — each linked entry uses its Content Type ID as the section `type`

---

## 🌍 Deployment

### Step 1 — Push to GitHub
```bash
git remote add origin https://github.com/Rajkapuriya/eshcon-task.git
git branch -M main
git push -u origin main
```
> Note: Your PAT must have the `workflow` scope to push `.github/workflows/` files.

### Step 2 — Set Up Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New → Project** → Import your GitHub repo
2. Go to **Storage** tab → Create a **Vercel Blob** database → Connect to your project
3. Go to **Settings → Environment Variables** and add:

| Variable | Description |
|---|---|
| `BLOB_READ_WRITE_TOKEN` | Auto-injected when you connect Vercel Blob |
| `CONTENTFUL_SPACE_ID` | Your Contentful Space ID (optional) |
| `CONTENTFUL_DELIVERY_TOKEN` | Delivery API token (optional) |
| `CONTENTFUL_PREVIEW_TOKEN` | Preview API token for drafts (optional) |

4. Click **Deploy** — Vercel auto-deploys on every push to `main`.

---

## ✅ Testing

### Unit Tests (Vitest)
```bash
npm run test
```
Tests schema validation and SemVer diff logic.

### E2E + Accessibility Tests (Playwright + axe-core)
```bash
npx playwright install   # First time only
npx playwright test
```
Tests include:
- Preview page rendering
- Studio editor interactions
- WCAG 2.2 AAA accessibility scans
- Accessibility report saved to `a11y-report.json`

### CI/CD (GitHub Actions)
Every push to `main` and every Pull Request automatically:
1. Runs unit tests
2. Installs Playwright browsers and runs E2E tests
3. Uploads `a11y-report.json` as a CI artifact

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `BLOB_READ_WRITE_TOKEN` | Production only | Auto-injected by Vercel Blob |
| `CONTENTFUL_SPACE_ID` | Optional | Contentful Space ID |
| `CONTENTFUL_DELIVERY_TOKEN` | Optional | Contentful Delivery API token |
| `CONTENTFUL_PREVIEW_TOKEN` | Optional | Contentful Preview API token |

---

## 📁 Project Structure

```
eshcon-task/
├── .github/
│   └── workflows/ci.yml        # GitHub Actions CI pipeline
├── __tests__/
│   ├── schema.test.ts           # Zod schema unit tests
│   └── semver.test.ts           # SemVer diff unit tests
├── releases/                    # Local published JSON snapshots
├── src/
│   ├── app/
│   │   ├── page.tsx             # Root → redirects to /preview/welcome-page
│   │   ├── preview/[slug]/      # Server-rendered page preview
│   │   ├── studio/[slug]/       # WYSIWYG-lite editor
│   │   └── api/publish/         # Publish REST endpoint
│   ├── components/
│   │   ├── registry/            # Section registry + ErrorBoundary
│   │   │   └── sections/        # Hero, FeatureGrid, Testimonial, Cta
│   │   └── studio/              # StudioCanvas + EditorSidebar
│   ├── lib/
│   │   ├── contentful/          # Contentful client + mock adapter
│   │   ├── publish/             # semver.ts + storage.ts (Blob/FS)
│   │   ├── schema/              # Zod page/section schemas
│   │   └── store/               # Redux store + slices
│   └── middleware.ts            # RBAC enforcement (Edge Middleware)
├── tests/e2e/                   # Playwright E2E + accessibility tests
└── vitest.config.ts             # Vitest configuration
```

---

## 📜 License

MIT — feel free to use and adapt for your own projects.
