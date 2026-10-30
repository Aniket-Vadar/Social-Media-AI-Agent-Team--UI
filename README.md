# Socialix — AI Agent Social Media Office (Frontend UI)

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker)](https://www.docker.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-black?style=flat&logo=vercel)](https://vercel.com/)

An AI-powered social media management SaaS where a team of autonomous AI agents (**Master Agent**, **Researcher**, **Creator**, **Scheduler**, and **Analytics**) collaborate in a virtual **"Agent Office"** to research trends, create content, schedule posts, and analyze performance across multiple social platforms.

---

## 🌟 Key Features

- **Virtual Agent Office Canvas**: Interactive isometric office visualization with clickable agent desks showing real-time task statuses, active plans, duration, and file counts.
- **Master Agent Workspace & Chat**:
  - Supervisor chat interface with instant planning and task delegation.
  - Multi-step **Plan Cards** with live progress tracking.
  - Inline post previews with **Approve & Schedule** or **Edit Image** actions.
  - Interactive **E2B Cloud Desktop Sandbox** browser viewer for the Research Agent.
- **Content Library & Management**:
  - Filterable post cards (Scheduled, Drafts, Published, Instagram, TikTok).
  - Contextual post actions: Edit & reschedule, Unschedule, AI Image Editor, and Delete.
  - Slide-out **Post Detail Drawer** with full copy, hashtags, and engagement metrics.
- **Create Post Wizard**:
  - Dual modes: **Manual** and **AI-Assisted** creation with prompt ideation.
  - Real-time interactive **Instagram Mobile Feed Mockup** preview.
  - Dropzone media uploader with aspect ratio presets.
- **ImageKit AI Image Editor Modal**:
  - One-click AI magic tools: Remove Background, Cut Out + Shadow, 4x Upscale, Retouch.
  - Edit with prompt and AI background replacement.
  - Crop presets (1:1, 4:5, 9:16, 16:9) and image adjustments (brightness, contrast, saturation).
- **Interactive Content Calendar**:
  - Monthly and weekly grid views.
  - Scheduled post chips with thumbnail, platform badge, and publication time.
- **Analytics & Growth Dashboard**:
  - 4 Key KPI cards: Posts published, Total views, 100% publishing success rate, and Estimated time saved.
  - Daily posting volume bar chart and engagement metrics.
- **Settings & Blotato Integrations**:
  - Blotato API key configuration with masked key input.
  - Connected account cards for Instagram, TikTok, and YouTube.
  - **Human-in-the-Loop Approval Workflow** toggles ("Require approval" vs. "Auto-publish").
- **Campaign Switcher & Onboarding Wizard**:
  - Multi-campaign brand switcher in the sidebar.
  - 2-Step onboarding wizard with logo customization and choice between **Modern** and **Wooden** office spaces.
- **Accessibility & Productivity**:
  - Global `⌘K` Command Palette for quick search and navigation.
  - Collapsible floating sidebar (`⌘B`).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Components**: Radix-style accessible primitives, glassmorphism design tokens
- **Deployment & Containers**: Docker (Multi-stage standalone build) & Vercel GitHub Actions workflow

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18.17+ or 20+
- npm, pnpm, or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Aniket-Vadar/Social-Media-AI-Agent-Team--UI.git
cd Social-Media-AI-Agent-Team--UI

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the Agent Office!

---

## 🐳 Docker Setup

A multi-stage production Dockerfile is included using Next.js `standalone` mode for optimal container size.

### Build and Run with Docker

```bash
# Build the Docker image
docker build -t socialix-ui:latest .

# Run the container
docker run -p 3000:3000 socialix-ui:latest
```

Visit [http://localhost:3000](http://localhost:3000).

---

## ☁️ Vercel Deployment

A GitHub Actions workflow is provided in [`.github/workflows/vercel-deploy.yml`](.github/workflows/vercel-deploy.yml).

### Automated CI/CD
To enable automated deployments via GitHub Actions:
1. In your GitHub repository, navigate to **Settings > Secrets and variables > Actions**.
2. Add the following repository secrets:
   - `VERCEL_TOKEN`: Your Vercel Personal Access Token ([created here](https://vercel.com/account/tokens)).
   - `VERCEL_ORG_ID`: Your Vercel Organization / Team ID.
   - `VERCEL_PROJECT_ID`: Your Vercel Project ID.
3. Every push to the `main` branch will automatically build and deploy to Production on Vercel. Pull requests generate preview deployments.

---

## 📁 Repository Structure

```
.
├── .github/
│   └── workflows/
│       └── vercel-deploy.yml    # Vercel deployment GitHub Actions workflow
├── public/
│   ├── avatars/                 # Agent character avatars
│   └── images/                  # Isometric office graphics and sample posts
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx         # Overview Dashboard
│   │   │   ├── agents/          # AI Agent Workspace & tabs
│   │   │   ├── posts/           # Content Library & cards
│   │   │   ├── calendar/        # Content Calendar
│   │   │   ├── analytics/       # Analytics & KPI charts
│   │   │   └── settings/        # Integrations & account settings
│   │   ├── globals.css          # Design system & tokens
│   │   └── layout.tsx           # Root Layout
│   ├── components/
│   │   ├── layout/              # Sidebar & Header
│   │   ├── office/              # Interactive OfficeCanvas
│   │   └── modals/              # CreatePost, CreateCampaign, ImageEditor, etc.
│   ├── context/                 # AppContext global state
│   ├── data/                    # Initial mock data
│   └── types/                   # TypeScript interfaces
├── Dockerfile                   # Multi-stage production container
├── vercel.json                  # Vercel configuration
└── next.config.mjs              # Standalone Next.js config
```

---

## 📄 License
MIT
