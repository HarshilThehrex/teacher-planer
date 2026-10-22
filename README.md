# Teacher Planner

A responsive React + Vite planner for teachers. This starter version uses browser `localStorage` for persistence, so it can be run locally and deployed to Vercel without a backend.

## Features

- Demo sign-in and registration screens
- Dashboard with today's schedule, free periods, tasks, and upcoming events
- Monday–Saturday weekly timetable with add/edit/delete
- Lesson plans with status tracking
- Monthly academic calendar and event management
- Tasks and deadlines with completion status
- Free periods calculated from timetable slots
- Responsive layout for desktop, tablet, and mobile
- Sample data on first launch
- Exportable, simple browser-only data model

## Important security and storage note

This is a **single-browser prototype**, not production authentication. The login/register flow is a convenience gate for the demo; it stores a demo account record in `localStorage` and does not securely authenticate users. Data stays in the current browser profile and is not automatically synchronized across devices. Do not use it for confidential student or institutional data.

For a real multi-user deployment, replace the demo authentication and storage layer with Supabase Auth and database tables, and enforce row-level security (RLS).

## Requirements

- Node.js 18 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

To check the production build:

```bash
npm run build
npm run preview
```

## Upload to GitHub

1. Extract the ZIP.
2. Open the `teacher-planner` folder in a terminal.
3. Initialize a repository and commit the files:

   ```bash
   git init
   git add .
   git commit -m "Build Teacher Planner"
   ```
4. Create an empty repository on GitHub.
5. Connect and push (replace the placeholder with your repository URL):

   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
   git push -u origin main
   ```

Do not commit real secrets or `.env` files.

## Deploy on Vercel

1. Sign in to Vercel and choose **Add New → Project**.
2. Import the GitHub repository.
3. Vercel should detect Vite automatically. Use:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Click **Deploy**. The included `vercel.json` rewrites client-side paths to the app entry point.
5. When you push later commits to the connected GitHub branch, Vercel will rebuild and redeploy automatically.

No environment variables are required for this localStorage prototype.

## Supabase upgrade path

To make this a secure multi-user app:
1. Create a project in Supabase.
2. Enable Supabase Auth and configure allowed redirect URLs for local development and your Vercel domain.
3. Create tables for timetable entries, lesson plans, events, and tasks with a `user_id` UUID column referencing `auth.users`.
4. Enable RLS on every table and add policies so users can read/write only rows where `auth.uid() = user_id`.
5. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel Project Settings → Environment Variables, and use the same values in a local `.env` file. The anon/publishable key is intended for frontend use when RLS is configured; never expose a service-role key.
6. Replace the demo `localStorage` persistence functions with Supabase queries and replace demo login/register with Supabase Auth.

This starter intentionally does not pretend to provide secure authentication or cloud synchronization.

## Project structure

```text
teacher-planner/
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── .gitignore
├── .env.example
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    └── styles.css
```
