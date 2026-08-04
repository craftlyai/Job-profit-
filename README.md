# JobProfit — Job Cost Tracker & Invoice Tool

A complete mobile-first web application for independent contractors (plumbers, electricians, HVAC, remodelers) to track job costs, calculate profit margins, and generate professional PDF invoices.

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **PDF Generation:** jsPDF (client-side)
- **Icons:** Lucide React

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project (free tier)
2. Once your project is ready, go to **Project Settings → API**
3. Copy your **Project URL** and **anon/public** API key
4. Create a `.env` file in the project root:

```bash
cp .env.example .env
```

5. Paste your credentials into `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run the Database Schema

1. In your Supabase dashboard, go to the **SQL Editor**
2. Open the file `/supabase/schema.sql` from this project
3. Copy the entire contents and paste into the SQL Editor
4. Click **Run** — this creates all tables, RLS policies, and triggers

### 4. Set Up Storage (for logo uploads)

1. In Supabase dashboard, go to **Storage**
2. Click **New Bucket**
3. Name it `logos`
4. Set it to **Public**
5. The RLS policies in `schema.sql` will handle permissions automatically

### 5. Run the App Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 6. Build for Production

```bash
npm run build
```

This creates a `dist/` folder ready for deployment.

---

## Deploy on Netlify

### Option A: Drag & Drop (Quickest)

1. Run `npm run build` locally
2. Go to [netlify.com](https://netlify.com) and log in
3. Drag the `dist/` folder onto your Netlify dashboard
4. Your site is live!

### Option B: Git-based Deploy (Recommended)

1. Push this project to a GitHub/GitLab repository
2. In Netlify, click **Add new site → Import an existing project**
3. Connect your Git provider and select the repo
4. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **Deploy Site**
6. Go to **Site settings → Environment variables** and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Redeploy if needed

---

## Features

- **Auth:** Email/password signup and login
- **Job Management:** Create, edit, and track jobs
- **Materials Tracking:** Log materials with quantity, unit, and cost
- **Labor Tracking:** Log worker hours and rates
- **Auto-Calculations:** Real-time cost and profit calculations
- **Profit Analysis:** Visual profit/loss indicators with margin percentages
- **PDF Invoices:** Generate professional, downloadable invoices
- **Status Workflow:** In Progress → Completed → Invoiced → Paid
- **Profile Settings:** Business info, logo upload, default rates, payment instructions
- **Mobile-First:** Optimized for iPhone/Android (375px–430px)

---

## Project Structure

```
jobprofit/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── .env.example
├── README.md
├── supabase/
│   └── schema.sql
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── lib/
    │   ├── supabase.js
    │   └── calculations.js
    ├── components/
    │   ├── Navbar.jsx
    │   ├── JobCard.jsx
    │   ├── CostSummaryBox.jsx
    │   └── InvoiceTemplate.jsx
    └── pages/
        ├── Login.jsx
        ├── Dashboard.jsx
        ├── CreateJob.jsx
        ├── JobDetail.jsx
        ├── InvoiceView.jsx
        └── Profile.jsx
```

---

## License

MIT — Free to use for your contracting business.
