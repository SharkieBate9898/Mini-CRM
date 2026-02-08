# Lead + Follow-Up Mini CRM (Local SQLite Version)

## 1) Project Overview
This is a production-ready MVP CRM designed for a solo real estate agent to track leads and follow-up tasks. It provides a lightweight pipeline board, lead detail records, interaction history, and a follow-up message generator (with optional AI). This app is built for local use with a SQLite database stored on disk.

**Who it’s for:** A solo real estate agent who wants a focused, local CRM with a clean workflow for managing leads and follow-ups.

**Key features:**
- Local email + password authentication.
- Kanban-style pipeline board with filters and reminders.
- Lead detail view with interactions, notes, and next actions.
- Follow-up generator with deterministic templates + optional AI.
- Seed script for demo data.

## 2) Tech Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- SQLite
- bcrypt
- OpenAI API (optional)

## 3) Setup Instructions
### Node.js version
- Node.js 18+ recommended.

### Install dependencies
```bash
npm install
```

### Environment variables
Create a `.env.local` file in the project root:
```bash
OPENAI_API_KEY=your_key_here
```
`OPENAI_API_KEY` is optional; if not provided, the follow-up generator uses built-in templates.

### SQLite database
- The SQLite file is created automatically at `/data/app.db`.
- The schema is defined in `/db/schema.sql` and applied on first database access.

### `/data` folder
- `/data` stores the local SQLite database file (`app.db`).
- You can safely delete the file during development to reset the database (then re-run seed).

## 4) Database Schema
Tables:
- **users**: stores user accounts (email + hashed password).
- **leads**: stores leads tied to a user with stage, source, next action, and notes.
- **interactions**: stores contact history per lead.

Schema file location: `/db/schema.sql`.

## 5) Running the App
### Dev mode
```bash
npm run dev
```

### Build for production
```bash
npm run build
npm run start
```

## 6) Seeding Data
Run the seed script to populate demo data:
```bash
npm run seed
```

**Demo credentials created by seed:**
- Email: `demo@mini-crm.local`
- Password: `password123`

## 7) Authentication Flow
- Users sign up or log in on `/login`.
- Passwords are hashed with bcrypt.
- A session token is stored in an HTTP-only cookie and validated server-side.
- Middleware checks for the session cookie on `/app` routes.
- Server components also verify sessions before rendering protected pages.

## 8) Project Structure
- `/app`: Next.js App Router routes and layouts.
- `/components`: Reusable UI components (forms, generator, modals).
- `/lib`: Database helpers, auth utilities, and lead logic.
- `/db`: SQL schema file (`schema.sql`).
- `/data`: Local SQLite file (`app.db`).
- `/scripts`: Seed script for demo data.

## 9) Future Improvements
- Migrate to Postgres for multi-user hosting.
- Add notifications (email/SMS) for upcoming follow-ups.
- Mobile-first interface for on-the-go updates.
- Multi-user team support with role-based access.
