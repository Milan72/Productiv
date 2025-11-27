
# Personal OS

Your Life. Simplified. Track budgets, habits, notes, and workouts all in one beautiful place.

A full-stack personal productivity application built with Next.js, featuring authentication, database persistence, and a beautiful dark-themed UI matching the Figma design.

## Features

### Core Features
- **Authentication**: Secure login and registration system
- **Dashboard**: Real-time performance metrics, balance tracking, and daily priorities
- **Goals & OKRs**: Set and track objectives with progress monitoring
- **Habits**: Build and maintain daily habits with streak tracking
- **Ledger**: Track income and expenses with category management
- **Daily Log**: Journal your thoughts and experiences
- **Exercise**: Log workouts and track fitness activities
- **Network**: Manage contacts and professional connections
- **Weekly Review**: Reflect on your week and plan ahead
- **AI Advisor**: Coming soon - AI-powered insights
- **Profile**: View statistics and manage your account

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Database ORM
- **SQLite** - Database (easily upgradeable to PostgreSQL)
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Set up the database**:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. **Run the development server**:
```bash
npm run dev
```

6. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

### First Steps

1. **Register an account** on the welcome screen
2. **Login** with your credentials
3. **Explore the dashboard** and start adding your data
4. **Create goals, habits, and track your progress**

## Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── goals/             # Goals CRUD
│   │   ├── habits/            # Habits CRUD
│   │   ├── transactions/      # Financial transactions
│   │   ├── daily-logs/        # Journal entries
│   │   ├── exercises/          # Workout tracking
│   │   ├── contacts/           # Network management
│   │   ├── weekly-reviews/     # Weekly reflections
│   │   └── dashboard/          # Dashboard stats
│   ├── dashboard/             # Dashboard page
│   ├── goals/                 # Goals & OKRs page
│   ├── habits/                # Habits page
│   ├── ledger/                # Financial ledger
│   ├── daily-log/             # Daily journal
│   ├── exercise/              # Exercise tracking
│   ├── network/               # Contacts page
│   ├── weekly-review/         # Weekly review
│   ├── ai-advisor/            # AI Advisor (coming soon)
│   ├── profile/               # User profile
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Welcome/home page
│   └── globals.css            # Global styles
├── components/
│   ├── AuthLayout.tsx         # Protected route wrapper
│   ├── WelcomeScreen.tsx     # Welcome/login screen
│   ├── LoginForm.tsx          # Login form
│   ├── RegisterForm.tsx       # Registration form
│   ├── Sidebar.tsx            # Navigation sidebar
│   ├── PerformanceCard.tsx   # Performance widget
│   ├── BalanceCard.tsx        # Balance widget
│   ├── BudgetCard.tsx         # Budget widget
│   └── PriorityItem.tsx       # Priority item component
├── contexts/
│   └── AuthContext.tsx       # Authentication context
├── lib/
│   ├── prisma.ts              # Prisma client
│   ├── auth.ts                # Auth utilities
│   └── utils.ts               # Helper functions
├── prisma/
│   └── schema.prisma          # Database schema
└── package.json
```

## Database Schema

The application uses Prisma with SQLite and includes models for:
- **User** - Authentication and user data
- **Goal** - Objectives and targets
- **OKR** - Key results for goals
- **Habit** - Daily habits with streak tracking
- **HabitCompletion** - Habit completion records
- **Transaction** - Income and expense records
- **DailyLog** - Journal entries
- **Exercise** - Workout records
- **Contact** - Network contacts
- **WeeklyReview** - Weekly reflection entries
- **Priority** - Daily priorities

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Resources
All resources follow RESTful conventions:
- `GET /api/{resource}` - List all
- `POST /api/{resource}` - Create new
- `GET /api/{resource}/[id]` - Get one
- `PUT /api/{resource}/[id]` - Update
- `DELETE /api/{resource}/[id]` - Delete

## Development

### Database Migrations
```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (development only)
npx prisma migrate reset
```

### View Database
```bash
# Open Prisma Studio
npx prisma studio
```


