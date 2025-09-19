# Scout AI Awareness Event Platform 🚀

A comprehensive web application for managing AI awareness training events at Bangladesh Scout Training Centers. Built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## 🎯 Features

### Team Portal
- **Team Registration & Login**: Teams can register with unique codes (e.g., A-01) and team names
- **4 AI-Awareness Sprints**: Interactive activities teaching AI concepts through gamification
  - Sprint 1: Pattern Hunt (Supervised Learning)
  - Sprint 2: Reward Runner (Reinforcement Learning)
  - Sprint 3: Bias Detective (Fairness in AI)
  - Sprint 4: Reality Check (Deepfakes & Safety)
- **Interactive Question Types**: MCQ, Checkbox, True/False, and Grid Path-finding
- **Visual Explanations**: Rich visual feedback after submission with educational explanations
- **Real-time Progress Tracking**: Teams can see their scores and completion status

### Admin Portal
- **Event Management**: Open/close events, control activity availability
- **Activity Management**: Create and edit activities with AI-generated answer keys
- **Leaderboard Control**: Toggle visibility between admin-only and public viewing
- **Real-time Monitoring**: Live dashboard with team statistics and progress
- **Data Export**: Export results to CSV for analysis

### Security & Fairness
- **Server-side Scoring**: All scoring happens on the server for security
- **Frozen Activities**: Once AI keys are generated, activities are frozen for fairness
- **JWT Authentication**: Secure token-based authentication for teams and admins
- **Rate Limiting**: Prevents spam submissions and ensures fair play

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT (jose library)
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites
- Node.js 18+
- Docker (for PostgreSQL)
- npm or yarn

### Setup Steps

1. **Clone the repository**
```bash
cd scout-event
```

2. **Install dependencies**
```bash
npm install
```

3. **Start PostgreSQL database**
```bash
docker-compose up -d
```

4. **Set up environment variables**
```bash
cp env.example .env
# Edit .env with your configuration
```

5. **Run database migrations**
```bash
npx prisma migrate dev
```

6. **Seed the database with initial data**
```bash
npx tsx src/lib/seed.ts
```

7. **Start the development server**
```bash
npm run dev
```

The application will be available at http://localhost:3000

## 🔑 Default Credentials

### Admin Login
- Email: admin@scout.event
  (Set your own secure admin credentials via environment variables. Do not use defaults in production.)

### Team Registration
- Format: Letter-Number (e.g., A-01, B-12)
- Teams create their own display names

## 📱 Application Structure

```
/                       # Home page with portals
/team                   # Team login/registration
/team/activities        # Activity dashboard
/team/activities/[id]   # Individual activity with questions
/team/leaderboard       # Team leaderboard (if enabled)
/admin                  # Admin login
/admin/dashboard        # Admin control panel
/admin/leaderboard      # Detailed leaderboard with analytics
```

## 🎮 Activity Types

### MCQ (Multiple Choice)
- Single correct answer from multiple options
- Visual feedback with decision rules

### Checkbox
- Multiple correct answers
- Partial or exact scoring options

### True/False
- Binary choice questions
- Concept explanations

### Grid Path
- Interactive path-finding puzzle
- Reinforcement learning concepts
- Visual grid with obstacles and rewards

## 🏆 Scoring System

- **Automatic Scoring**: Server-side validation and scoring
- **Instant Feedback**: Educational explanations after submission
- **Fair Ranking**: Time-based tiebreakers for equal scores
- **Progress Tracking**: Real-time score updates

## 🔒 Security Features

- JWT-based authentication
- Server-side answer validation
- Rate limiting on submissions
- Secure session management
- Input validation with Zod schemas

## 📊 Database Schema

The application uses Prisma with PostgreSQL, featuring:
- User management (Teams & Admins)
- Event configuration
- Activity and Question models
- Submission tracking
- Score aggregation
- Configuration storage

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Netlify (Serverless)

1. Add environment variables in Netlify → Site settings → Environment variables:
- `DATABASE_URL`
- `JWT_SECRET`
- `SESSION_SECRET`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `OPENAI_API_KEY` (optional)

2. Ensure your PostgreSQL is managed (Supabase/Neon/Railway) and push schema:
```bash
npx prisma db push
npx tsx src/lib/seed.ts
```

3. Repo must contain `netlify.toml`. Netlify will run `npm run build` and the Next.js plugin will output functions.

4. Deploy: Connect repository in Netlify UI or run locally:
```bash
npm i -g netlify-cli
netlify deploy --prod
```

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT signing
- `SESSION_SECRET`: Session encryption key
- `OPENAI_API_KEY`: For AI answer generation (optional)

## 📈 Features for Event Day

1. **Pre-Event Setup**
   - Admin creates activities
   - Generates AI answer keys
   - Freezes activities

2. **During Event**
   - Teams register with codes
   - Complete activities sequentially
   - View progress (leaderboard if enabled)

3. **Post-Event**
   - Export results to CSV
   - Analyze team performance
   - Generate certificates (extensible)

## 🧪 Testing Features

The application has been thoroughly tested with:
- Database seeding with sample activities
- All question types functional
- Scoring engine validated
- Authentication flow tested
- Responsive design verified

## 🎨 UI/UX Features

- **Mobile-First Design**: Optimized for shared devices
- **Intuitive Navigation**: Clear flow for teams
- **Visual Feedback**: Rich animations and transitions
- **Educational Focus**: Explanations prioritize learning
- **Accessibility**: High contrast, clear typography

## 📝 Notes

- The application is production-ready
- Supports ~50 teams (400 students)
- Low-latency design for shared devices
- Extensible for additional activity types

## 🤝 Contributing

This is an educational project for Scout training centers. Contributions that enhance the learning experience are welcome!

## 📄 License

Created for Bangladesh Scout Training Centers - Educational Use

---

**Always Works™** - Built with comprehensive testing and validation to ensure reliable operation during events.# scout-event
# scout-event
# scout-event
