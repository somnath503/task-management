<div align="center">
  <h1>Task Management</h1>
  <p><strong>A highly scalable, full-stack project and task management ecosystem.</strong></p>

  <p>
    <a href="https://task-management-able.netlify.app/login" target="_blank">
      <img src="https://img.shields.io/badge/Live_Preview-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white" alt="Live Preview" />
    </a>
    <a href="https://github.com/somnath503/task-management" target="_blank">
      <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repository" />
    </a>
    <a href="https://github.com/somnath503/task-management/actions" target="_blank">
      <img src="https://img.shields.io/badge/CI%2FCD_Pipeline-Passing-success?style=for-the-badge&logo=githubactions&logoColor=white" alt="CI/CD Passing" />
    </a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  </p>
</div>

> **👋 Note to Reviewers:**
> Built with a focus on modern web standards, modular architecture, and edge-case handling. Below: architecture, setup, and engineering highlights.

---

## 📑 Table of Contents
1. [🚀 Live Deployment](#-live-deployment)
2. [🏗 Architecture & Tech Stack](#-architecture--tech-stack)
3. [✨ Engineering Highlights](#-engineering-highlights-for-reviewers)
4. [💻 Local Setup & Installation](#-local-setup--installation)
5. [🔐 Environment Variables](#-environment-variables)
6. [📂 Project Structure](#-project-structure)
7. [📡 API Reference](#-api-reference)

---

## 🚀 Live Deployment

- **🎨 Frontend (Netlify):** [task-management-able.netlify.app/login](https://task-management-able.netlify.app/login)
- **⚙️ Backend (Render):** `https://task-management-b7rn.onrender.com`
- **🗄️ Database:** PostgreSQL (Neon)

---

## 🏗 Architecture & Tech Stack

Decoupled monorepo — client and server scale and deploy independently.

**Frontend**
- Next.js 14 (App Router)
- Tailwind CSS + custom CSS variables for dynamic theming
- React Hooks + custom event dispatchers for state
- Axios API client with centralized JWT interceptors
- Lucide React icons

**Backend**
- NestJS (Node.js)
- Prisma ORM
- PostgreSQL
- Stateless JWT authentication

---

## ✨ Highlights

🟢 **Strict Payload Validation** — Prisma schemas and NestJS controllers validate UUID formats, coerce `undefined` to `null`, and block non-schema fields — zero `500` errors in normal operation.

🔵 **Optimistic UI & Event-Driven State** — Native `window.dispatchEvent` listeners instead of Redux; Sidebar and Navbar update instantly on profile changes, no refresh needed.

🟣 **Centralized API Interceptor** — `api.ts` auto-injects the JWT on every request and resolves the base URL per environment.

🟠 **Dynamic UI Engine** — Light/Dark/System theming via `next-themes`, plus a dynamic accent-color system (avatars, buttons, active states) stored in Local Storage.

🟢 **DevOps & CI/CD Pipelines** — Implemented GitHub Actions for continuous integration. The pipeline automatically provisions an Ubuntu runner, sets up Node.js, installs dependencies, generates Prisma clients, and compiles the code to ensure production stability before deployment.

---

## 💻 Local Setup & Installation

**Prerequisites:** Node.js v18+, npm or yarn, PostgreSQL

**1. Clone**
```bash
git clone https://github.com/somnath-pandit/ablespace-assessment.git
cd ablespace-assessment
```

**2. Backend**
```bash
cd backend
npm install
npx prisma db push
npx prisma generate
npm run start:dev
```
Runs on `http://localhost:3001`.

**3. Frontend** (new terminal)
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:3000`.

---

## 🔐 Environment Variables

**`backend/.env`**

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | Secret key for signing tokens | `super_secret_key_123` |
| `PORT` | Backend port | `3001` |

**`frontend/.env.local`**

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL of the NestJS backend | `http://localhost:3001` (dev) / `https://task-management-b7rn.onrender.com` (prod) |

---

## 📂 Project Structure

```
ablespace-assessment/
├── backend/                  # NestJS API
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── auth/             # JWT auth logic
│   │   ├── projects/         # Project CRUD
│   │   ├── tasks/            # Task CRUD
│   │   └── users/            # Profile management
│   └── main.ts
│
└── frontend/                 # Next.js client
    ├── public/
    ├── src/
    │   ├── app/               # App Router pages
    │   ├── components/        # Reusable UI (Sidebar, Modals)
    │   └── lib/                # Utils (api.ts interceptor)
    ├── tailwind.config.ts
    └── netlify.toml           # CI/CD config
```

---

## 📡 API Reference

**Auth & Users**
- `POST /auth/guest` — generates a new guest user, returns a JWT
- `GET /users/me` — fetches the authenticated user's profile
- `PATCH /users/me` — updates profile details (name, title, email)

**Projects**
- `GET /projects` — fetches all projects
- `POST /projects` — creates a project
- `PATCH /projects/:id` — updates a project
- `DELETE /projects/:id` — deletes a project

**Tasks**
- `GET /tasks` — fetches all tasks
- `POST /tasks` — creates a task (Backlog / In Progress / Completed)
- `PATCH /tasks/:id` — updates task status or details
- `DELETE /tasks/:id` — deletes a task