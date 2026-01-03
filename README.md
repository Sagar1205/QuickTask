## ✅ QuickTask
QuickTask is a modern task management application built with Next.js (App Router), Supabase, Tailwind CSS, and DnD Kit.
It supports authentication, collaborative task lists, real-time updates, drag-and-drop ordering, and dark mode.

### 1. 🧱 Tech Stack
* **Frontend:** Next.js, Tailwind CSS, Typescript, React Context
* **Backend:** Supabase API, Supabase realTime
* **Authentication:** Supabase Auth
* **Deployment:** Vercel

### 2. ✨ Features

#### 🔐 Authentication
- Email/password login & registration

#### 📋 Task Lists
- Create, edit, delete lists
- Real-time updates using Supabase Realtime

#### 📝 Tasks
- Add, edit, delete & complete tasks
- Drag & drop reordering

#### 👥 Collaboration
- Share lists with other users
- View list members
- Owner-based permissions

#### 🌗 Dark Mode
- Supports Dark & light theme
- Theme-aware style

#### 📱 Responsive Design
- Mobile-friendly UI
- Optimized header & interactions for small screens
- 🔔 Toast Notifications

### 3. 🚀 Getting Started
#### Install dependencies
```
npm install
```
#### Environment Variables
Refer to .env.example. For local development, rename it to .env.local and configure:
```
NEXT_PUBLIC_SUPABASE_URL=supabase_data_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=supabase_publishable_key
```
#### Start the app
```
npm run dev
```
