# 📅 ParseCal

> *Turn PDFs, images, and text into calendar events — powered by AI.*

Ever received a class timetable as a PDF and wished it would just *appear* in your calendar? Yeah, me too. That's why I built ParseCal.

Drop in any schedule — a university timetable, conference agenda, meeting list, or just some messy text — and let AI do the heavy lifting. Review the extracted events, tweak what you need, and push them straight to Google Calendar. Done.

---

## ✨ Features

- 📄 **Multi-format input** — Upload PDFs, images, or paste plain text
- 🤖 **AI-powered parsing** — Gemini (primary), OpenAI, and Claude with automatic fallback
- ✏️ **Event review & editing** — Edit titles, dates, times, location, description, and recurrence rules before pushing
- 📆 **Google Calendar push** — OAuth2-based integration to push events directly
- 📥 **ICS export** — Download `.ics` files for any calendar app
- 🔍 **Session management** — Search, filter by status, multi-select, and bulk delete
- 🏷️ **Auto-generated titles** — Session names derived from filenames or content
- 🚦 **Rate limiting** — Per-user, per-IP, and global daily limits
- 🔐 **Auth** — Supabase-based email authentication

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Auth & DB | Supabase (PostgreSQL, Auth, Storage) |
| AI | Google Gemini, OpenAI, Anthropic Claude |
| Calendar | Google Calendar API, ical-generator |
| Validation | Zod |
| Icons | Lucide React |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- At least one AI provider API key (Gemini recommended)
- Google Cloud project with Calendar API enabled (for push)

### 1. Clone & install

```bash
git clone https://github.com/nodesagar/parsecal.git
cd parsecal
npm install
```

### 2. Environment variables

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_UPLOADS_BUCKET=uploads

# AI Providers (at least one required)
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Google Calendar OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/calendar/google/callback
```

### 3. Database setup

Run the migrations in your Supabase SQL Editor:

```sql
-- Run the contents of:
-- supabase/migrations/001_initial_schema.sql
-- supabase/migrations/002_add_session_title.sql
-- supabase/migrations/003_add_uploads_storage_bucket.sql
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, signup, auth callback
│   ├── (protected)/      # Dashboard, parse review, settings
│   └── api/              # Parse, calendar push/export, auth
├── components/
│   └── dashboard/        # Session list (search, filters, multi-select)
├── lib/
│   ├── ai/               # Provider abstraction (Gemini, OpenAI, Claude)
│   ├── calendar/          # Google Calendar integration
│   └── supabase/          # Client, server, middleware helpers
└── types/                 # TypeScript types
```

## 🧠 How It Works

1. **Upload** a PDF, image, or paste text on the parse page
2. **AI extracts** structured events (title, date, time, location, recurrence)
3. **Review & edit** events — adjust details, add custom recurrence rules
4. **Push** to Google Calendar or **export** as `.ics`

## 💡 Why I Built This

I kept getting schedules in formats that were anything but calendar-friendly — PDFs from university, event flyers, text dumps from group chats. Manually creating each event felt like a crime against productivity. So I built a tool to do it for me. If it saves you even 10 minutes, it was worth it.

---

## 📬 Let's Connect!

If you like this project or want to chat about web dev, AI, or side projects — reach out!

- **X (Twitter):** [@nodesagar](https://twitter.com/nodesagar)
- **LinkedIn:** [in/nodesagar](https://linkedin.com/in/nodesagar)
- **Instagram:** [@nodesagar](https://instagram.com/nodesagar)
- **GitHub:** [@nodesagar](https://github.com/nodesagar)

---

<div align="center">

Built with ❤️ and ☕ by **Sagar**

*If you found this project cool, consider giving it a ⭐!*

</div>
