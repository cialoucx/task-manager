# The Daily Docket — Premium Fullstack SaaS Task Workspace

A professional-grade, fullstack task workspace built with React + Vite, Node.js + Express, and SQLite. Features standard layered architecture, multi-theme customization, real-time analytics, Kanban drag-and-drop board, keyboard shortcuts, custom toast notifications, and JWT authentication.

## 🚀 Key Features

1. **Layered API Architecture:** Clean separation of concerns: Routes → Controllers → Services → Models + DTO mappings and custom validation middleware.
2. **SaaS Dashboard Analytics:** Time-of-day greetings, task completion streaks, total/completed/remaining status counts, and relative progress bar.
3. **HTML5 Drag-and-Drop Board:** Organizes tasks by priority (Low, Medium, High). Move cards between columns to change priorities on-the-fly.
4. **JWT Authentication:** Signup and login flow with encrypted database storage, scoping tasks specifically to individual users.
5. **Interactive UI Modals:** "New Task" modal with priority and due date, and "Delete Confirmation" modals to prevent accidents.
6. **Themes Engine:** Persisted custom skins—choose between Light Mode, Slate Dark Mode, Retro warm paper, and Neon Hacker Terminal.
7. **Accessibility & Keyboard Shortcuts:** Focus rings and keyboard shortcuts: `N` (new task), `/` (focus search), and `ESC` (close modals).
8. **Toast Alerts & Micro-interactions:** Animated float notifications for task states. Hover lifts (scale 1.02, shadows), complete fades, and DND transitions.
9. **Optimistic Updates:** UI responds instantly on status toggling and deletions, rolling back state if the API fails.
10. **Interactive API Documentation:** Swagger UI served directly from the backend on `/docs`.
11. **Loading Skeletons:** Premium CSS-animated loading placeholders while data is fetched.
12. **Activity Logs Timeline:** Historical logs trace creation, status modifications, description edits, and deletions.

---

## 📂 Folder Structure

```
task-manager/
├── backend/
│   ├── data/                    # Persisted SQLite files
│   ├── src/
│   │   ├── controllers/         # Handles HTTP Request & Responses
│   │   ├── services/            # Main business logic layer
│   │   ├── models/              # Raw database query models
│   │   ├── dtos/                # Data Transfer Objects for serialization
│   │   ├── db/                  # SQLite db setup and automatic migrations
│   │   ├── middleware/          # JWT protection, custom validators, and central error handler
│   │   ├── app.js               # Express application initialization
│   │   └── swagger.js           # Swagger JSON spec and config
│   ├── tests/                   # Jest Integration Tests
│   ├── server.js                # App listener entry point
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                 # fetch() wrapper utilizing interceptors
│   │   ├── context/             # AuthContext and ThemeContext state managers
│   │   ├── components/          # KanbanBoard, TaskList, TaskModal, ConfirmModal, Toast, DashboardStats, Timeline
│   │   ├── App.jsx              # Core layout, views, and keyboard shortcuts
│   │   ├── App.css / index.css  # CSS custom properties variables, grids, and transitions
│   │   └── main.jsx
│   ├── Dockerfile
│   └── package.json
│
└── docker-compose.yml           # Runs the full stack instantly
```

---

## 🛠️ Tech Stack

- **Frontend:** React 19 + Vite + Framer Motion (animations) + Lucide (icons)
- **Backend:** Node.js + Express
- **Database:** SQLite (via `better-sqlite3`)
- **Testing:** Jest + Supertest
- **Containerization:** Docker + Docker Compose
- **API Docs:** Swagger

---

## ⚙️ Setup & Installation

### Option 1: Docker (Fastest)

Ensure Docker Desktop is running, then execute from the root directory:

```bash
docker-compose up --build
```

- **Frontend dev server:** [http://localhost:80](http://localhost:80)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **Interactive Swagger Docs:** [http://localhost:5000/docs](http://localhost:5000/docs)

### Option 2: Local Manual Setup

#### 1. Backend Setup

```bash
cd backend
npm install
npm start
```
- Creates `backend/data/tasks.db` automatically and runs migrations.
- Serves API on port `5000`.

#### 2. Frontend Setup

In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
- Serves Vite client on port `5173`.

---

## 🧪 Testing

We have included a comprehensive test suite in the backend directory checking registration, login constraints, protected routers, validation failures, and tasks CRUD.

Run the test suite:
```bash
cd backend
npm test
```

---

## 🗺️ API Reference

### Auth Endpoints
- `POST /api/auth/register` — Create user. Body: `{ "username": "...", "password": "..." }`
- `POST /api/auth/login` — Create token. Body: `{ "username": "...", "password": "..." }`

### Tasks Endpoints (Protected - Require Bearer Token)
- `GET /api/tasks` — List tasks. Params: `status` (`all`\|`active`\|`inactive`), `search`, `dueDateFilter` (`today`\|`week`\|`overdue`\|`high`), `sortBy` (`newest`\|`oldest`\|`priority`\|`dueDate`\|`alphabetical`).
- `POST /api/tasks` — Create task. Body: `{ "title": "...", "description": "...", "dueDate": "YYYY-MM-DD", "priority": "low|medium|high" }`
- `GET /api/tasks/:id` — Fetch task.
- `PUT /api/tasks/:id` — Update task details.
- `PATCH /api/tasks/:id/toggle` — Toggle complete state.
- `DELETE /api/tasks/:id` — Delete task.

### Activities Endpoints (Protected - Require Bearer Token)
- `GET /api/activity` — Fetch user activity timeline.
